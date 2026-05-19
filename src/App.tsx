/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { HomeView } from './views/Home';
import { ProgressView } from './views/Progress';
import { Navigation } from './components/Navigation';
import { AddHabitForm } from './components/AddHabitForm';
import { Habit, ViewType } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from './lib/firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth';
import { habitService } from './services/habitService';

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

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

  const handleAddHabit = async (habitData: { title: string; icon: 'run' | 'water' }) => {
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
  };

  const handleDeleteHabit = async (id: string) => {
    if (user && !id.startsWith('demo-')) {
      await habitService.deleteHabit(user.uid, id);
    } else {
      setHabits(prev => prev.filter(h => h.id !== id));
    }
  };

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
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto relative min-h-screen pb-20">
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
                onDeleteHabit={handleDeleteHabit}
              />
            </motion.div>
          )}

          {(currentView === 'notification' || currentView === 'profile') && (
            <motion.div
              key="others"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-[80vh] text-[#141414]/40 font-medium"
            >
              {currentView.charAt(0).toUpperCase() + currentView.slice(1)} view coming soon
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

        <Navigation currentView={currentView} onViewChange={setCurrentView} onAddClick={() => setIsAddingHabit(true)} />
      </div>
    </div>
  );
}
