import React, { useState, useMemo } from 'react';
import { useStore } from '../../store';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { ListItem } from './ListItem';
import { CardItem } from './CardItem';
import { Card, List } from '../../types';
import { createPortal } from 'react-dom';
import { CardModal } from '../CardModal';
import { Button } from '../ui/Button';
import { Plus } from 'lucide-react';

export const BoardView: React.FC = () => {
  const { 
    lists, 
    cards, 
    currentBoardId, 
    moveCard, 
    reorderList,
    createList 
  } = useStore();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [activeList, setActiveList] = useState<List | null>(null);
  
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  // Filter items for current board
  const boardLists = useMemo(() => 
    lists
      .filter(l => l.boardId === currentBoardId)
      .sort((a, b) => a.order - b.order), 
  [lists, currentBoardId]);

  const listIds = useMemo(() => boardLists.map(l => l.id), [boardLists]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 3 }, // Avoid accidental drags
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddList = (e: React.FormEvent) => {
    e.preventDefault();
    if (newListTitle.trim() && currentBoardId) {
      createList(currentBoardId, newListTitle);
      setNewListTitle('');
      setIsAddingList(false);
    }
  };

  // --- Drag Handlers ---

  const onDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const id = active.id as string;
    setActiveId(id);

    if (active.data.current?.type === 'List') {
      setActiveList(active.data.current.list);
      setActiveCard(null);
    } else if (active.data.current?.type === 'Card') {
      setActiveCard(active.data.current.card);
      setActiveList(null);
    }
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveCard = active.data.current?.type === 'Card';
    const isOverCard = over.data.current?.type === 'Card';
    const isOverList = over.data.current?.type === 'List';

    if (!isActiveCard) return;

    // Scenario 1: Dragging a card over another card
    if (isActiveCard && isOverCard) {
        const activeCardData = active.data.current?.card as Card;
        const overCardData = over.data.current?.card as Card;
        
        if (activeCardData && overCardData && activeCardData.listId !== overCardData.listId) {
            // Visual update only (handled by state update in dragEnd usually, but we can do real-time updates here if we want super smooth cross-list)
            // For simplicity in this implementation, we let DragEnd handle the state commit.
        }
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveCard(null);
    setActiveList(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const isActiveList = active.data.current?.type === 'List';
    
    // Handling List Reordering
    if (isActiveList) {
        const oldIndex = boardLists.findIndex(l => l.id === activeId);
        const newIndex = boardLists.findIndex(l => l.id === overId);
        if (oldIndex !== newIndex) {
            reorderList(activeId, newIndex);
        }
        return;
    }

    // Handling Card Movement
    const isActiveCard = active.data.current?.type === 'Card';
    if (isActiveCard) {
        const activeCardData = active.data.current?.card as Card;
        
        // Find source and destination containers
        const sourceListId = activeCardData.listId;
        let destListId = '';
        let newIndex = 0;

        if (over.data.current?.type === 'List') {
            // Dropped directly onto a list container
            destListId = overId;
            const destCards = cards.filter(c => c.listId === destListId);
            newIndex = destCards.length; // Append to end
        } else if (over.data.current?.type === 'Card') {
            // Dropped onto another card
            const overCardData = over.data.current?.card as Card;
            destListId = overCardData.listId;
            const destCards = cards.filter(c => c.listId === destListId).sort((a,b) => a.order - b.order);
            const overCardIndex = destCards.findIndex(c => c.id === overId);
            
            // Calculate if dropping above or below
            // Simple logic: replace the index
            newIndex = overCardIndex; 
            // Note: dnd-kit sortable strategy handles the visual displacement, we just need the target index
            if (activeCardData.id !== overCardData.id && activeCardData.listId === overCardData.listId) {
                 // Reordering in same list logic handled by sortable context mostly, but we need precise index
                 // We rely on the fact that the store handles splice logic
            }
        }

        if (destListId) {
            moveCard(activeId, sourceListId, destListId, newIndex);
        }
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="h-full p-4 flex items-start gap-4">
            <SortableContext items={listIds} strategy={horizontalListSortingStrategy}>
              {boardLists.map((list) => (
                <ListItem
                  key={list.id}
                  list={list}
                  cards={cards
                    .filter(c => c.listId === list.id)
                    .sort((a, b) => a.order - b.order)}
                  onCardClick={setSelectedCardId}
                />
              ))}
            </SortableContext>

            {/* Add List Button/Form */}
            <div className="w-[280px] shrink-0">
              {!isAddingList ? (
                <button
                  onClick={() => setIsAddingList(true)}
                  className="w-full bg-white/20 hover:bg-white/30 text-white p-3 rounded-xl flex items-center gap-2 backdrop-blur-sm transition-colors font-medium"
                >
                  <Plus size={20} />
                  Add another list
                </button>
              ) : (
                <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg animate-in fade-in zoom-in duration-200">
                  <form onSubmit={handleAddList}>
                    <input
                      autoFocus
                      className="w-full p-2 text-sm rounded border border-primary-500 outline-none mb-2 dark:bg-slate-800 dark:text-white"
                      placeholder="Enter list title..."
                      value={newListTitle}
                      onChange={(e) => setNewListTitle(e.target.value)}
                    />
                    <div className="flex items-center gap-2">
                      <Button type="submit" size="sm">Add List</Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddingList(false)}>Cancel</Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>

        {createPortal(
          <DragOverlay>
            {activeCard && <CardItem card={activeCard} onClick={() => {}} />}
            {activeList && (
                <div className="bg-slate-100 dark:bg-slate-900 w-[280px] h-[400px] rounded-xl shadow-2xl border-2 border-primary-500 opacity-90 p-3">
                    <div className="font-bold text-slate-700 dark:text-slate-200">{activeList.title}</div>
                </div>
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>

      <CardModal 
        cardId={selectedCardId} 
        onClose={() => setSelectedCardId(null)} 
      />
    </div>
  );
};