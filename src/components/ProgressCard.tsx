import { cn } from '../lib/utils';
import { Droplets } from 'lucide-react';

interface ProgressCardProps {
  percentage: number;
  variant?: 'compact' | 'full';
}

export function ProgressCard({ percentage, variant = 'compact' }: ProgressCardProps) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const activeIdx = 4; // Friday in the image

  return (
    <div className={cn(
      "bg-[#141414] text-white rounded-[32px] p-6 flex flex-col gap-6",
      variant === 'full' ? 'py-8' : 'py-6'
    )}>
      <div className="flex justify-between items-center">
        <span className="text-[12px] font-medium opacity-60">Today's Progress</span>
        <button className="bg-white/10 px-3 py-1.5 rounded-full text-[12px] font-medium backdrop-blur-md">
          Daily
        </button>
      </div>

      <div className="flex justify-between items-center mb-2">
        <h2 className="text-[48px] font-semibold leading-none tracking-tight">{percentage}%</h2>
        
        {/* Circular Progress Gauge */}
        <div className="relative w-16 h-12 overflow-hidden">
          <svg className="w-16 h-16 transform translate-y-[6px] rotate-180">
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              className="text-white/10"
              strokeDasharray="88 176"
              strokeDashoffset="0"
              strokeLinecap="round"
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              className="text-white"
              strokeDasharray={`${(88 * percentage) / 100} 176`}
              strokeDashoffset="0"
              strokeLinecap="round"
            />
            
            {/* Tuner Handle */}
            <circle
              cx={32 + 28 * Math.cos((percentage / 100) * Math.PI)}
              cy={32 + 28 * Math.sin((percentage / 100) * Math.PI)}
              r="4"
              fill="white"
              className="drop-shadow-sm"
            />
          </svg>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
          <Droplets className="w-3.5 h-3.5" />
        </div>
        
        <div className="flex gap-4">
          {days.map((day, idx) => (
            <div 
              key={idx} 
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium transition-colors",
                idx === activeIdx ? "bg-white text-[#141414]" : "bg-white/5 text-white/40"
              )}
            >
              {day}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
