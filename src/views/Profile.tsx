import { useState, FormEvent } from 'react';
import { User, LogIn, LogOut, CheckCircle, Flame, Target, ChevronRight, Edit3 } from 'lucide-react';
import { motion } from 'motion/react';
import { auth } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, User as FirebaseUser } from 'firebase/auth';
import { Habit } from '../types';
import { Header } from '../components/Header';
import { cn } from '../lib/utils';
import { soundService } from '../lib/sounds';

interface ProfileProps {
  user: FirebaseUser | null;
  username: string;
  onChangeUsername: (name: string) => void;
  habits: Habit[];
  onLogin: () => void;
}

export function ProfileView({ user, username, onChangeUsername, habits, onLogin }: ProfileProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(username);

  // Statistics calculations
  const totalHabits = habits.length;
  const completedToday = habits.filter(h => h.isCompletedToday).length;
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);

  const handleSaveName = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = tempName.trim();
    if (trimmed) {
      onChangeUsername(trimmed);
      setIsEditingName(false);
      soundService.playSuccess();
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      soundService.playPop();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="pb-16">
      <Header title="Your Profile" />

      <main className="px-4 space-y-6">
        {/* User Card */}
        <div className="bg-[#F8F8F8] border border-[#141414]/5 rounded-[24px] p-6 flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#141414] rounded-2xl flex items-center justify-center overflow-hidden border border-[#141414]/5 shrink-0">
              {user?.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={username} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User className="text-white w-7 h-7" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              {isEditingName ? (
                <form onSubmit={handleSaveName} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="flex-1 bg-white border border-[#141414]/10 text-[13px] text-[#141414] rounded-[12px] px-3 py-1.5 outline-none focus:border-[#141414] font-sans"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="bg-[#141414] text-white text-[11px] font-bold px-3 py-1.5 rounded-[12px] transition-all hover:scale-[1.02] active:scale-95 font-sans whitespace-nowrap"
                  >
                    Save
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => {
                  setTempName(username);
                  setIsEditingName(true);
                }}>
                  <h2 className="text-[17px] font-bold text-[#141414] tracking-tight truncate">{username || 'User'}</h2>
                  <Edit3 className="w-3.5 h-3.5 text-[#141414]/30 hover:text-[#141414] transition-colors" />
                </div>
              )}
              <p className="text-[11px] text-[#141414]/40 mt-0.5 font-mono truncate">
                {user ? user.email : 'Local offline account'}
              </p>
            </div>
          </div>

          {/* Sync status button */}
          {!user ? (
            <button
              onClick={onLogin}
              className="w-full bg-[#141414] hover:bg-[#141414]/90 text-white font-bold py-3 px-4 rounded-[16px] text-[12px] flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 shadow-sm font-sans"
            >
              <LogIn className="w-4 h-4" />
              Sync and Sign In with Google
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full bg-[#141414]/5 hover:bg-neutral-200/50 text-[#141414]/80 font-semibold py-3 px-4 rounded-[16px] text-[12px] flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              Log Out account
            </button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#F8F8F8] border border-[#141414]/5 rounded-[20px] p-4 flex flex-col gap-2 items-center text-center">
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
              <Target className="w-4 h-4" />
            </div>
            <span className="text-[16px] font-black font-mono text-[#141414]">{totalHabits}</span>
            <span className="text-[9px] font-medium tracking-wide text-[#141414]/45 uppercase font-sans">Active</span>
          </div>

          <div className="bg-[#F8F8F8] border border-[#141414]/5 rounded-[20px] p-4 flex flex-col gap-2 items-center text-center">
            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-500">
              <CheckCircle className="w-4 h-4" />
            </div>
            <span className="text-[16px] font-black font-mono text-green-600">{completedToday}</span>
            <span className="text-[9px] font-medium tracking-wide text-[#141414]/45 uppercase font-sans">Done Today</span>
          </div>

          <div className="bg-[#F8F8F8] border border-[#141414]/5 rounded-[20px] p-4 flex flex-col gap-2 items-center text-center">
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
              <Flame className="w-4 h-4 animate-pulse" />
            </div>
            <span className="text-[16px] font-black font-mono text-amber-600">{bestStreak}</span>
            <span className="text-[9px] font-medium tracking-wide text-[#141414]/45 uppercase font-sans">Max Streak</span>
          </div>
        </div>

        {/* Switch Account/User Section */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#141414]/40 font-mono px-1">
            Account & Sandbox Controls
          </h3>

          <div className="bg-[#F8F8F8] border border-[#141414]/5 rounded-[24px] overflow-hidden divide-y divide-[#141414]/5">
            {/* Quick switcher option to try default demo accounts */}
            <div 
              className="flex items-center justify-between p-4.5 cursor-pointer hover:bg-[#141414]/5 transition-colors"
              onClick={() => {
                onChangeUsername('Kunmi');
                soundService.playPop();
              }}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[12px] font-semibold text-[#141414]">Switch to "Kunmi" demo</span>
                <span className="text-[10px] text-[#141414]/40">Switch profile quickly without typing</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#141414]/30" />
            </div>

            <div 
              className="flex items-center justify-between p-4.5 cursor-pointer hover:bg-[#141414]/5 transition-colors"
              onClick={() => {
                soundService.playPop();
                const newName = prompt('Enter a new profile username:', '');
                if (newName && newName.trim()) {
                  onChangeUsername(newName.trim());
                }
              }}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[12px] font-semibold text-[#141414]">Create / Login as other Username</span>
                <span className="text-[10px] text-[#141414]/40">Scopes a fresh set of offline habits for that name</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#141414]/30" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
