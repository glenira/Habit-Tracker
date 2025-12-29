import React from 'react';
import { Check } from 'lucide-react';
import { Habit } from '../types';
import { HABIT_COLORS } from '../constants';

interface HabitPillProps {
  habit: Habit;
  isCompleted: boolean;
  onClick: (e: React.MouseEvent) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  compact?: boolean; // For month view
  className?: string;
}

export const HabitPill: React.FC<HabitPillProps> = ({ habit, isCompleted, onClick, onContextMenu, compact = false, className = '' }) => {
  const colorDef = HABIT_COLORS.find(c => c.value === habit.color) || HABIT_COLORS[0];
  
  // Base styles
  const baseClasses = `
    cursor-pointer 
    transition-all 
    duration-200 
    rounded-full 
    flex 
    items-center 
    select-none
    ${className}
  `;

  // Specific styles for state
  const stateClasses = isCompleted 
    ? `${colorDef.active} opacity-80 shadow-inner` // Completed: Solid color
    : `${colorDef.class} hover:opacity-80 hover:shadow-sm`; // Active: Pastel

  const textClasses = isCompleted ? 'line-through opacity-75' : '';

  if (compact) {
    return (
      <div 
        onClick={onClick}
        onContextMenu={onContextMenu}
        className={`${baseClasses} ${stateClasses} text-[10px] px-1.5 py-0.5 truncate max-w-full mb-1`}
        title={habit.name}
      >
        {isCompleted && <Check size={10} className="mr-1 flex-shrink-0" />}
        <span className={`truncate ${textClasses} font-medium`}>{habit.name}</span>
      </div>
    );
  }

  // Detail view (larger)
  return (
    <div 
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={`${baseClasses} ${stateClasses} text-sm px-3 py-2 w-full mb-2 justify-between shadow-sm`}
    >
      <div className="flex items-center overflow-hidden">
        {isCompleted && <div className="bg-white/20 rounded-full p-0.5 mr-2"><Check size={14} /></div>}
        <span className={`truncate font-medium ${textClasses}`}>{habit.name}</span>
      </div>
    </div>
  );
};