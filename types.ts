export type Weekday = 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';

export const WEEKDAYS: Weekday[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export type RepeatType = 'daily' | 'weekly' | 'specific_days';

export interface Habit {
  id: string;
  name: string;
  description?: string;
  color: string;
  points: number;
  repeatType: RepeatType;
  repeatGoal: number; // For 'weekly' (e.g., 3 times/week) or 'daily' (e.g., 1 time/day)
  repeatDays: Weekday[]; // For 'specific_days'
  createdAt: string;
  archived: boolean;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  count: number;
}

export interface AppData {
  habits: Habit[];
  logs: HabitLog[];
  theme: 'light' | 'dark';
}

export const COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#84cc16', // Lime
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#d946ef', // Fuchsia
  '#f43f5e', // Rose
];