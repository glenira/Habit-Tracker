import { Habit, CalendarDay } from '../types';

export const formatDateISO = (date: Date): string => {
  const offset = date.getTimezoneOffset();
  const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
  return adjustedDate.toISOString().split('T')[0];
};

export const getMonthDays = (year: number, month: number, startDayOfWeek: 'Sunday' | 'Monday' = 'Monday'): CalendarDay[] => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const days: CalendarDay[] = [];
  
  const dayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Calculate padding based on start day preference
  let startPadding = 0;
  if (startDayOfWeek === 'Monday') {
    // If Mon(1), padding 0. If Sun(0), padding 6.
    startPadding = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  } else {
    // If Sun(0), padding 0.
    startPadding = dayOfWeek;
  }

  const daysInMonth = lastDay.getDate();

  // Add previous month's padding
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startPadding - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthLastDay - i);
    days.push({
      date: d,
      dateStr: formatDateISO(d),
      isCurrentMonth: false,
      isToday: formatDateISO(new Date()) === formatDateISO(d),
    });
  }

  // Add current month
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    days.push({
      date: d,
      dateStr: formatDateISO(d),
      isCurrentMonth: true,
      isToday: formatDateISO(new Date()) === formatDateISO(d),
    });
  }

  // Add next month's padding to complete the grid (up to 42 cells usually)
  const remainingCells = 42 - days.length; // 6 rows * 7 cols
  for (let i = 1; i <= remainingCells; i++) {
    const d = new Date(year, month + 1, i);
    days.push({
      date: d,
      dateStr: formatDateISO(d),
      isCurrentMonth: false,
      isToday: formatDateISO(new Date()) === formatDateISO(d),
    });
  }

  return days;
};

export const getWeekRange = (date: Date, startDayOfWeek: 'Sunday' | 'Monday') => {
  const current = new Date(date);
  current.setHours(0, 0, 0, 0);
  const day = current.getDay(); // 0 (Sun) - 6 (Sat)
  
  let diff = 0;
  if (startDayOfWeek === 'Monday') {
    // If today is Sunday (0), we want previous Monday (-6)
    // If today is Monday (1), diff is 0
    // If today is Tuesday (2), diff is -1
    const dayIndex = day === 0 ? 7 : day;
    diff = 1 - dayIndex;
  } else {
    // Sunday start
    // If today is Sunday (0), diff is 0
    // If today is Monday (1), diff is -1
    diff = -day;
  }
  
  const start = new Date(current);
  start.setDate(current.getDate() + diff);
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
};

export const getWeekDays = (date: Date, startDayOfWeek: 'Sunday' | 'Monday'): CalendarDay[] => {
  const { start } = getWeekRange(date, startDayOfWeek);
  const days: CalendarDay[] = [];
  const currentMonth = date.getMonth();

  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push({
      date: d,
      dateStr: formatDateISO(d),
      isCurrentMonth: d.getMonth() === currentMonth,
      isToday: formatDateISO(new Date()) === formatDateISO(d),
    });
  }
  return days;
};

export const isHabitDueOnDate = (habit: Habit, date: Date): boolean => {
  const dateStr = formatDateISO(date);

  // Check exceptions first
  if (habit.exceptions?.includes(dateStr)) return false;

  // Check end date
  if (habit.endDate && dateStr > habit.endDate) return false;

  const habitStart = new Date(habit.startDate);
  // Reset times to compare dates only
  habitStart.setHours(0,0,0,0);
  const checkDate = new Date(date);
  checkDate.setHours(0,0,0,0);

  // Check start date
  if (checkDate < habitStart) return false;
  if (habit.archived) return false;

  const dayOfWeek = checkDate.getDay(); // 0-6 Sun-Sat

  switch (habit.frequency.type) {
    case 'daily':
      return true;
    case 'weekdays':
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    case 'weekends':
      return dayOfWeek === 0 || dayOfWeek === 6;
    case 'specific':
      return habit.frequency.daysOfWeek?.includes(dayOfWeek) ?? false;
    case 'monthly':
      return true;
    default:
      return false;
  }
};