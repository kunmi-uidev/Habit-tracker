/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { HomeView } from './views/Home';
import { ProgressView } from './views/Progress';
import { Navigation } from './components/Navigation';
import { AddHabitForm } from './components/AddHabitForm';
import { Habit, ViewType } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from './lib/firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth';
import { habitService } from './services/habitService';
import { soundService } from './lib/sounds';
import confetti from 'canvas-confetti';
import { NotificationView } from './views/Notification';
import { notificationService, NotificationItem } from './services/notificationService';

const INITIAL_HABITS: Habit[] = [
  {
    id: 'demo-1',
    title: 'Walk 1km everyday.',
    icon: 'run',
    completedDays: [true, true, true, true, false, false, false],
    isCompletedToday: false,
    streak: 4
  },
  {
    id: 'demo-2',
    title: 'Drink 3.5 litres of water today',
    icon: 'water',
    completedDays: [true, true, true, true, false, false, false],
    isCompletedToday: false,
    streak: 4
  }
];

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [habits, setHabits] = useState<Habit[]>(INITIAL_HABITS);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [pushPermission, setPushPermission] = useState<'granted' | 'denied' | 'default' | 'unsupported'>('default');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const userId = user ? user.uid : null;
    const unsub = notificationService.subscribeToNotifications(userId, (items) => {
      setNotifications(items);
    });
    setPushPermission(notificationService.getPushPermissionStatus());
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) {
      setHabits(INITIAL_HABITS);
      return;
    }

    const unsubscribe = habitService.subscribeToHabits(user.uid, (data) => {
      if (data.length > 0) {
        setHabits(data);
      } else {
        // Bootstrap with demo data if empty
        INITIAL_HABITS.forEach(h => {
          const { id, ...rest } = h;
          habitService.addHabit(user.uid, rest as any);
        });
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleToggleHabit = async (id: string) => {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    const isCompletedNow = !habit.isCompletedToday;
    const newCompletedDays = [...habit.completedDays];
    // Friday index 4 for demo/image matching
    newCompletedDays[4] = isCompletedNow;

    if (isCompletedNow) {
      soundService.playSuccess();
      notificationService.addNotification(user ? user.uid : null, {
        title: "Habit Checked Off! 🎉",
        body: `Splendid effort! You checked off "${habit.title}" today.`,
        type: 'congratulations'
      });
    }

    if (user && !id.startsWith('demo-')) {
      await habitService.updateHabit(user.uid, id, {
        isCompletedToday: isCompletedNow,
        completedDays: newCompletedDays,
        streak: isCompletedNow ? habit.streak + 1 : habit.streak - 1
      });
    } else {
      // Local state for demo mode
      setHabits(prev => prev.map(h => h.id === id ? {
        ...h,
        isCompletedToday: isCompletedNow,
        completedDays: newCompletedDays,
        streak: isCompletedNow ? h.streak + 1 : h.streak - 1
      } : h));
    }
  };

  const handleAddHabit = async (habitData: { title: string; icon: string }) => {
    soundService.playPop();
    const newHabit: Omit<Habit, 'id'> = {
      ...habitData,
      completedDays: [false, false, false, false, false, false, false],
      isCompletedToday: false,
      streak: 0
    };

    if (user) {
      await habitService.addHabit(user.uid, newHabit);
    } else {
      const demoHabit: Habit = {
        ...newHabit,
        id: `demo-${Date.now()}`
      };
      setHabits(prev => [...prev, demoHabit]);
    }

    notificationService.addNotification(user ? user.uid : null, {
      title: "New Target Set! 🎯",
      body: `You began tracking "${habitData.title}". Success lies in consistency!`,
      type: 'motivation'
    });
  };

  const handleDeleteHabit = async (id: string) => {
    if (user && !id.startsWith('demo-')) {
      await habitService.deleteHabit(user.uid, id);
    } else {
      setHabits(prev => prev.filter(h => h.id !== id));
    }
  };

  const handleDeleteAttempt = (id: string) => {
    const item = habits.find(h => h.id === id);
    if (item) {
      setHabitToDelete(item);
    }
  };

  const completedTodayCount = habits.filter(h => h.isCompletedToday).length;
  const totalHabitsCount = habits.length;
  const dailyProgress = totalHabitsCount > 0 ? Math.round((completedTodayCount / totalHabitsCount) * 100) : 0;
  const [hasLoadedInitially, setHasLoadedInitially] = useState(false);

  useEffect(() => {
    if (!loading && !hasLoadedInitially) {
      setHasLoadedInitially(true);
      return;
    }

    if (hasLoadedInitially && dailyProgress === 100 && habits.length > 0) {
      soundService.playCheer();
      
      notificationService.addNotification(user ? user.uid : null, {
        title: "Daily Goal Secured! 🔥",
        body: "Phenomenal! You've accomplished 100% of your habits today. Daily streak checked off!",
        type: 'streak'
      });
      
      const localCanvas = document.createElement('canvas');
      localCanvas.style.position = 'fixed';
      localCanvas.style.top = '0';
      localCanvas.style.left = '0';
      localCanvas.style.width = '100vw';
      localCanvas.style.height = '100vh';
      localCanvas.style.pointerEvents = 'none';
      localCanvas.style.zIndex = '99999';
      document.body.appendChild(localCanvas);

      try {
        const customConfetti = confetti.create(localCanvas, {
          resize: true,
          useWorker: false,
        });

        customConfetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#141414', '#ffffff', '#FFD700']
        });

        setTimeout(() => {
          try {
            customConfetti.reset();
            localCanvas.remove();
          } catch (err) {
            console.error('Error cleaning up confetti canvas:', err);
          }
        }, 5000);
      } catch (err) {
        console.error('Failed to trigger custom confetti:', err);
        localCanvas.remove();
      }
    }
  }, [dailyProgress, loading]); // Trigger when dailyProgress changes after initial load

  const handleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).catch(console.error);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-8 h-8 border-4 border-[#141414] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-[12px]">
      <div className="max-w-md mx-auto relative min-h-screen pb-12">
        {!user && (
          <div className="px-4 py-4 fixed top-0 left-0 right-0 z-50 flex justify-end">
            <button 
              onClick={handleLogin}
              className="bg-[#141414] text-white px-4 py-2 rounded-full text-[12px] font-medium"
            >
              Sync with Firebase
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <HomeView 
                habits={habits} 
                onToggleHabit={handleToggleHabit} 
                onAddHabit={() => setIsAddingHabit(true)} 
                onDeleteHabit={handleDeleteAttempt}
                dailyProgress={dailyProgress}
              />
            </motion.div>
          )}

          {currentView === 'progress' && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <ProgressView 
                habits={habits} 
                onToggleHabit={handleToggleHabit} 
                onDeleteHabit={handleDeleteAttempt}
                dailyProgress={dailyProgress}
              />
            </motion.div>
          )}

          {currentView === 'notification' && (
            <motion.div
              key="notification"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
            >
              <NotificationView 
                notifications={notifications}
                userId={user ? user.uid : null}
                onMarkAsRead={(id) => notificationService.markAsRead(user ? user.uid : null, id)}
                onMarkAllAsRead={() => notificationService.markAllAsRead(user ? user.uid : null, notifications)}
                onDeleteNotification={(id) => notificationService.deleteNotification(user ? user.uid : null, id)}
                onClearAll={() => notificationService.clearAll(user ? user.uid : null, notifications)}
                onSimulateMotivation={() => notificationService.generateMotivationalAlert(user ? user.uid : null)}
                onSimulateReminder={() => notificationService.generateReminderAlert(user ? user.uid : null)}
                pushPermissionStatus={pushPermission}
                onRequestPermission={async () => {
                  const perm = await notificationService.requestPushPermission();
                  setPushPermission(perm);
                }}
              />
            </motion.div>
          )}

          {currentView === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-[80vh] text-[#141414]/40 font-medium"
            >
              Profile view coming soon
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isAddingHabit && (
            <AddHabitForm 
              onAdd={handleAddHabit} 
              onClose={() => setIsAddingHabit(false)} 
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {habitToDelete && (
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
              {/* Underlay */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setHabitToDelete(null)}
                className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
              />
              
              {/* Dialog Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                className="relative bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl space-y-6 z-10 border border-neutral-100"
              >
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                    <Trash2 className="w-6 h-6 animate-pulse" />
                  </div>
                  <h3 className="text-[17px] font-bold text-[#141414] tracking-tight font-sans">Delete Habit?</h3>
                  <p className="text-[11.5px] text-[#141414]/45 px-4 leading-relaxed font-sans">
                    You are about to delete <span className="font-semibold text-neutral-800">"{habitToDelete.title}"</span>. This will erase all of its historic records and daily progress streak.
                  </p>
                </div>

                <div className="flex flex-col gap-2.5">
                  {/* Cancel button is dominant - we want to steer them away from deleting */}
                  <button
                    onClick={() => setHabitToDelete(null)}
                    className="w-full bg-[#141414] hover:bg-[#141414]/90 text-white font-bold py-3.5 rounded-[18px] text-[13px] transition-all hover:scale-[1.01] active:scale-95 shadow-sm font-sans"
                  >
                    No, Keep Tracking
                  </button>
                  
                  {/* Delete button matches secondary theme */}
                  <button
                    onClick={async () => {
                      await handleDeleteHabit(habitToDelete.id);
                      notificationService.addNotification(user ? user.uid : null, {
                        title: "Deleted Tracked Habit 🗑️",
                        body: `"${habitToDelete.title}" has been successfully deleted from your habits.`,
                        type: 'reminder'
                      });
                      setHabitToDelete(null);
                    }}
                    className="w-full text-red-500/85 hover:text-red-700 hover:bg-red-50 font-semibold py-2.5 rounded-[18px] text-[12px] transition-all active:scale-95 font-sans"
                  >
                    Yes, Delete Habit
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <Navigation 
          currentView={currentView} 
          onViewChange={setCurrentView} 
          onAddClick={() => setIsAddingHabit(true)} 
          unreadCount={notifications.filter(n => !n.isRead).length}
        />
      </div>
    </div>
  );
}
