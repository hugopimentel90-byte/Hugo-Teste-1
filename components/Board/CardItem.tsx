import React from 'react';
import { Card } from '../../types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MessageSquare, CheckSquare, Clock } from 'lucide-react';

interface CardItemProps {
  card: Card;
  onClick: () => void;
}

export const CardItem: React.FC<CardItemProps> = ({ card, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: card.id,
    data: {
      type: 'Card',
      card,
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div 
        ref={setNodeRef} 
        style={style}
        className="bg-slate-50 dark:bg-slate-800 opacity-40 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg h-[100px] w-full"
      />
    );
  }

  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="group bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-500 cursor-grab active:cursor-grabbing transition-all"
    >
      {/* Labels */}
      {card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {card.labels.map((label) => (
            <div
              key={label.id}
              className={`h-2 w-8 rounded-full ${label.color}`}
              title={label.text}
            />
          ))}
        </div>
      )}

      <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2 leading-tight">
        {card.title}
      </h4>

      <div className="flex items-center gap-3 text-slate-400 text-xs">
        {card.description && (
          <div className="flex items-center gap-1" title="Has description">
            <div className="w-4 h-[2px] bg-slate-400 rounded-full"/>
            <div className="w-4 h-[2px] bg-slate-400 rounded-full"/>
            <div className="w-2 h-[2px] bg-slate-400 rounded-full"/>
          </div>
        )}
        {card.dueDate && (
            <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-500 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded' : ''}`}>
                <Clock size={12} />
                <span>{new Date(card.dueDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
            </div>
        )}
        {(card.checklist.length > 0) && (
          <div className="flex items-center gap-1">
            <CheckSquare size={12} />
            <span>{card.checklist.filter(c => c.completed).length}/{card.checklist.length}</span>
          </div>
        )}
        {(card.comments.length > 0) && (
          <div className="flex items-center gap-1">
            <MessageSquare size={12} />
            <span>{card.comments.length}</span>
          </div>
        )}
      </div>
    </div>
  );
};