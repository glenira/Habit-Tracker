import React from 'react';
import { X, Calendar } from 'lucide-react';
import { Habit, CalendarDay } from '../types';
import { HabitPill } from './HabitPill';

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  day: CalendarDay | null;
  habits: Habit[];
  completions: Record<string, boolean>;
  onToggleHabit: (habitId: string) => void;
  onContextMenu: (e: React.MouseEvent, habitId: string) => void;
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({
  isOpen,
  onClose,
  day,
  habits,
  completions,
  onToggleHabit,
  onContextMenu,
}) => {
  if (!isOpen || !day) return null;

  // Format date for display
  const displayDate = day.date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2 text-slate-700">
            <Calendar size={20} className="text-slate-400" />
            <h2 className="text-lg font-semibold">{displayDate}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {habits.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <p>No habits scheduled for this day.</p>
              <p className="text-sm mt-2">Click the + button to add some!</p>
            </div>
          ) : (
            <div className="space-y-1">
              {habits.map(habit => (
                <HabitPill
                  key={habit.id}
                  habit={habit}
                  isCompleted={!!completions[habit.id]}
                  onClick={() => onToggleHabit(habit.id)}
                  onContextMenu={(e) => onContextMenu(e, habit.id)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="bg-slate-50 px-6 py-3 text-center text-xs text-slate-400 border-t border-slate-100">
          Click to toggle • Right-click to edit/remove
        </div>
      </div>
    </div>
  );
};