import { useState, type FormEvent } from 'react';
import { X, Footprints, Droplets } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface AddHabitFormProps {
  onAdd: (habit: { title: string; icon: 'run' | 'water' }) => void;
  onClose: () => void;
}

export function AddHabitForm({ onAdd, onClose }: AddHabitFormProps) {
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState<'run' | 'water'>('run');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title, icon });
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-[60] bg-white px-4 py-8 flex flex-col"
    >
      <div className="flex justify-between items-center mb-12">
        <h2 className="text-[24px] font-bold text-[#141414]">Create Habit</h2>
        <button 
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-[#F8F8F8] flex items-center justify-center text-[#141414]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-8">
        <div className="space-y-4">
          <label className="text-[12px] font-medium text-[#141414]/40 uppercase tracking-wider">Habit Name</label>
          <input
            autoFocus
            type="text"
            placeholder="e.g. Morning Meditation"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-[16px] font-medium border-b-2 border-[#141414]/10 py-2 focus:outline-none focus:border-[#141414] transition-colors placeholder:text-[#141414]/20"
          />
        </div>

        <div className="space-y-4">
          <label className="text-[12px] font-medium text-[#141414]/40 uppercase tracking-wider">Icon</label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setIcon('run')}
              className={cn(
                "w-16 h-16 rounded-[20px] flex items-center justify-center transition-all",
                icon === 'run' ? "bg-[#141414] text-white" : "bg-[#F8F8F8] text-[#141414]/40 hover:bg-[#F0F0F0]"
              )}
            >
              <Footprints className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={() => setIcon('water')}
              className={cn(
                "w-16 h-16 rounded-[20px] flex items-center justify-center transition-all",
                icon === 'water' ? "bg-[#141414] text-white" : "bg-[#F8F8F8] text-[#141414]/40 hover:bg-[#F0F0F0]"
              )}
            >
              <Droplets className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="mt-auto pb-8">
          <button
            type="submit"
            disabled={!title.trim()}
            className="w-full bg-[#141414] text-white py-5 rounded-[24px] text-[16px] font-semibold tracking-wide disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
          >
            Start Habit
          </button>
        </div>
      </form>
    </motion.div>
  );
}
