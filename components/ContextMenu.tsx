import React, { useEffect, useRef } from 'react';
import { Trash2, CalendarX, Slash } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onRemoveToday: () => void;
  onRemoveFuture: () => void;
  onDelete: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ 
  x, 
  y, 
  onClose, 
  onRemoveToday, 
  onRemoveFuture, 
  onDelete 
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    // Slight delay to prevent immediate closing if the click registered simultaneously
    const timeout = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Adjust position to keep within viewport
  const style: React.CSSProperties = {
    top: y,
    left: x,
  };
  
  // Simple viewport check adjustment
  if (typeof window !== 'undefined') {
    if (x + 200 > window.innerWidth) {
      style.left = x - 200;
    }
    if (y + 150 > window.innerHeight) {
      style.top = y - 150;
    }
  }

  return (
    <div 
      ref={menuRef}
      className="fixed z-[100] w-56 bg-white rounded-lg shadow-xl border border-slate-200 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
      style={style}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
        Manage Habit
      </div>
      
      <button 
        onClick={() => { onRemoveToday(); onClose(); }}
        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary flex items-center gap-2 transition-colors"
      >
        <Slash size={16} />
        Remove for this day
      </button>

      <button 
        onClick={() => { onRemoveFuture(); onClose(); }}
        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary flex items-center gap-2 transition-colors"
      >
        <CalendarX size={16} />
        Remove future days
      </button>

      <div className="my-1 border-t border-slate-100"></div>

      <button 
        onClick={() => { onDelete(); onClose(); }}
        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
      >
        <Trash2 size={16} />
        Delete entirely
      </button>
    </div>
  );
};