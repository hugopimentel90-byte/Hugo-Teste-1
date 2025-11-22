import React, { useState, useMemo } from 'react';
import { List, Card } from '../../types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CardItem } from './CardItem';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { MoreHorizontal, Plus, X, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useStore } from '../../store';

interface ListItemProps {
  list: List;
  cards: Card[];
  onCardClick: (cardId: string) => void;
}

export const ListItem: React.FC<ListItemProps> = ({ list, cards, onCardClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: list.id,
    data: {
      type: 'List',
      list,
    }
  });

  const updateListTitle = useStore(state => state.updateListTitle);
  const createCard = useStore(state => state.createCard);
  const deleteList = useStore(state => state.deleteList);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const handleTitleSubmit = () => {
    if (title.trim()) updateListTitle(list.id, title);
    setIsEditingTitle(false);
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCardTitle.trim()) {
      createCard(list.id, newCardTitle);
      setNewCardTitle('');
      setIsAddingCard(true); // Keep input open
    }
  };

  const confirmDelete = () => {
    deleteList(list.id);
    setShowDeleteConfirm(false);
  };

  const cardIds = useMemo(() => cards.map(c => c.id), [cards]);

  if (isDragging) {
    return (
      <div 
        ref={setNodeRef} 
        style={style}
        className="bg-slate-100/50 dark:bg-slate-800/50 opacity-50 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl w-[280px] shrink-0 h-[500px]"
      />
    );
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="bg-slate-100 dark:bg-slate-900/50 w-[280px] shrink-0 rounded-xl flex flex-col max-h-full shadow-sm border border-slate-200 dark:border-slate-800"
      >
        {/* List Header */}
        <div 
          {...attributes} 
          {...listeners}
          className="p-3 flex items-center justify-between cursor-grab active:cursor-grabbing"
        >
          {isEditingTitle ? (
              <input 
                  autoFocus
                  className="bg-white dark:bg-slate-800 px-2 py-1 rounded border border-primary-500 outline-none text-sm w-full font-medium"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleTitleSubmit}
                  onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
              />
          ) : (
              <h3 
                  className="text-sm font-semibold text-slate-700 dark:text-slate-200 px-2 py-1 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 rounded"
                  onClick={() => setIsEditingTitle(true)}
              >
                  {list.title}
              </h3>
          )}
          <div className="relative group">
              <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500">
                  <MoreHorizontal size={16} />
              </button>
              {/* Simple dropdown for delete */}
              <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-white dark:bg-slate-800 shadow-lg rounded p-1 z-10 border dark:border-slate-700">
                  <button 
                      className="text-xs text-red-500 whitespace-nowrap px-3 py-1 hover:bg-red-50 dark:hover:bg-red-900/30 rounded w-full text-left"
                      onClick={() => setShowDeleteConfirm(true)}
                  >
                      Excluir Lista
                  </button>
              </div>
          </div>
        </div>

        {/* Cards Area */}
        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2 min-h-[50px]">
          <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
            {cards.map(card => (
              <CardItem key={card.id} card={card} onClick={() => onCardClick(card.id)} />
            ))}
          </SortableContext>
        </div>

        {/* Add Card Footer */}
        <div className="p-2 m-1">
          {isAddingCard ? (
            <form onSubmit={handleAddCard} className="space-y-2">
              <textarea
                autoFocus
                placeholder="Insira um título para este cartão..."
                className="w-full p-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 outline-none resize-none shadow-sm"
                rows={2}
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                onKeyDown={(e) => {
                  if(e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddCard(e);
                  }
                }}
              />
              <div className="flex items-center gap-2">
                <Button type="submit" size="sm">Adicionar</Button>
                <button 
                  type="button" 
                  onClick={() => setIsAddingCard(false)}
                  className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  <X size={20} />
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingCard(true)}
              className="flex items-center gap-2 w-full p-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors"
            >
              <Plus size={16} />
              <span>Adicionar um cartão</span>
            </button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Excluir Lista" width="sm">
         <div className="space-y-4">
           <div className="flex items-start gap-3 text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-100 dark:border-amber-900/50">
             <AlertTriangle size={24} className="shrink-0 mt-0.5" />
             <div>
               <h3 className="font-semibold text-sm mb-1">Atenção: Ação Irreversível</h3>
               <p className="text-xs opacity-90">
                 Tem certeza que deseja excluir a lista "<strong>{list.title}</strong>"? Todos os cartões dentro dela serão perdidos.
               </p>
             </div>
           </div>
           
           <div className="flex justify-end gap-2 pt-2">
             <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
               Cancelar
             </Button>
             <Button variant="danger" onClick={confirmDelete}>
               Sim, Excluir
             </Button>
           </div>
         </div>
      </Modal>
    </>
  );
};