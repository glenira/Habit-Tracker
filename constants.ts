import { HabitTemplate } from './types';

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const HABIT_COLORS = [
  { name: 'Purple', value: 'purple', class: 'bg-purple-200 text-purple-900 border-purple-300', active: 'bg-purple-500 text-white' },
  { name: 'Green', value: 'green', class: 'bg-green-200 text-green-900 border-green-300', active: 'bg-green-500 text-white' },
  { name: 'Blue', value: 'blue', class: 'bg-blue-200 text-blue-900 border-blue-300', active: 'bg-blue-500 text-white' },
  { name: 'Orange', value: 'orange', class: 'bg-orange-200 text-orange-900 border-orange-300', active: 'bg-orange-500 text-white' },
  { name: 'Pink', value: 'pink', class: 'bg-pink-200 text-pink-900 border-pink-300', active: 'bg-pink-500 text-white' },
  { name: 'Teal', value: 'teal', class: 'bg-teal-200 text-teal-900 border-teal-300', active: 'bg-teal-500 text-white' },
  { name: 'Rose', value: 'rose', class: 'bg-rose-200 text-rose-900 border-rose-300', active: 'bg-rose-500 text-white' },
  { name: 'Slate', value: 'slate', class: 'bg-slate-200 text-slate-900 border-slate-300', active: 'bg-slate-500 text-white' },
];

export const PREDEFINED_TEMPLATES: HabitTemplate[] = [
  { name: 'Sober', category: 'health', defaultColor: 'green' },
  { name: 'Vitamins/Iron', category: 'health', defaultColor: 'green' },
  { name: 'Gratitude', category: 'health', defaultColor: 'green' },
  { name: 'Sport (Full Body)', category: 'sport', defaultColor: 'purple' },
  { name: 'Stretch', category: 'sport', defaultColor: 'purple' },
  { name: 'Steps 1000', category: 'sport', defaultColor: 'purple' },
  { name: 'English', category: 'work', defaultColor: 'blue' },
  { name: 'Portfolio/Figma', category: 'work', defaultColor: 'blue' },
  { name: 'Accounting', category: 'work', defaultColor: 'blue' },
  { name: 'Interview Prep', category: 'work', defaultColor: 'blue' },
];
