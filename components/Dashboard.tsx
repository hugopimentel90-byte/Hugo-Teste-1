import React, { useState } from 'react';
import { useStore } from '../store';
import { Button } from './ui/Button';
import { Plus, User, LogOut, Layout, Trash, AlertTriangle, Edit2 } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Board } from '../types';

export const Dashboard: React.FC = () => {
  const { user, boards, createBoard, updateBoard, setCurrentBoard, logout, deleteBoard } = useStore();
  
  // Modal States
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<string | null>(null);
  const [boardToRename, setBoardToRename] = useState<Board | null>(null);
  
  // Form States
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [renameTitle, setRenameTitle] = useState('');
  const [selectedGradient, setSelectedGradient] = useState('bg-gradient-to-r from-blue-500 to-cyan-500');

  const gradients = [
    'bg-gradient-to-r from-blue-500 to-cyan-500',
    'bg-gradient-to-r from-emerald-500 to-teal-500',
    'bg-gradient-to-r from-orange-500 to-red-500',
    'bg-gradient-to-r from-purple-500 to-pink-500',
    'bg-gradient-to-r from-slate-700 to-slate-900',
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBoardTitle) {
      createBoard(newBoardTitle, selectedGradient);
      setCreateModalOpen(false);
      setNewBoardTitle('');
    }
  };

  const handleClickDelete = (e: React.MouseEvent, boardId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setBoardToDelete(boardId);
  };

  const confirmDelete = () => {
    if (boardToDelete) {
      deleteBoard(boardToDelete);
      setBoardToDelete(null);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, board: Board) => {
    e.preventDefault(); // Prevent default browser context menu
    setBoardToRename(board);
    setRenameTitle(board.title);
  };

  const handleRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (boardToRename && renameTitle.trim()) {
      updateBoard(boardToRename.id, { title: renameTitle });
      setBoardToRename(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Navbar */}
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2 text-primary-600 dark:text-primary-500">
          <Layout className="h-8 w-8" />
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Trellix</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <User size={16} />
            <span>{user?.name}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={logout} className="gap-2">
            <LogOut size={14} /> Logout
          </Button>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Your Boards</h1>
          <Button onClick={() => setCreateModalOpen(true)} className="gap-2">
            <Plus size={18} /> Create Board
          </Button>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Tip: Right-click on a board to rename it.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {boards.map((board) => (
            <div 
              key={board.id} 
              onContextMenu={(e) => handleContextMenu(e, board)}
              className="group relative h-32 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-1 bg-white dark:bg-slate-800 cursor-pointer"
            >
              {/* Background Layer */}
              <div className={`absolute inset-0 ${board.background} opacity-90 transition-opacity`} />
              
              {/* Click Target for Opening Board */}
              <button
                onClick={() => setCurrentBoard(board.id)}
                className="absolute inset-0 w-full h-full z-0 text-left focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg"
              >
                <span className="sr-only">Open {board.title}</span>
              </button>

              {/* Content Layer */}
              <div className="absolute inset-0 p-4 flex flex-col justify-between z-10 pointer-events-none">
                <h3 className="text-lg font-bold text-white shadow-black/20 drop-shadow-md truncate pr-6">
                    {board.title}
                </h3>
                
                {/* Delete Button */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity pointer-events-auto">
                    <button 
                        onClick={(e) => handleClickDelete(e, board.id)}
                        className="p-2 bg-black/20 hover:bg-red-500 rounded text-white transition-colors backdrop-blur-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                        title="Delete Board"
                    >
                        <Trash size={16} />
                    </button>
                </div>
              </div>
            </div>
          ))}
          
          <button 
            onClick={() => setCreateModalOpen(true)}
            className="h-32 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 hover:border-primary-500 hover:text-primary-500 dark:hover:border-primary-500 transition-colors bg-slate-100/50 dark:bg-slate-900/50"
          >
            <Plus size={24} />
            <span className="mt-2 font-medium">Create new board</span>
          </button>
        </div>
      </main>

      {/* Create Board Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} title="Create Board">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input 
            label="Board Title" 
            placeholder="e.g. Project Launch" 
            value={newBoardTitle}
            onChange={(e) => setNewBoardTitle(e.target.value)}
            autoFocus
            required
          />
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Background</label>
            <div className="grid grid-cols-5 gap-2">
              {gradients.map((grad) => (
                <button
                  key={grad}
                  type="button"
                  className={`h-10 rounded-md ${grad} ${selectedGradient === grad ? 'ring-2 ring-offset-2 ring-primary-500 dark:ring-offset-slate-800' : ''}`}
                  onClick={() => setSelectedGradient(grad)}
                />
              ))}
            </div>
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create Board</Button>
          </div>
        </form>
      </Modal>

      {/* Rename Board Modal */}
      <Modal isOpen={!!boardToRename} onClose={() => setBoardToRename(null)} title="Rename Board">
        <form onSubmit={handleRename} className="space-y-4">
          <Input 
            label="New Board Title" 
            placeholder="Enter new title"
            value={renameTitle}
            onChange={(e) => setRenameTitle(e.target.value)}
            autoFocus
            required
          />
          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setBoardToRename(null)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!boardToDelete} onClose={() => setBoardToDelete(null)} title="Delete Board" width="sm">
        <div className="space-y-4">
          <div className="flex items-start gap-3 text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-100 dark:border-amber-900/50">
            <AlertTriangle size={24} className="shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm mb-1">Warning: Irreversible Action</h3>
              <p className="text-xs opacity-90">
                Are you sure you want to delete this board? This action cannot be undone.
              </p>
            </div>
          </div>
          
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            All lists and cards associated with this board will be permanently removed from the database.
          </p>
          
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setBoardToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Yes, Delete Board
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};