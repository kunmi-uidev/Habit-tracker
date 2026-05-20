import { Home, BarChart2, Bell, User, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { ViewType } from '../types';

interface NavigationProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onAddClick: () => void;
  unreadCount?: number;
}

export function Navigation({ currentView, onViewChange, onAddClick, unreadCount }: NavigationProps) {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'progress', icon: BarChart2, label: 'Progress' },
    { id: 'add', isAction: true },
    { id: 'notification', icon: Bell, label: 'Notification' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 flex justify-between items-center z-50">
      {tabs.map((tab, idx) => {
        if (tab.isAction) {
          return (
            <button
              key="add-action"
              onClick={onAddClick}
              className="w-12 h-12 bg-[#141414] text-white rounded-full flex items-center justify-center -translate-y-2 shadow-lg active:scale-90 transition-transform"
            >
              <Plus className="w-6 h-6" />
            </button>
          );
        }

        const Icon = tab.icon!;
        const isActive = currentView === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onViewChange(tab.id as ViewType)}
            className="flex flex-col items-center gap-1.5 transition-all active:scale-95 relative"
          >
            <div className="relative">
              <Icon 
                className={cn(
                  "w-6 h-6 transition-colors",
                  isActive ? "text-[#141414]" : "text-[#141414]/20"
                )} 
              />
              {tab.id === 'notification' && unreadCount !== undefined && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold border border-white">
                  {unreadCount}
                </span>
              )}
            </div>
            <span className={cn(
              "text-[10px] font-medium transition-colors",
              isActive ? "text-[#141414]" : "text-[#141414]/20"
            )}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
