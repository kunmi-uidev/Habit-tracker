import { Plus } from 'lucide-react';
import { Header } from '../components/Header';
import { ProgressCard } from '../components/ProgressCard';
import { HabitCard } from '../components/HabitCard';
import { Habit } from '../types';

interface HomeProps {
  habits: Habit[];
  onToggleHabit: (id: string) => void;
  onAddHabit: () => void;
  onDeleteHabit: (id: string) => void;
  username: string;
}

export function HomeView({ habits, onToggleHabit, onAddHabit, onDeleteHabit, dailyProgress, username }: HomeProps & { dailyProgress: number }) {
  return (
    <div className="pb-16">
      <Header title={`Welcome ${username || 'User'}`} />
      
      <main className="px-4 space-y-6">
        {/* Hero Section */}
        <section className="bg-[#F8F8F8] rounded-[32px] p-8 flex justify-between items-center overflow-hidden relative min-h-[160px]">
          <div className="max-w-[170px] z-10">
            <h2 className="text-[24px] font-bold leading-[1.2] text-[#141414]">
              Start your day with full productivity.
            </h2>
          </div>
          
          <div className="absolute right-[-10px] bottom-0 w-[60%] h-full flex items-end justify-end pointer-events-none pr-4 pb-4">
             {/* Minimalist Line Art Illustration */}
             <svg width="140" height="120" viewBox="0 0 140 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Doorway/Gate */}
                <path d="M20 120V30C20 24.4772 24.4772 20 30 20H80C85.5228 20 90 24.4772 90 30V120" stroke="#141414" strokeWidth="1.5" strokeOpacity="0.1" />
                <path d="M40 120V50C40 47.2386 42.2386 45 45 45H100C102.761 45 105 47.2386 105 50V120" stroke="#141414" strokeWidth="1.5" />
                
                {/* Person */}
                <circle cx="75" cy="70" r="6" fill="#141414" />
                <path d="M75 76V95L65 110M75 95L85 110" stroke="#141414" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M75 80L90 85L105 90" stroke="#141414" strokeWidth="2" strokeLinecap="round" />
                
                {/* Dog */}
                <path d="M105 90L115 105" stroke="#141414" strokeWidth="1.5" strokeDasharray="2 2" />
                <rect x="112" y="102" width="12" height="8" rx="2" fill="#141414" />
                <rect x="122" y="100" width="4" height="6" rx="1" fill="#141414" />
                <path d="M115 110V115M121 110V115" stroke="#141414" strokeWidth="1.5" />
             </svg>
          </div>
        </section>

        {/* Today's Habits */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-[16px] font-semibold">Today's habit</h3>
            <button className="text-[12px] font-medium text-[#141414]/40">See All</button>
          </div>
          <div className="space-y-4">
            {habits.map(habit => (
              <HabitCard key={habit.id} habit={habit} onToggle={onToggleHabit} onDelete={onDeleteHabit} />
            ))}
          </div>
        </section>

        {/* Overall Progress */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-[16px] font-semibold">Overall Progress</h3>
            <button className="text-[12px] font-medium text-[#141414]/40">View</button>
          </div>
          <ProgressCard percentage={dailyProgress} />
        </section>
      </main>
    </div>
  );
}
