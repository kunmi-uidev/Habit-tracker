import { Header } from '../components/Header';
import { ProgressCard } from '../components/ProgressCard';
import { HabitCard } from '../components/HabitCard';
import { Habit } from '../types';

interface ProgressProps {
  habits: Habit[];
  onToggleHabit: (id: string) => void;
  onDeleteHabit: (id: string) => void;
}

export function ProgressView({ habits, onToggleHabit, onDeleteHabit }: ProgressProps) {
  return (
    <div className="pb-16">
      <Header title="Your Progress" />
      
      <main className="px-4 space-y-8">
        <ProgressCard percentage={58} variant="full" />

        {/* Pending */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-[16px] font-semibold text-[#141414]">Pending</h3>
            <button className="text-[12px] font-medium text-[#141414]/40">See All</button>
          </div>
          <div className="space-y-4">
            {habits.filter(h => !h.isCompletedToday).map(habit => (
              <HabitCard 
                key={habit.id} 
                habit={habit} 
                onToggle={onToggleHabit} 
                onDelete={onDeleteHabit}
                showDays={true} 
              />
            ))}
          </div>
        </section>

        {/* Streaks */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-[16px] font-semibold text-[#141414]">Streaks</h3>
            <button className="text-[12px] font-medium text-[#141414]/40">See All</button>
          </div>
          <div className="space-y-4">
            {habits.map(habit => (
              <HabitCard 
                key={habit.id} 
                habit={habit} 
                onToggle={onToggleHabit} 
                onDelete={onDeleteHabit}
                showDays={true} 
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
