import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { Card, Label } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { AlignLeft, CheckSquare, Clock, MessageSquare, Tag, Trash2, Calendar, X, Plus, AlertTriangle } from 'lucide-react';

interface CardModalProps {
  cardId: string | null;
  onClose: () => void;
}

export const CardModal: React.FC<CardModalProps> = ({ cardId, onClose }) => {
  const card = useStore((state) => state.cards.find((c) => c.id === cardId));
  const list = useStore((state) => state.lists.find((l) => l.id === card?.listId));
  const currentUser = useStore((state) => state.user);
  
  const updateCard = useStore((state) => state.updateCard);
  const deleteCard = useStore((state) => state.deleteCard);
  const addChecklistItem = useStore((state) => state.addChecklistItem);
  const toggleChecklistItem = useStore((state) => state.toggleChecklistItem);
  const deleteChecklistItem = useStore((state) => state.deleteChecklistItem);
  const addComment = useStore((state) => state.addComment);
  const deleteComment = useStore((state) => state.deleteComment);

  const [commentText, setCommentText] = useState('');
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descText, setDescText] = useState('');
  
  // Checklists
  const [newItemText, setNewItemText] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);

  // Popovers and Modals
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Date Logic
  const getSafeDateStr = (isoStr?: string) => {
      if (!isoStr) return '';
      return isoStr.split('T')[0];
  }
  const [dateValue, setDateValue] = useState(getSafeDateStr(card?.dueDate));

  // Refs for clicking outside
  const datePickerRef = useRef<HTMLDivElement>(null);
  const labelPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (card) {
        setDescText(card.description || '');
        setDateValue(getSafeDateStr(card.dueDate));
    }
  }, [card]);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
      if (labelPickerRef.current && !labelPickerRef.current.contains(event.target as Node)) {
        setShowLabelPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!card) return null;

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    deleteCard(card.id);
    onClose();
  };

  const handleSaveDesc = () => {
    updateCard(card.id, { description: descText });
    setIsEditingDesc(false);
  };

  const handleSaveComment = () => {
    if (commentText.trim()) {
      addComment(card.id, commentText);
      setCommentText('');
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateValue(e.target.value);
  };

  const saveDate = () => {
      if (dateValue) {
          updateCard(card.id, { dueDate: dateValue });
      }
      setShowDatePicker(false);
  }

  const removeDate = () => {
    updateCard(card.id, { dueDate: undefined });
    setDateValue('');
    setShowDatePicker(false);
  };

  const toggleLabel = (color: string, text: string) => {
    const exists = card.labels.find(l => l.color === color);
    let newLabels;
    if (exists) {
      newLabels = card.labels.filter(l => l.color !== color);
    } else {
      newLabels = [...card.labels, { id: Math.random().toString(), color, text }];
    }
    updateCard(card.id, { labels: newLabels });
  };

  const handleAddItem = (e: React.FormEvent) => {
      e.preventDefault();
      if(newItemText.trim()) {
          addChecklistItem(card.id, newItemText);
          setNewItemText('');
          setIsAddingItem(true); // keep focus
      }
  }

  const colors = [
    { class: 'bg-red-500', name: 'Alta' },
    { class: 'bg-yellow-500', name: 'Média' },
    { class: 'bg-green-500', name: 'Baixa' },
  ];

  const isOverdue = card.dueDate && new Date(card.dueDate).setHours(0,0,0,0) < new Date().setHours(0,0,0,0);

  const getInitials = (name: string) => {
      return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <>
      <Modal isOpen={!!cardId} onClose={onClose} title="Editar Cartão" width="lg">
        <div className="space-y-6">
          {/* Header Section */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">{card.title}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              na lista <span className="font-semibold underline decoration-slate-300 underline-offset-2">{list?.title}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="md:col-span-3 space-y-6">
              
              {/* Label Badges (Visible) */}
              {card.labels.length > 0 && (
                 <div>
                   <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">Prioridade</h3>
                   <div className="flex flex-wrap gap-2">
                     {card.labels.map(l => (
                       <div key={l.id} className={`${l.color} pl-3 pr-2 py-1 rounded-md text-sm font-semibold text-white shadow-sm flex items-center gap-2 group`}>
                         {l.text}
                         <button 
                            onClick={() => toggleLabel(l.color, l.text)}
                            className="hover:bg-white/20 rounded-full p-0.5 transition-colors opacity-70 hover:opacity-100 focus:outline-none"
                            title="Remover prioridade"
                         >
                           <X size={14} />
                         </button>
                       </div>
                     ))}
                     <button 
                        onClick={() => setShowLabelPicker(!showLabelPicker)} 
                        className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 p-1.5 rounded text-slate-500 dark:text-slate-400 transition-colors"
                        title="Adicionar prioridade"
                     >
                         <Plus size={16} />
                     </button>
                   </div>
                 </div>
              )}

              {/* Due Date Display */}
              {card.dueDate && (
                 <div>
                   <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">Data de Entrega</h3>
                   <div className="flex items-center gap-3">
                     <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded text-slate-700 dark:text-slate-200 text-sm font-medium">
                       <CheckSquare size={16} />
                       <span>{new Date(card.dueDate).toLocaleDateString()}</span>
                       <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${isOverdue ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                          {isOverdue ? 'Atrasado' : 'Em dia'}
                       </span>
                     </div>
                   </div>
                 </div>
              )}

              {/* Description */}
              <div>
                <div className="flex items-center gap-2 mb-2 text-slate-900 dark:text-slate-100">
                  <AlignLeft size={20} />
                  <h3 className="font-semibold text-lg">Descrição</h3>
                </div>
                {isEditingDesc || !card.description ? (
                  <div className="space-y-2">
                    <textarea 
                      className="w-full p-3 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                      placeholder="Adicione uma descrição mais detalhada..."
                      value={isEditingDesc ? descText : (card.description || '')}
                      onChange={(e) => setDescText(e.target.value)}
                      onFocus={() => {
                        if (!isEditingDesc) {
                          setDescText(card.description || '');
                          setIsEditingDesc(true);
                        }
                      }}
                    />
                    {isEditingDesc && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveDesc}>Salvar</Button>
                        <Button size="sm" variant="ghost" onClick={() => setIsEditingDesc(false)}>Cancelar</Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div 
                    onClick={() => { setIsEditingDesc(true); setDescText(card.description || ''); }}
                    className="p-3 rounded-md bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer min-h-[60px]"
                  >
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{card.description}</p>
                  </div>
                )}
              </div>

              {/* Checklist */}
              <div>
                <div className="flex items-center justify-between mb-3 text-slate-900 dark:text-slate-100">
                  <div className="flex items-center gap-2">
                      <CheckSquare size={20} />
                      <h3 className="font-semibold text-lg">Checklist</h3>
                  </div>
                  {card.checklist.length > 0 && (
                       <span className="text-xs text-slate-500 font-medium">
                           {Math.round((card.checklist.filter(i => i.completed).length / card.checklist.length) * 100)}%
                       </span>
                  )}
                </div>
                
                {/* Progress Bar */}
                {card.checklist.length > 0 && (
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-4">
                      <div 
                          className="h-full bg-primary-500 transition-all duration-500"
                          style={{ width: `${(card.checklist.filter(i => i.completed).length / card.checklist.length) * 100}%` }}
                      />
                  </div>
                )}

                <div className="space-y-3">
                   {card.checklist.map(item => (
                     <div key={item.id} className="group flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded-md transition-colors -mx-2">
                       <input 
                          type="checkbox" 
                          checked={item.completed} 
                          onChange={() => toggleChecklistItem(card.id, item.id)}
                          className="mt-1 rounded text-primary-600 focus:ring-primary-500 cursor-pointer w-4 h-4" 
                       />
                       <span className={`text-sm flex-1 ${item.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                          {item.text}
                       </span>
                       <button 
                          onClick={() => deleteChecklistItem(card.id, item.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all"
                       >
                           <X size={16} />
                       </button>
                     </div>
                   ))}
                   
                   {isAddingItem ? (
                       <form onSubmit={handleAddItem} className="pl-0 mt-2">
                           <input 
                              autoFocus
                              className="w-full p-2 mb-2 text-sm border border-slate-300 dark:border-slate-600 rounded dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                              placeholder="Adicionar um item"
                              value={newItemText}
                              onChange={(e) => setNewItemText(e.target.value)}
                           />
                           <div className="flex gap-2">
                              <Button size="sm" type="submit">Adicionar</Button>
                              <Button size="sm" variant="ghost" type="button" onClick={() => setIsAddingItem(false)}>Cancelar</Button>
                           </div>
                       </form>
                   ) : (
                      <Button size="sm" variant="secondary" className="mt-2" onClick={() => setIsAddingItem(true)}>
                          Adicionar item
                      </Button>
                   )}
                </div>
              </div>

              {/* Comments */}
              <div>
                <div className="flex items-center gap-2 mb-3 text-slate-900 dark:text-slate-100">
                  <MessageSquare size={20} />
                  <h3 className="font-semibold text-lg">Comentários</h3>
                </div>
                
                {/* Comment Input */}
                <div className="flex gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md">
                      {currentUser?.name ? getInitials(currentUser.name) : 'U'}
                  </div>
                  <div className="flex-1 space-y-2">
                      <textarea 
                          className="w-full p-3 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm" 
                          placeholder="Escreva um comentário..."
                          rows={2}
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                      />
                      {commentText && <Button size="sm" onClick={handleSaveComment}>Salvar</Button>}
                  </div>
                </div>

                {/* Comments List */}
                <div className="space-y-4">
                    {card.comments.map(comment => (
                        <div key={comment.id} className="flex gap-3 group">
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 text-xs font-bold shrink-0">
                                {comment.userId === currentUser?.id ? getInitials(currentUser.name) : 'U'}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                          {comment.userId === currentUser?.id ? currentUser.name : 'User'}
                                      </span>
                                      <span className="text-xs text-slate-500 dark:text-slate-400">
                                          {new Date(comment.createdAt).toLocaleString()}
                                      </span>
                                    </div>
                                    <button 
                                      onClick={() => deleteComment(card.id, comment.id)}
                                      className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                                      title="Excluir comentário"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                </div>
                                <div className="p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-md shadow-sm text-sm text-slate-700 dark:text-slate-300">
                                    {comment.text}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
              </div>

            </div>

            {/* Sidebar Actions */}
            <div className="space-y-6">
              
              {/* Add to card */}
              <div className="space-y-2">
                 <span className="text-xs font-semibold text-slate-500 uppercase">Adicionar ao cartão</span>
                 
                 {/* Labels Dropdown */}
                 <div className="relative" ref={labelPickerRef}>
                      <Button variant="secondary" size="sm" className="w-full justify-start gap-2" onClick={() => setShowLabelPicker(!showLabelPicker)}>
                          <Tag size={16}/> Prioridade
                      </Button>
                      {showLabelPicker && (
                          <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-md shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-20 animate-in fade-in zoom-in duration-150">
                              <div className="flex items-center justify-between mb-2 px-1">
                                  <span className="text-xs font-semibold text-slate-500">Prioridade</span>
                                  <button onClick={() => setShowLabelPicker(false)}><X size={14} className="text-slate-400"/></button>
                              </div>
                              <div className="space-y-1">
                                  {colors.map(c => {
                                      const isActive = card.labels.some(l => l.color === c.class);
                                      return (
                                          <button 
                                              key={c.class} 
                                              onClick={() => toggleLabel(c.class, c.name)}
                                              className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between hover:opacity-80 transition-opacity ${c.class}`}
                                          >
                                              <span className="text-xs font-bold text-white">{c.name}</span>
                                              {isActive && <div className="w-2 h-2 bg-white rounded-full" />}
                                          </button>
                                      )
                                  })}
                              </div>
                          </div>
                      )}
                 </div>

                 <Button variant="secondary" size="sm" className="w-full justify-start gap-2" onClick={() => setIsAddingItem(true)}>
                    <CheckSquare size={16}/> Checklist
                 </Button>

                 {/* Dates Dropdown - UPDATED: Inline expansion */}
                 <div className="relative" ref={datePickerRef}>
                   <Button 
                      variant="secondary" 
                      size="sm" 
                      className={`w-full justify-start gap-2 ${showDatePicker ? 'bg-slate-200 dark:bg-slate-700' : ''}`}
                      onClick={() => setShowDatePicker(!showDatePicker)}
                   >
                      <Clock size={16}/> Datas
                   </Button>
                   
                   {showDatePicker && (
                      <div className="mt-2 w-full bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 p-3 animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="flex items-center justify-between mb-3">
                              <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                <Calendar size={14} className="mb-0.5"/> Definir Prazo
                              </h4>
                              <button onClick={() => setShowDatePicker(false)} className="text-slate-400 hover:text-slate-600"><X size={14}/></button>
                          </div>
                          
                          <div className="space-y-3">
                              <input 
                                  type="date" 
                                  className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none shadow-sm font-medium"
                                  onChange={handleDateChange}
                                  value={dateValue}
                              />

                              <div className="grid grid-cols-1 gap-2">
                                  <Button size="sm" fullWidth onClick={saveDate}>
                                      Salvar
                                  </Button>
                                  <Button size="sm" variant="ghost" fullWidth onClick={removeDate} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 h-8">
                                      Remover
                                  </Button>
                              </div>
                          </div>
                      </div>
                   )}
                 </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                 <span className="text-xs font-semibold text-slate-500 uppercase">Ações</span>
                 <Button variant="secondary" size="sm" className="w-full justify-start gap-2 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors" onClick={handleDeleteClick}>
                    <Trash2 size={16}/> Excluir
                 </Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Excluir Cartão" width="sm">
         <div className="space-y-4">
           <div className="flex items-start gap-3 text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-100 dark:border-amber-900/50">
             <AlertTriangle size={24} className="shrink-0 mt-0.5" />
             <div>
               <h3 className="font-semibold text-sm mb-1">Atenção: Ação Irreversível</h3>
               <p className="text-xs opacity-90">
                 Tem certeza que deseja excluir este cartão? Esta ação não pode ser desfeita.
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