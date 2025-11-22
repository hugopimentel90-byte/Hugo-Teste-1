
import React, { useEffect } from 'react';
import { useStore } from './store';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { BoardView } from './components/Board/BoardView';
import { Button } from './components/ui/Button';
import { ArrowLeft, Moon, Sun } from 'lucide-react';

const App: React.FC = () => {
  const { user, currentBoardId, setCurrentBoard, boards, theme, toggleTheme, fetchBoards } = useStore();

  // Theme handling
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Initial Data Fetch
  useEffect(() => {
    if (user) {
        fetchBoards();
    }
  }, [user]);

  if (!user) {
    return <Auth />;
  }

  if (!currentBoardId) {
    return (
      <>
        <Dashboard />
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </>
    );
  }

  const currentBoard = boards.find(b => b.id === currentBoardId);

  return (
    <div className={`h-screen flex flex-col ${currentBoard?.background || 'bg-slate-900'} transition-colors duration-300`}>
      {/* Board Header */}
      <header className="h-14 bg-black/20 backdrop-blur-sm px-4 flex items-center justify-between shrink-0 text-white">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setCurrentBoard(null)}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft size={18} className="mr-1" />
            Boards
          </Button>
          <h1 className="font-bold text-lg">{currentBoard?.title}</h1>
          <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-medium">Private</span>
        </div>
        <div className="flex items-center gap-2">
           <div className="flex -space-x-2 mr-2">
             {/* Mock Avatars */}
             <div className="w-8 h-8 rounded-full bg-red-500 border-2 border-white/20 flex items-center justify-center text-xs">{user.name.substring(0,2).toUpperCase()}</div>
           </div>
           <Button variant="primary" size="sm" className="bg-white/20 hover:bg-white/30 border-none">Share</Button>
           <ThemeToggle theme={theme} toggleTheme={toggleTheme} inline />
        </div>
      </header>

      {/* Board Canvas */}
      <main className="flex-1 overflow-hidden relative">
        <BoardView />
      </main>
    </div>
  );
};

const ThemeToggle = ({ theme, toggleTheme, inline = false }: { theme: string, toggleTheme: () => void, inline?: boolean }) => {
    const classes = inline 
        ? "p-2 rounded-full hover:bg-white/20 text-white transition-colors"
        : "fixed bottom-4 right-4 p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full shadow-xl z-50 transition-colors hover:scale-110";
    
    return (
        <button onClick={toggleTheme} className={classes}>
            {theme === 'dark' ? <Sun size={inline ? 18 : 24} /> : <Moon size={inline ? 18 : 24} />}
        </button>
    );
}

export default App;
