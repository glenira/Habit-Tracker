import React, { useState } from 'react';
import { X, Plus, Check } from 'lucide-react';
import { Habit, FrequencyType } from '../types';
import { HABIT_COLORS, PREDEFINED_TEMPLATES, WEEKDAYS } from '../constants';
import { formatDateISO } from '../utils/dateUtils';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habit: Habit) => void;
}

export const AddHabitModal: React.FC<AddHabitModalProps> = ({ isOpen, onClose, onSave }) => {
  const [mode, setMode] = useState<'template' | 'custom'>('template');
  
  // Form State
  const [name, setName] = useState('');
  const [color, setColor] = useState('purple');
  const [freqType, setFreqType] = useState<FrequencyType>('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri default
  const [category, setCategory] = useState<Habit['category']>('general');

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setColor('purple');
    setFreqType('daily');
    setSelectedDays([1, 2, 3, 4, 5]);
    setCategory('general');
    setMode('template');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleTemplateSelect = (template: typeof PREDEFINED_TEMPLATES[0]) => {
    setName(template.name);
    setColor(template.defaultColor);
    setCategory(template.category);
    setMode('custom');
  };

  const handleSave = () => {
    if (!name.trim()) return;
    if (freqType === 'specific' && selectedDays.length === 0) return;

    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name,
      color,
      category,
      startDate: formatDateISO(new Date()),
      archived: false,
      frequency: {
        type: freqType,
        daysOfWeek: freqType === 'specific' ? selectedDays : undefined
      }
    };

    onSave(newHabit);
    handleClose();
  };

  const toggleDay = (dayIndex: number) => {
    setSelectedDays(prev => {
      if (prev.includes(dayIndex)) {
        return prev.filter(d => d !== dayIndex);
      } else {
        return [...prev, dayIndex].sort();
      }
    });
  };

  const isSaveDisabled = !name.trim() || (freqType === 'specific' && selectedDays.length === 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={handleClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">
            {mode === 'template' ? 'New Habit' : 'Configure Habit'}
          </h2>
          <button onClick={handleClose} className="p-1 rounded-full hover:bg-slate-200 text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {mode === 'template' ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-3 uppercase tracking-wider">Choose a Template</h3>
                <div className="grid grid-cols-2 gap-3">
                  {PREDEFINED_TEMPLATES.map((t) => (
                    <button
                      key={t.name}
                      onClick={() => handleTemplateSelect(t)}
                      className="flex items-center p-3 rounded-xl border border-slate-200 hover:border-primary hover:bg-slate-50 transition-all text-left group"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${HABIT_COLORS.find(c=>c.value===t.defaultColor)?.class}`}>
                        <span className="font-bold text-xs">{t.name[0]}</span>
                      </div>
                      <span className="text-slate-700 font-medium group-hover:text-primary">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">Or</span>
                </div>
              </div>

              <button 
                onClick={() => setMode('custom')}
                className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all font-medium flex items-center justify-center"
              >
                <Plus size={18} className="mr-2" />
                Create Custom Habit
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Habit Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Read 10 pages"
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow"
                  autoFocus
                />
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Color Category</label>
                <div className="flex flex-wrap gap-3">
                  {HABIT_COLORS.map(c => (
                    <button
                      key={c.value}
                      onClick={() => setColor(c.value)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform ${c.active} ${color === c.value ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'opacity-70 hover:opacity-100 hover:scale-105'}`}
                      title={c.name}
                    >
                      {color === c.value && <Check size={16} className="text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Frequency</label>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2">
                  {(['daily', 'weekdays', 'weekends', 'specific'] as FrequencyType[]).map(type => (
                    <button
                      key={type}
                      onClick={() => setFreqType(type)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border capitalize
                        ${freqType === type 
                          ? 'bg-slate-800 text-white border-slate-800' 
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {freqType === 'specific' && (
                  <div className="mt-3 flex justify-between">
                    {WEEKDAYS.map((day, index) => {
                      // WEEKDAYS index 0 is Sun, 1 is Mon... which matches JS getDay()
                      return (
                        <button
                          key={day}
                          onClick={() => toggleDay(index)}
                          className={`w-9 h-9 rounded-full text-xs font-bold transition-colors
                            ${selectedDays.includes(index)
                              ? 'bg-primary text-white'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            }`}
                        >
                          {day[0]}
                        </button>
                      );
                    })}
                  </div>
                )}
                {freqType === 'specific' && selectedDays.length === 0 && (
                  <p className="text-xs text-red-500 mt-2">Please select at least one day.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {mode === 'custom' && (
          <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
            <button 
              onClick={() => setMode('template')}
              className="px-4 py-2 text-slate-600 font-medium hover:text-slate-800"
            >
              Back
            </button>
            <button
              onClick={handleSave}
              disabled={isSaveDisabled}
              className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium shadow-lg shadow-slate-300 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Create Habit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};