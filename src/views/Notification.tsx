import { 
  Bell, 
  Check, 
  Trash2, 
  Sparkles, 
  Volume2, 
  AlertCircle, 
  Flame, 
  Lightbulb, 
  CheckCircle2, 
  Tv, 
  Smile, 
  BellRing 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { NotificationItem } from '../services/notificationService';

interface NotificationViewProps {
  notifications: NotificationItem[];
  userId: string | null;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onClearAll: () => void;
  onSimulateMotivation: () => void;
  onSimulateReminder: () => void;
  pushPermissionStatus: 'granted' | 'denied' | 'default' | 'unsupported';
  onRequestPermission: () => void;
}

export function NotificationView({
  notifications,
  userId,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onClearAll,
  onSimulateMotivation,
  onSimulateReminder,
  pushPermissionStatus,
  onRequestPermission
}: NotificationViewProps) {

  // Group notifications into Today vs Others
  const todayList: NotificationItem[] = [];
  const otherList: NotificationItem[] = [];

  const checkIsToday = (dateInput: any) => {
    try {
      const date = new Date(dateInput);
      const today = new Date();
      return date.getDate() === today.getDate() &&
             date.getMonth() === today.getMonth() &&
             date.getFullYear() === today.getFullYear();
    } catch (e) {
      return false;
    }
  };

  notifications.forEach(not => {
    if (checkIsToday(not.createdAt)) {
      todayList.push(not);
    } else {
      otherList.push(not);
    }
  });

  const getIconForType = (type: NotificationItem['type']) => {
    switch (type) {
      case 'motivation':
        return <Lightbulb className="w-5 h-5 text-amber-500" />;
      case 'congratulations':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'streak':
        return <Flame className="w-5 h-5 text-orange-500 animate-pulse" />;
      case 'reminder':
      default:
        return <BellRing className="w-5 h-5 text-indigo-500" />;
    }
  };

  const formatTime = (dateInput: any) => {
    try {
      const date = new Date(dateInput);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  const formatDate = (dateInput: any) => {
    try {
      const date = new Date(dateInput);
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="pb-24 min-h-screen bg-white">
      {/* Dynamic Header */}
      <header className="py-6 px-4 flex justify-between items-center border-b border-[#141414]/5">
        <div>
          <h1 className="text-[20px] font-bold text-[#141414] tracking-tight flex items-center gap-2">
            Notifications
            {notifications.filter(n => !n.isRead).length > 0 && (
              <span className="text-[10px] font-medium text-white bg-[#141414] px-2 py-0.5 rounded-full">
                {notifications.filter(n => !n.isRead).length} new
              </span>
            )}
          </h1>
          <p className="text-[11px] text-[#141414]/40 mt-0.5">Reminders, achievements & motivations</p>
        </div>

        {notifications.length > 0 && (
          <div className="flex gap-2">
            <button 
              onClick={onMarkAllAsRead}
              className="text-[11px] font-medium text-[#141414]/65 hover:text-[#141414] bg-[#F8F8F8] px-3 py-1.5 rounded-full transition-colors active:scale-95"
            >
              Mark read
            </button>
            <button 
              onClick={onClearAll}
              className="text-[11px] font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/70 px-3 py-1.5 rounded-full transition-all active:scale-95"
            >
              Clear Feed
            </button>
          </div>
        )}
      </header>

      <div className="px-4 py-4 space-y-5">
        {/* Push Notification permission Banner */}
        <div className="bg-[#141414]/5 rounded-[22px] p-4 border border-[#141414]/5 flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-neutral-100 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-[16px]">🔔</span>
            </div>
            <div className="space-y-0.5">
              <h3 className="text-[13px] font-bold text-[#141414]">Desktop Push Reminders</h3>
              <p className="text-[11px] text-[#141414]/50 leading-relaxed">
                Receive instant local browser push alerts when timers pop up or habit goals are checked!
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-[#141414]/5">
            <span className="text-[11px] font-medium text-[#141414]/60 flex items-center gap-1.5">
              Status: 
              {pushPermissionStatus === 'granted' && (
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  ● Live Active
                </span>
              )}
              {pushPermissionStatus === 'denied' && (
                <span className="text-red-500 font-semibold flex items-center gap-1">
                  ● Blocked by Browser
                </span>
              )}
              {pushPermissionStatus === 'unsupported' && (
                <span className="text-neutral-500 font-semibold flex items-center gap-1">
                  ● Not Supported
                </span>
              )}
              {pushPermissionStatus === 'default' && (
                <span className="text-amber-600 font-semibold flex items-center gap-1">
                  ● Ready to Enable
                </span>
              )}
            </span>

            {pushPermissionStatus !== 'granted' && pushPermissionStatus !== 'unsupported' && (
              <button
                onClick={onRequestPermission}
                className="text-[11px] font-semibold text-white bg-[#141414] hover:bg-[#141414]/85 px-4 py-1.5 rounded-full transition-all active:scale-95 shadow-sm"
              >
                Allow Push
              </button>
            )}
          </div>
        </div>

        {/* Action simulators row */}
        <div className="bg-[#F8F8F8] rounded-[22px] p-4 space-y-3 border border-dashed border-[#141414]/15">
          <div className="flex justify-between items-center">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#141414]/40 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> Try sound & push simulation
            </h4>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={onSimulateMotivation}
              className="text-[11px] text-left p-2.5 bg-white text-[#141414]/70 hover:text-[#141414] font-medium rounded-xl border border-neutral-100 flex items-center gap-2 transition-colors duration-200"
            >
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Send Motivation</span>
            </button>
            <button
              onClick={onSimulateReminder}
              className="text-[11px] text-left p-2.5 bg-white text-[#141414]/70 hover:text-[#141414] font-medium rounded-xl border border-neutral-100 flex items-center gap-2 transition-colors duration-200"
            >
              <BellRing className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Send Reminder</span>
            </button>
          </div>
        </div>

        {/* Master Notification Feed Lists */}
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-4">
            <div className="w-16 h-16 bg-[#F8F8F8] rounded-[24px] flex items-center justify-center text-[28px] border border-[#141414]/5">
              🍃
            </div>
            <div className="space-y-1.5">
              <h3 className="text-[15px] font-bold text-[#141414]">No notifications yet</h3>
              <p className="text-[12px] text-[#141414]/45 px-6 leading-relaxed">
                Your habits feed is looking clean and light! Reminders, motivations, and streak milestones will live here as you go.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* TODAY SECTION */}
            {todayList.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-[12px] font-bold text-[#141414]/40 uppercase tracking-widest pl-1">
                  Today
                </h3>
                <div className="space-y-2.5">
                  <AnimatePresence initial={false}>
                    {todayList.map(item => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className={cn(
                          "p-4 rounded-[22px] flex items-start gap-3.5 relative border transition-all duration-300",
                          item.isRead 
                            ? "bg-neutral-50 border-neutral-100 text-[#141414]/65" 
                            : "bg-white border-[#141414]/10 shadow-[0_2px_8px_rgba(20,20,20,0.03)] text-[#141414]"
                        )}
                      >
                        {/* Dot for unread */}
                        {!item.isRead && (
                          <div className="absolute top-4 right-4 w-2 h-2 bg-indigo-500 rounded-full" />
                        )}

                        {/* Icon type */}
                        <div className="w-10 h-10 bg-white rounded-xl border border-neutral-100 flex items-center justify-center shrink-0">
                          {getIconForType(item.type)}
                        </div>

                        {/* Body contents */}
                        <div className="flex-1 space-y-1 pr-6" onClick={() => onMarkAsRead(item.id)}>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-[13px] font-bold leading-tight">{item.title}</h4>
                            <span className="text-[10px] text-neutral-400 font-medium">
                              {formatTime(item.createdAt)}
                            </span>
                          </div>
                          <p className="text-[12px] text-[#141414]/55 leading-relaxed">
                            {item.body}
                          </p>
                        </div>

                        {/* Delete action button */}
                        <button
                          onClick={() => onDeleteNotification(item.id)}
                          className="opacity-0 group-hover:opacity-100 focus:opacity-100 absolute bottom-3 right-3 text-[#141414]/30 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors"
                          title="Delete card"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        
                        {/* Visible delete on touch screen */}
                        <button
                          onClick={() => onDeleteNotification(item.id)}
                          className="p-1 rounded-full text-neutral-400 hover:text-red-500 shrink-0 self-center hover:bg-red-50 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* OLDER / OTHERS SECTION */}
            {otherList.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-[12px] font-bold text-[#141414]/40 uppercase tracking-widest pl-1 pt-2">
                  Others
                </h3>
                <div className="space-y-2.5">
                  <AnimatePresence initial={false}>
                    {otherList.map(item => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className={cn(
                          "p-4 rounded-[22px] flex items-start gap-3.5 relative border transition-all duration-300",
                          item.isRead 
                            ? "bg-neutral-50/80 border-neutral-100 text-[#141414]/60" 
                            : "bg-white border-[#141414]/10 text-[#141414]"
                        )}
                      >
                        {!item.isRead && (
                          <div className="absolute top-4 right-4 w-2 h-2 bg-indigo-550 rounded-full" />
                        )}

                        <div className="w-10 h-10 bg-white rounded-xl border border-neutral-100 flex items-center justify-center shrink-0">
                          {getIconForType(item.type)}
                        </div>

                        <div className="flex-1 space-y-1 pr-6" onClick={() => onMarkAsRead(item.id)}>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-[13px] font-bold leading-tight">{item.title}</h4>
                            <span className="text-[9px] text-neutral-400 font-semibold bg-neutral-100 px-1.5 py-0.5 rounded">
                              {formatDate(item.createdAt)}
                            </span>
                          </div>
                          <p className="text-[11.5px] text-[#141414]/50 leading-relaxed">
                            {item.body}
                          </p>
                        </div>

                        <button
                          onClick={() => onDeleteNotification(item.id)}
                          className="p-1 rounded-full text-neutral-400 hover:text-red-500 shrink-0 self-center hover:bg-neutral-50 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Minimalist local X icon to prevent importing outside elements
function X({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      className={cn("w-4 h-4", className)}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
