import { useState, type FormEvent } from 'react';
import { X, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { ICON_MAP, ICON_LABELS, suggestIcon } from '../lib/icons';

interface AddHabitFormProps {
  onAdd: (habit: { title: string; icon: string }) => void;
  onClose: () => void;
}

export function AddHabitForm({ onAdd, onClose }: AddHabitFormProps) {
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('activity');
  const [isManual, setIsManual] = useState(false);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isManual) {
      if (val.trim() === '') {
        setIcon('activity');
      } else {
        const suggested = suggestIcon(val);
        setIcon(suggested);
      }
    } else if (val.trim() === '') {
      setIsManual(false);
      setIcon('activity');
    }
  };

  const handleIconSelect = (iconId: string) => {
    setIcon(iconId);
    setIsManual(true);
  };

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
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-[24px] font-bold text-[#141414]">Create Habit</h2>
          <p className="text-[12px] text-[#141414]/40 mt-1">Typing automatically suggests a fitting icon.</p>
        </div>
        <button 
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-[#F8F8F8] flex items-center justify-center text-[#141414]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6">
        <div className="space-y-3">
          <label className="text-[12px] font-medium text-[#141414]/40 uppercase tracking-wider">Habit Name</label>
          <input
            autoFocus
            type="text"
            placeholder="e.g. Morning Meditation"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full text-[16px] font-medium border-b-2 border-[#141414]/10 py-2 focus:outline-none focus:border-[#141414] transition-colors placeholder:text-[#141414]/20"
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-[12px] font-medium text-[#141414]/40 uppercase tracking-wider">
              Icon Setup
            </label>
            <div className="flex items-center gap-1.5 min-h-[22px]">
              {title.trim() && !isManual && (
                <motion.span 
                  initial={{ opacity: 0, scale: 0.8, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="text-[10px] bg-neutral-100 text-[#141414] px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1 border border-[#141414]/5"
                >
                  <Sparkles className="w-2.5 h-2.5 text-amber-500 animate-pulse" />
                  Auto-suggested
                </motion.span>
              )}
              {isManual && (
                <button 
                  type="button"
                  onClick={() => {
                    setIsManual(false);
                    const suggested = suggestIcon(title);
                    setIcon(suggested);
                  }}
                  className="text-[10px] text-[#141414]/40 hover:text-[#141414] transition-colors py-0.5 px-2.5 rounded-full border border-dashed border-[#141414]/15 hover:border-[#141414]/40"
                >
                  Reset to Suggested Pick
                </button>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3.5 bg-[#F8F8F8] p-4 rounded-[20px] border border-[#141414]/5">
            <div className="w-12 h-12 bg-[#141414] rounded-xl flex items-center justify-center shrink-0">
              {(() => {
                const SelectedIcon = ICON_MAP[icon] || ICON_MAP.activity;
                return <SelectedIcon className="text-white w-5 h-5" />;
              })()}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-[10px] text-[#141414]/40 font-medium uppercase tracking-wider">Active Choice</span>
              <span className="text-[14px] font-semibold text-[#141414] truncate">{ICON_LABELS[icon] || 'Activity'}</span>
            </div>
          </div>

          <div className="grid grid-cols-6 gap-2.5 pt-1">
            {Object.keys(ICON_MAP).map((iconId) => {
              const IconComp = ICON_MAP[iconId];
              const isSelected = icon === iconId;
              return (
                <button
                  key={iconId}
                  type="button"
                  onClick={() => handleIconSelect(iconId)}
                  title={ICON_LABELS[iconId]}
                  className={cn(
                    "relative w-full aspect-square rounded-[16px] flex items-center justify-center transition-all duration-200 outline-none",
                    isSelected 
                      ? "bg-[#141414] text-white scale-[1.05] shadow-sm" 
                      : "bg-[#F8F8F8] text-[#141414]/55 hover:bg-[#F0F0F0] hover:text-[#141414]"
                  )}
                >
                  <IconComp className="w-5 h-5" />
                  {isSelected && (
                    <motion.div 
                      layoutId="activeIndicator"
                      className="absolute inset-0 border border-black rounded-[16px] pointer-events-none scale-[1.1]"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-auto pb-4">
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
