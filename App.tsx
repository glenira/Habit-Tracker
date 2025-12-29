import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Plus, ChevronLeft, ChevronRight, BarChart2, Calendar as CalendarIcon, Rows, CalendarCheck } from 'lucide-react';
import { useHabitStore } from './hooks/useHabitStore';
import { getMonthDays, getWeekDays, isHabitDueOnDate } from './utils/dateUtils';
import { HabitPill } from './components/HabitPill';
import { DayDetailModal } from './components/DayDetailModal';
import { AddHabitModal } from './components/AddHabitModal';
import { StatsModal } from './components/StatsModal';
import { ContextMenu } from './components/ContextMenu';
import { WEEKDAYS } from './constants';
import { CalendarDay, ContextMenuPosition } from './types';

const App: React.FC = () => {
  const { 
    habits, 
    completions, 
    startDayOfWeek, 
    setStartDayOfWeek, 
    addHabit, 
    toggleCompletion, 
    deleteHabit,
    removeHabitForDate,
    stopHabitFromDate
  } = useHabitStore();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // View State
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  
  // Modal States
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<ContextMenuPosition | null>(null);

  // Swipe State
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);

  // Responsive: Switch to week view on mobile automatically
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setViewMode('week');
      } else {
        setViewMode('month');
      }
    };
    
    // Set initial
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Derived State
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const days = useMemo(() => {
    if (viewMode === 'month') {
      return getMonthDays(year, month, startDayOfWeek);
    } else {
      return getWeekDays(currentDate, startDayOfWeek);
    }
  }, [year, month, currentDate, startDayOfWeek, viewMode]);

  // Adjust header order based on preference
  const calendarHeaders = useMemo(() => {
    return startDayOfWeek === 'Monday' 
      ? [...WEEKDAYS.slice(1), WEEKDAYS[0]] // ['Mon', ... 'Sat', 'Sun']
      : WEEKDAYS; // ['Sun', ... 'Sat']
  }, [startDayOfWeek]);

  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 7);
      setCurrentDate(newDate);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 7);
      setCurrentDate(newDate);
    }
  };

  const handleToday = () => setCurrentDate(new Date());

  // Swipe Handlers
  const onTouchStart = (e: React.TouchEvent) => {
    touchEnd.current = null;
    touchStart.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    
    const distance = touchStart.current - touchEnd.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  const getHabitsForDay = (date: Date) => {
    return habits.filter(habit => isHabitDueOnDate(habit, date));
  };

  const handleContextMenu = (e: React.MouseEvent, habitId: string, habitName: string, dateStr: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      habitId,
      habitName,
      dateStr
    });
  };

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  // Custom week label if in week view
  const displayLabel = useMemo(() => {
    if (viewMode === 'month') return monthName;
    
    // In week view, show "Oct 22 - Oct 28" or similar
    if (days.length > 0) {
      const first = days[0].date;
      const last = days[6].date;
      if (first.getMonth() !== last.getMonth()) {
         return `${first.toLocaleDateString('en-US', { month: 'short' })} - ${last.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
      }
      return first.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    return monthName;
  }, [viewMode, days, monthName]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800" onClick={() => setContextMenu(null)}>
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm safe-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent truncate hidden xs:block">
              HabitFlow
            </h1>
            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
            
            <div className="flex items-center space-x-1 bg-slate-100 rounded-lg p-1">
              <button onClick={handlePrev} className="p-1 rounded-md hover:bg-white shadow-sm transition-all text-slate-500">
                <ChevronLeft size={18} />
              </button>
              <span className="px-2 text-sm font-semibold min-w-[100px] sm:min-w-[140px] text-center truncate">
                {displayLabel}
              </span>
              <button onClick={handleNext} className="p-1 rounded-md hover:bg-white shadow-sm transition-all text-slate-500">
                <ChevronRight size={18} />
              </button>
            </div>
            
            <button 
              onClick={handleToday} 
              className="p-1.5 sm:px-3 sm:py-1 rounded-md text-slate-500 hover:text-primary hover:bg-slate-100 transition-all"
              title="Go to Today"
            >
              <span className="text-xs font-medium hidden sm:inline">Today</span>
              <CalendarCheck size={18} className="sm:hidden" />
            </button>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
             <button 
              onClick={() => setIsStatsModalOpen(true)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
              title="Stats"
            >
              <BarChart2 size={20} />
            </button>

            {/* View Toggle (Mobile/Desktop) */}
            <button 
              onClick={() => setViewMode(prev => prev === 'month' ? 'week' : 'month')}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all sm:hidden"
              title="Toggle View"
            >
              {viewMode === 'month' ? <Rows size={20} /> : <CalendarIcon size={20} />}
            </button>
            
            {/* Start Week Toggle */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200 ml-1">
              <button 
                onClick={() => setStartDayOfWeek('Monday')}
                className={`px-2 sm:px-3 py-1 text-xs font-semibold rounded-md transition-all ${startDayOfWeek === 'Monday' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}`}
              >
                M
              </button>
              <button 
                onClick={() => setStartDayOfWeek('Sunday')}
                className={`px-2 sm:px-3 py-1 text-xs font-semibold rounded-md transition-all ${startDayOfWeek === 'Sunday' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}`}
              >
                S
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main 
        className="flex-1 overflow-auto p-2 sm:p-6 lg:p-8"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          
          {/* Weekday Headers - Hide in mobile week list view */}
          <div className={`grid grid-cols-7 gap-1 sm:gap-4 mb-2 text-center ${viewMode === 'week' ? 'hidden sm:grid' : ''}`}>
            {calendarHeaders.map(day => (
              <div key={day} className="text-xs sm:text-sm font-medium text-slate-400 uppercase tracking-wide">
                <span className="sm:hidden">{day[0]}</span>
                <span className="hidden sm:inline">{day}</span>
              </div>
            ))}
          </div>

          {/* Calendar Grid / List */}
          <div className={`
            transition-all duration-300
            ${viewMode === 'month' 
              ? 'grid grid-cols-7 grid-rows-6 gap-1 sm:gap-4 min-h-[600px]' 
              : 'flex flex-col gap-3 pb-24 sm:grid sm:grid-cols-7 sm:grid-rows-1 sm:gap-4 sm:h-[600px] sm:pb-0'
            }
          `}>
            {days.map((day, idx) => {
              const dayHabits = getHabitsForDay(day.date);
              // Determine limit based on view. List view shows all.
              const showAllHabits = viewMode === 'week';
              const habitLimit = 4; // limit for month view
              
              const displayedHabits = showAllHabits ? dayHabits : dayHabits.slice(0, habitLimit);
              const hiddenCount = dayHabits.length - displayedHabits.length;

              // Date Label Logic
              const dayLabel = viewMode === 'week' 
                ? day.date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric' }) // "Monday 24"
                : day.date.getDate();

              return (
                <div 
                  key={idx}
                  onClick={() => setSelectedDay(day)}
                  className={`
                    relative bg-white rounded-lg sm:rounded-xl border p-2 sm:p-3 transition-all hover:shadow-md cursor-pointer flex flex-col
                    ${day.isToday ? 'ring-2 ring-primary ring-offset-2 border-transparent' : 'border-slate-100'}
                    ${!day.isCurrentMonth && viewMode === 'month' ? 'opacity-40 bg-slate-50' : ''}
                    ${viewMode === 'week' ? 'min-h-[80px]' : 'overflow-hidden'}
                  `}
                >
                  <div className={`text-xs sm:text-sm font-semibold mb-2 sm:mb-2 text-center sm:text-left ${day.isToday ? 'text-primary' : 'text-slate-600'} ${viewMode === 'week' ? 'text-left ml-1' : ''}`}>
                    {dayLabel}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    {displayedHabits.map(habit => (
                      <HabitPill 
                        key={`${habit.id}-${day.dateStr}`}
                        habit={habit}
                        isCompleted={!!completions[day.dateStr]?.[habit.id]}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCompletion(habit.id, day.dateStr);
                        }}
                        onContextMenu={(e) => handleContextMenu(e, habit.id, habit.name, day.dateStr)}
                        compact
                      />
                    ))}
                    {!showAllHabits && hiddenCount > 0 && (
                      <div className="text-[9px] sm:text-[10px] text-slate-400 font-medium pl-1">
                        + {hiddenCount} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-30 safe-bottom">
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-full shadow-xl shadow-slate-400/50 transition-all hover:scale-110 flex items-center justify-center group"
        >
          <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>

      {/* Modals */}
      <DayDetailModal 
        isOpen={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        day={selectedDay}
        habits={selectedDay ? getHabitsForDay(selectedDay.date) : []}
        completions={selectedDay ? completions[selectedDay.dateStr] || {} : {}}
        onToggleHabit={(habitId) => selectedDay && toggleCompletion(habitId, selectedDay.dateStr)}
        onContextMenu={(e, habitId) => {
          const habit = habits.find(h => h.id === habitId);
          if (habit && selectedDay) {
            handleContextMenu(e, habitId, habit.name, selectedDay.dateStr);
          }
        }}
      />

      <AddHabitModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={addHabit}
      />

      <StatsModal 
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        habits={habits}
        completions={completions}
        startDayOfWeek={startDayOfWeek}
      />

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          habitName={contextMenu.habitName}
          onClose={() => setContextMenu(null)}
          onRemoveToday={() => removeHabitForDate(contextMenu.habitId, contextMenu.dateStr)}
          onRemoveFuture={() => stopHabitFromDate(contextMenu.habitId, contextMenu.dateStr)}
          onDelete={() => deleteHabit(contextMenu.habitId)}
        />
      )}
    </div>
  );
};

export default App;