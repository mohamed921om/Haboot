import { Habit, HabitLog, AppData, WEEKDAYS } from './types';

// --- Date Utils ---

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getTodayDateString = (): string => formatDate(new Date());

export const getDayName = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

export const getDatesInRange = (startDate: Date, endDate: Date): string[] => {
  const dates: string[] = [];
  const curr = new Date(startDate);
  while (curr <= endDate) {
    dates.push(formatDate(curr));
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
};

// --- Logic Utils ---

export const generateId = (): string => Math.random().toString(36).substr(2, 9);

export const isHabitDueOnDate = (habit: Habit, dateStr: string): boolean => {
  const date = new Date(dateStr);
  const dayIndex = date.getDay(); // 0 = Sun
  const dayName = WEEKDAYS[dayIndex];

  if (habit.repeatType === 'daily') return true;
  if (habit.repeatType === 'specific_days') return habit.repeatDays.includes(dayName);
  if (habit.repeatType === 'weekly') return true; // Technically due any day until goal met
  return false;
};

// --- Storage Utils ---

const STORAGE_KEY = 'habitpulse_data_v1';

export const saveToStorage = (data: AppData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
};

export const loadFromStorage = (): AppData | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

// --- Demo Data ---

export const generateDemoData = (): AppData => {
  const habits: Habit[] = [
    {
      id: generateId(),
      name: 'Morning Jog',
      description: '30 mins around the park',
      color: '#10b981', // Emerald
      points: 5,
      repeatType: 'daily',
      repeatGoal: 1,
      repeatDays: [],
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      archived: false,
    },
    {
      id: generateId(),
      name: 'Read Book',
      description: 'At least 10 pages',
      color: '#3b82f6', // Blue
      points: 2,
      repeatType: 'daily',
      repeatGoal: 1,
      repeatDays: [],
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      archived: false,
    },
    {
      id: generateId(),
      name: 'Deep Work',
      description: '2 hours of focused coding',
      color: '#8b5cf6', // Violet
      points: 10,
      repeatType: 'specific_days',
      repeatGoal: 1,
      repeatDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      archived: false,
    },
    {
      id: generateId(),
      name: 'Meditation',
      description: 'Mindfulness session',
      color: '#f59e0b', // Amber
      points: 3,
      repeatType: 'weekly',
      repeatGoal: 4,
      repeatDays: [],
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      archived: false,
    },
  ];

  const logs: HabitLog[] = [];
  const today = new Date();
  const startDate = new Date();
  startDate.setDate(today.getDate() - 90);

  const dates = getDatesInRange(startDate, today);

  dates.forEach(dateStr => {
    habits.forEach(habit => {
      // Randomly decide if habit was done based on some probability to look realistic
      let chance = 0.7; 
      if (habit.repeatType === 'specific_days' && !isHabitDueOnDate(habit, dateStr)) {
        chance = 0.05; // Rarely do it on off days
      }
      
      if (Math.random() < chance) {
         // Some variety in counts for habits that might support it (though our demo habits are mostly boolean natured)
         // Let's pretend Reading can be done multiple times
         const count = habit.name === 'Read Book' ? Math.floor(Math.random() * 2) + 1 : 1;
         logs.push({
           id: generateId(),
           habitId: habit.id,
           date: dateStr,
           count
         });
      }
    });
  });

  return { habits, logs, theme: 'light' };
};