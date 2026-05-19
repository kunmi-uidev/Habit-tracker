import { Check, Footprints, Droplets, Trash2 } from 'lucide-react';
import { Habit } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: string) => void;
  onDelete?: (id: string) => void;
  showDays?: boolean;
  key?: string | number;
}

export function HabitCard({ habit, onToggle, onDelete, showDays = true }: HabitCardProps) {
  const Icon = habit.icon === 'run' ? Footprints : Droplets;
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <motion.div 
      layout
      className="bg-[#F8F8F8] rounded-[24px] p-5 flex flex-col gap-4 relative group"
    >
      <div className="flex justify-between items-start">
        <div className="flex gap-4">
          <div className="w-10 h-10 bg-[#141414] rounded-xl flex items-center justify-center">
            <Icon className="text-white w-5 h-5" />
          </div>
          
          {onDelete && (
             <button 
               onClick={() => onDelete(habit.id)}
               className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
             >
               <Trash2 className="w-4 h-4" />
             </button>
          )}
        </div>
        
        {showDays && (
          <div className="flex gap-1.5">
            {days.map((day, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-medium text-[#141414]/40">{day}</span>
                <div 
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-colors",
                    habit.completedDays[idx] ? "bg-[#141414]" : "bg-[#141414]/10"
                  )} 
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between items-end">
        <div className="flex flex-col">
          <span className="text-[12px] font-semibold text-[#141414] leading-tight">{habit.title}</span>
          <span className="text-[12px] text-[#141414]/40">{habit.streak} day streak</span>
        </div>
        
        <button 
          onClick={() => onToggle(habit.id)}
          className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300",
            habit.isCompletedToday 
              ? "bg-[#141414] text-white" 
              : "border-2 border-[#141414]/10 text-transparent"
          )}
        >
          <Check className="w-3.5 h-3.5" strokeWidth={3} />
        </button>
      </div>
    </motion.div>
  );
}
