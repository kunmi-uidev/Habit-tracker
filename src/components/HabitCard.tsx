import { Check, Trash2 } from 'lucide-react';
import { Habit } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { ICON_MAP } from '../lib/icons';

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: string) => void;
  onDelete?: (id: string) => void;
  showDays?: boolean;
  key?: string | number;
}

export function HabitCard({ habit, onToggle, onDelete, showDays = true }: HabitCardProps) {
  const Icon = ICON_MAP[habit.icon] || ICON_MAP.activity;
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const handleDragEnd = (_event: any, info: any) => {
    // If user dragged more than 90px in either left or right directions
    if (Math.abs(info.offset.x) > 90) {
      if (onDelete) {
        onDelete(habit.id);
      }
    }
  };

  return (
    <div className="relative overflow-visible select-none h-auto">
      {/* Underlying swipe warning container */}
      <div className="absolute inset-0 bg-red-50/90 rounded-[24px] border border-red-100/60 flex items-center justify-between px-6 pointer-events-none transition-all duration-200">
        <div className="flex items-center gap-2 text-red-500">
          <Trash2 className="w-4 h-4 animate-pulse shrink-0" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Release to Delete</span>
        </div>
        <div className="flex items-center gap-2 text-red-500">
          <span className="text-[10px] font-bold uppercase tracking-wider">Release to Delete</span>
          <Trash2 className="w-4 h-4 animate-pulse shrink-0" />
        </div>
      </div>

      <motion.div 
        layout
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.65}
        onDragEnd={handleDragEnd}
        animate={{ 
          backgroundColor: habit.isCompletedToday ? "#F2F2F2" : "#F8F8F8" 
        }}
        transition={{ 
          backgroundColor: { duration: 0.3 }
        }}
        whileTap={{ scale: 0.98 }}
        className="relative z-10 bg-[#F8F8F8] border border-[#141414]/5 rounded-[24px] p-5 flex flex-col gap-4 group transition-colors cursor-grab active:cursor-grabbing"
      >
        <div className="flex justify-between items-start">
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-[#141414] rounded-xl flex items-center justify-center">
              <Icon className="text-white w-5 h-5" />
            </div>
            
            {onDelete && (
               <button 
                 onClick={() => onDelete(habit.id)}
                 className="w-10 h-10 bg-red-55/70 text-red-500 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
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
          
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => onToggle(habit.id)}
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 overflow-hidden",
              habit.isCompletedToday 
                ? "bg-[#141414] text-white" 
                : "border-2 border-[#141414]/10 text-transparent"
            )}
          >
            <motion.div
              initial={false}
              animate={{ 
                scale: habit.isCompletedToday ? 1 : 0,
                opacity: habit.isCompletedToday ? 1 : 0,
                y: habit.isCompletedToday ? 0 : 4
              }}
              transition={{ type: "spring", damping: 12, stiffness: 200 }}
            >
              <Check className="w-3.5 h-3.5" strokeWidth={3} />
            </motion.div>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
