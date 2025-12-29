import { useState, useEffect, useCallback } from 'react';
import { Habit, HabitCompletion } from '../types';
import { formatDateISO } from '../utils/dateUtils';

const STORAGE_KEY_HABITS = 'habitflow_habits';
const STORAGE_KEY_COMPLETIONS = 'habitflow_completions';
const STORAGE_KEY_SETTINGS = 'habitflow_settings';

export const useHabitStore = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion>({});
  const [startDayOfWeek, setStartDayOfWeek] = useState<'Sunday' | 'Monday'>('Monday');

  // Load from storage on mount
  useEffect(() => {
    try {
      const storedHabits = localStorage.getItem(STORAGE_KEY_HABITS);
      const storedCompletions = localStorage.getItem(STORAGE_KEY_COMPLETIONS);
      const storedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);

      if (storedHabits) setHabits(JSON.parse(storedHabits));
      if (storedCompletions) setCompletions(JSON.parse(storedCompletions));
      if (storedSettings) {
        const settings = JSON.parse(storedSettings);
        if (settings.startDayOfWeek) setStartDayOfWeek(settings.startDayOfWeek);
      }
    } catch (error) {
      console.error("Failed to load data", error);
    }
  }, []);

  // Save to storage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HABITS, JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_COMPLETIONS, JSON.stringify(completions));
  }, [completions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify({ startDayOfWeek }));
  }, [startDayOfWeek]);

  const addHabit = useCallback((habit: Habit) => {
    setHabits(prev => [...prev, habit]);
  }, []);

  const updateHabit = useCallback((updatedHabit: Habit) => {
    setHabits(prev => prev.map(h => h.id === updatedHabit.id ? updatedHabit : h));
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  }, []);

  // New function: Exception for a single day
  const removeHabitForDate = useCallback((habitId: string, dateStr: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== habitId) return h;
      return { 
        ...h, 
        exceptions: [...(h.exceptions || []), dateStr] 
      };
    }));
    // Also remove completion if it exists for that day to keep data clean
    setCompletions(prev => {
      if (!prev[dateStr]?.[habitId]) return prev;
      const newDayRecord = { ...prev[dateStr] };
      delete newDayRecord[habitId];
      return { ...prev, [dateStr]: newDayRecord };
    });
  }, []);

  // New function: Stop habit from this date onwards
  const stopHabitFromDate = useCallback((habitId: string, dateStr: string) => {
    // Calculate the day before dateStr to set as endDate
    // Note: handling date string arithmetic manually to ensure timezone safety with ISO strings
    const targetDate = new Date(dateStr);
    targetDate.setDate(targetDate.getDate() - 1);
    const endDate = formatDateISO(targetDate);

    setHabits(prev => prev.map(h => {
      if (h.id !== habitId) return h;
      return { ...h, endDate };
    }));
  }, []);

  const toggleCompletion = useCallback((habitId: string, dateStr: string) => {
    setCompletions(prev => {
      const dayRecord = prev[dateStr] || {};
      const newStatus = !dayRecord[habitId];
      
      return {
        ...prev,
        [dateStr]: {
          ...dayRecord,
          [habitId]: newStatus
        }
      };
    });
  }, []);

  const getCompletionStats = useCallback(() => {
    const stats: Record<string, number> = {};
    Object.values(completions).forEach(dayRecord => {
      Object.entries(dayRecord).forEach(([habitId, isCompleted]) => {
        if (isCompleted) {
          stats[habitId] = (stats[habitId] || 0) + 1;
        }
      });
    });
    return stats;
  }, [completions]);

  return {
    habits,
    completions,
    startDayOfWeek,
    setStartDayOfWeek,
    addHabit,
    updateHabit,
    deleteHabit,
    removeHabitForDate,
    stopHabitFromDate,
    toggleCompletion,
    getCompletionStats
  };
};