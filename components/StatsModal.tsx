import React, { useState, useMemo } from 'react';
import { X, Trophy, TrendingUp, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Habit, HabitCompletion } from '../types';
import { HABIT_COLORS } from '../constants';
import { getWeekRange, formatDateISO } from '../utils/dateUtils';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  habits: Habit[];
  completions: HabitCompletion;
  startDayOfWeek: 'Sunday' | 'Monday';
}

type TimeRange = 'week' | 'month' | 'year';

export const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose, habits, completions, startDayOfWeek }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  
  // Calculate current date context
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-11

  // Calculate week range
  const { start: weekStart, end: weekEnd } = useMemo(() => getWeekRange(now, startDayOfWeek), [now, startDayOfWeek]);
  const weekStartStr = formatDateISO(weekStart);
  const weekEndStr = formatDateISO(weekEnd);

  // Filter completions based on TimeRange
  const stats = useMemo<Record<string, number>>(() => {
    const calculatedStats: Record<string, number> = {};
    
    Object.keys(completions).forEach(dateStr => {
      const date = new Date(dateStr);
      
      let include = false;
      if (timeRange === 'year') {
        include = date.getFullYear() === currentYear;
      } else if (timeRange === 'month') {
        include = date.getFullYear() === currentYear && date.getMonth() === currentMonth;
      } else if (timeRange === 'week') {
        include = dateStr >= weekStartStr && dateStr <= weekEndStr;
      }

      if (include) {
        const dayRecord = completions[dateStr];
        Object.entries(dayRecord).forEach(([habitId, isCompleted]) => {
          if (isCompleted) {
            calculatedStats[habitId] = (calculatedStats[habitId] || 0) + 1;
          }
        });
      }
    });
    
    return calculatedStats;
  }, [completions, timeRange, currentYear, currentMonth, weekStartStr, weekEndStr]);

  if (!isOpen) return null;

  // Filter out inactive habits (e.g. specific days but none selected)
  const activeHabits = habits.filter(h => {
    if (h.frequency.type === 'specific') {
      return h.frequency.daysOfWeek && h.frequency.daysOfWeek.length > 0;
    }
    return true;
  });

  interface ChartDataItem {
    name: string;
    count: number;
    color: string;
  }

  const data: ChartDataItem[] = activeHabits.map(h => ({
    name: h.name,
    count: (stats[h.id] as number) || 0,
    color: HABIT_COLORS.find(c => c.value === h.color)?.active.split(' ')[0].replace('bg-', '') || 'gray-500'
  })).sort((a, b) => b.count - a.count);

  const getColorHex = (twColor: string) => {
    const map: Record<string, string> = {
      'purple-500': '#a855f7',
      'green-500': '#22c55e',
      'blue-500': '#3b82f6',
      'orange-500': '#f97316',
      'pink-500': '#ec4899',
      'teal-500': '#14b8a6',
      'rose-500': '#f43f5e',
      'slate-500': '#64748b',
    };
    return map[twColor] || '#cbd5e1';
  };

  const totalCompletions = Object.values(stats).reduce((a: number, b: number) => a + b, 0);

  const rangeLabel = {
    'year': `Year ${currentYear}`,
    'month': now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    'week': 'This Week'
  }[timeRange];

  const topPerformer = data.length > 0 ? data[0] : null;

  // Calculate dynamic height for the chart to avoid squishing bars
  // Base height 250px, add 40px per item
  const chartHeight = Math.max(250, data.length * 40);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex-none px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2">
            <Trophy className="text-yellow-500" size={24} />
            <h2 className="text-xl font-bold text-slate-800">Your Progress</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-none px-6 py-3 bg-slate-50/50 border-b border-slate-100 flex justify-end">
          <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
             {(['week', 'month', 'year'] as TimeRange[]).map((r) => (
               <button
                 key={r}
                 onClick={() => setTimeRange(r)}
                 className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                   timeRange === r 
                     ? 'bg-slate-800 text-white shadow-sm' 
                     : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                 }`}
               >
                 {r.charAt(0).toUpperCase() + r.slice(1)}
               </button>
             ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">{rangeLabel} Stats</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
             <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-2 relative z-10">
                   <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                      <TrendingUp size={20} />
                   </div>
                   <h3 className="font-semibold text-slate-700">Completions</h3>
                </div>
                <p className="text-4xl font-bold text-slate-900 relative z-10">{totalCompletions}</p>
                <p className="text-sm text-slate-500 mt-1 relative z-10">in {rangeLabel}</p>
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-purple-200/50 rounded-full blur-2xl"></div>
             </div>
             
             <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
                <h3 className="font-semibold text-slate-700 mb-4">Top Performer</h3>
                {topPerformer && (topPerformer.count as number) > 0 ? (
                  <div>
                    <span className="text-2xl font-bold text-slate-900 block truncate" title={topPerformer.name}>{topPerformer.name}</span>
                    <span className="text-sm text-slate-500">{topPerformer.count} times completed</span>
                  </div>
                ) : (
                  <p className="text-slate-400">No data for this period</p>
                )}
             </div>
          </div>

          <div className="w-full">
            <h3 className="font-semibold text-slate-700 mb-4">Breakdown</h3>
            {(totalCompletions as number) > 0 ? (
              <div style={{ height: `${chartHeight}px` }} className="w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} layout="vertical" margin={{ left: 10, right: 30, top: 0, bottom: 0 }}>
                    <XAxis type="number" hide domain={[0, 'dataMax']} />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={100} 
                      tick={{fontSize: 12, fill: '#64748b'}} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      cursor={{fill: '#f1f5f9', opacity: 0.4}}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getColorHex(entry.color)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-slate-300">
                <div className="text-center">
                  <Calendar size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No activity recorded</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};