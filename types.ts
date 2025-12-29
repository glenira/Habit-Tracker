export type FrequencyType = 'daily' | 'weekdays' | 'weekends' | 'specific' | 'monthly';

export interface Frequency {
  type: FrequencyType;
  daysOfWeek?: number[]; // 0 = Sunday, 1 = Monday, etc.
}

export interface Habit {
  id: string;
  name: string;
  color: string; // Tailwind color class prefix e.g. 'purple', 'green'
  frequency: Frequency;
  startDate: string; // ISO Date string YYYY-MM-DD
  archived: boolean;
  category: 'health' | 'work' | 'sport' | 'general';
  exceptions?: string[]; // Dates where the habit should be skipped (ISO YYYY-MM-DD)
  endDate?: string; // Date after which the habit should no longer appear (ISO YYYY-MM-DD)
}

export interface HabitCompletion {
  [dateIso: string]: {
    [habitId: string]: boolean; // true if completed
  };
}

// Helper type for the calendar grid
export interface CalendarDay {
  date: Date;
  dateStr: string; // YYYY-MM-DD
  isCurrentMonth: boolean;
  isToday: boolean;
}

export interface HabitTemplate {
  name: string;
  category: Habit['category'];
  defaultColor: string;
}

export interface ContextMenuPosition {
  x: number;
  y: number;
  habitId: string;
  dateStr: string;
}