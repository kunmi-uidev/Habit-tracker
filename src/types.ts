export type DayOfWeek = 'M' | 'T' | 'W' | 'T_2' | 'F' | 'S' | 'S_2';

export interface Habit {
  id: string;
  title: string;
  icon: string;
  completedDays: boolean[]; // 7 days
  isCompletedToday: boolean;
  streak: number;
}

export type ViewType = 'home' | 'progress' | 'notification' | 'profile';
