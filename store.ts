
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AppState, Board, Card, List, User, Comment, Label, ChecklistItem } from './types';
import { v4 as uuidv4 } from 'uuid';

// --- CONFIGURATION ---
// Mantendo falso para garantir funcionamento imediato
const API_URL = 'http://localhost:3000/api';
const USE_API = false; 

// Helper for API calls
async function apiCall(endpoint: string, method: string = 'GET', body?: any) {
    if (!USE_API) throw new Error('API Disabled');
    try {
        const options: RequestInit = {
            method,
            headers: { 'Content-Type': 'application/json' },
        };
        if (body) options.body = JSON.stringify(body);
        
        const res = await fetch(`${API_URL}${endpoint}`, options);
        
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || 'API Error');
        }
        return await res.json();
    } catch (e) {
        console.warn(`API Call Failed: ${endpoint}`, e);
        throw e;
    }
}

// --- LOCAL AUTH SIMULATION (MOCK DB) ---
const USERS_STORAGE_KEY = 'trellix-users-db';

const getLocalUsers = (): any[] => {
    try {
        return JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
    } catch { return []; }
};

const saveLocalUser = (user: any) => {
    const users = getLocalUsers();
    users.push(user);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

interface Store extends AppState {
  isLoading: boolean;

  // Auth
  login: (email: string, password?: string) => Promise<void>;
  register: (name: string, email: string, password?: string) => Promise<void>;
  logout: () => void;
  
  // Data Fetching
  fetchBoards: () => Promise<void>;
  fetchBoardData: (boardId: string) => Promise<void>;

  // Board Actions
  createBoard: (title: string, background: string) => void;
  updateBoard: (id: string, updates: Partial<Board>) => void;
  deleteBoard: (id: string) => void;
  setCurrentBoard: (id: string | null) => void;
  
  // List Actions
  createList: (boardId: string, title: string) => void;
  deleteList: (id: string) => void;
  updateListTitle: (id: string, title: string) => void;
  
  // Card Actions
  createCard: (listId: string, title: string) => void;
  updateCard: (cardId: string, updates: Partial<Card>) => void;
  deleteCard: (id: string) => void;
  
  // Checklist Actions
  addChecklistItem: (cardId: string, text: string) => void;
  toggleChecklistItem: (cardId: string, itemId: string) => void;
  deleteChecklistItem: (cardId: string, itemId: string) => void;

  // Comment Actions
  addComment: (cardId: string, text: string) => void;
  deleteComment: (cardId: string, commentId: string) => void;

  // DnD Actions
  moveCard: (cardId: string, sourceListId: string, destListId: string, newIndex: number) => void;
  reorderList: (listId: string, newIndex: number) => void;
  
  // UI
  toggleTheme: () => void;
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      user: null,
      boards: [],
      lists: [],
      cards: [],
      currentBoardId: null,
      theme: 'light',
      isLoading: false,

      login: async (email, password) => {
          // Normalização para login (case insensitive para o usuário)
          const normalizedLogin = email.trim();
          
          // HARDCODED CREDENTIALS REQUESTED BY USER
          if (normalizedLogin === 'APCP' && password === 'marinha123') {
              const adminUser = {
                  id: 'user-admin-apcp',
                  email: 'apcp@sistema.interno',
                  name: 'Operador APCP',
                  avatar: `https://ui-avatars.com/api/?name=APCP&background=0f172a&color=fff&bold=true`
              };
              set({ user: adminUser });
              return;
          }

          if (USE_API) {
              try {
                  const user = await apiCall('/login', 'POST', { email, password });
                  set({ user });
              } catch (e) {
                  throw e;
              }
          } else {
              // Local Auth Simulation for other users
              const users = getLocalUsers();
              const foundUser = users.find(u => u.email === email && u.password === password);
              
              if (foundUser) {
                  const { password: _, ...safeUser } = foundUser;
                  set({ user: safeUser });
              } else {
                  // Add a small delay to simulate processing
                  await new Promise(resolve => setTimeout(resolve, 800));
                  throw new Error('Credenciais inválidas. Verifique seu login e senha.');
              }
          }
      },

      register: async (name, email, password) => {
        if (USE_API) {
            try {
                const user = await apiCall('/register', 'POST', { name, email, password });
                set({ user });
            } catch (e) {
                throw e;
            }
        } else {
            // Local Register Simulation
            const users = getLocalUsers();
            if (users.find(u => u.email === email)) {
                throw new Error('Este usuário já está cadastrado.');
            }

            const newUser = {
                id: uuidv4(),
                email,
                name,
                password, 
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0ea5e9&color=fff`
            };
            
            saveLocalUser(newUser);
            
            const { password: _, ...safeUser } = newUser;
            set({ user: safeUser });
        }
      },

      logout: () => set({ user: null, currentBoardId: null }),

      fetchBoards: async () => {
          const user = get().user;
          // Se for user local sem ID real, não busca
          if (!user) return;
          
          set({ isLoading: true });
          
          // Se a API estiver desligada, usamos o estado local persistido (persist middleware do zustand já cuida disso)
          // Apenas simulamos um loading para UX
          if (!USE_API) {
              await new Promise(resolve => setTimeout(resolve, 500));
              set({ isLoading: false });
              return;
          }

          try {
              const boards = await apiCall(`/boards?userId=${user.id}`);
              set({ boards });
          } catch (e) {
              console.error('Failed to fetch boards');
          } finally {
              set({ isLoading: false });
          }
      },

      fetchBoardData: async (boardId) => {
          set({ isLoading: true });
           if (!USE_API) {
              await new Promise(resolve => setTimeout(resolve, 300));
              set({ isLoading: false });
              return;
          }
          try {
              const lists = await apiCall(`/lists?boardId=${boardId}`);
              const listIds = lists.map((l: List) => l.id).join(',');
              const cards = listIds ? await apiCall(`/cards?listIds=${listIds}`) : [];
              
              set({ lists, cards });
          } catch (e) {
              console.error('Failed to fetch board data');
          } finally {
              set({ isLoading: false });
          }
      },

      createBoard: async (title, background) => {
        const user = get().user;
        const newBoard = {
          id: uuidv4(),
          title,
          background,
          ownerId: user?.id || 'unknown',
          createdAt: new Date().toISOString()
        };
        // Optimistic
        set((state) => ({ boards: [newBoard, ...state.boards] }));
        
        if (USE_API) {
            try {
                await apiCall('/boards', 'POST', newBoard);
            } catch(e) { /* Revert? */ }
        }
      },

      updateBoard: async (id, updates) => {
        set((state) => ({
            boards: state.boards.map(b => b.id === id ? { ...b, ...updates } : b)
        }));
        if(USE_API) await apiCall(`/boards/${id}`, 'PUT', updates);
      },

      deleteBoard: async (id) => {
        set((state) => ({
            boards: state.boards.filter(b => b.id !== id),
            currentBoardId: state.currentBoardId === id ? null : state.currentBoardId
        }));
        if(USE_API) await apiCall(`/boards/${id}`, 'DELETE');
      },

      setCurrentBoard: (id) => {
          set({ currentBoardId: id });
          if (id) get().fetchBoardData(id);
      },

      createList: async (boardId, title) => {
        const newList = {
          id: uuidv4(),
          boardId,
          title,
          order: get().lists.filter(l => l.boardId === boardId).length
        };
        set((state) => ({ lists: [...state.lists, newList] }));
        if(USE_API) await apiCall('/lists', 'POST', newList);
      },

      deleteList: async (id) => {
        set((state) => ({
            lists: state.lists.filter(l => l.id !== id),
            cards: state.cards.filter(c => c.listId !== id)
        }));
        if(USE_API) await apiCall(`/lists/${id}`, 'DELETE');
      },

      updateListTitle: async (id, title) => {
        set((state) => ({
            lists: state.lists.map(l => l.id === id ? { ...l, title } : l)
        }));
        if(USE_API) await apiCall(`/lists/${id}`, 'PUT', { title });
      },

      createCard: async (listId, title) => {
        const newCard: Card = {
          id: uuidv4(),
          listId,
          title,
          order: get().cards.filter(c => c.listId === listId).length,
          labels: [],
          comments: [],
          checklist: [],
          memberIds: []
        };
        set((state) => ({ cards: [...state.cards, newCard] }));
        if(USE_API) await apiCall('/cards', 'POST', newCard);
      },

      updateCard: async (cardId, updates) => {
        set((state) => ({
            cards: state.cards.map(c => c.id === cardId ? { ...c, ...updates } : c)
        }));
        
        const { labels, checklist, comments, ...simpleUpdates } = updates;
        if(USE_API && Object.keys(simpleUpdates).length > 0) {
            await apiCall(`/cards/${cardId}`, 'PUT', simpleUpdates);
        }
      },

      deleteCard: async (id) => {
        set((state) => ({
            cards: state.cards.filter(c => c.id !== id)
        }));
        if(USE_API) await apiCall(`/cards/${id}`, 'DELETE');
      },

      addChecklistItem: async (cardId, text) => {
        const newItem: ChecklistItem = { id: uuidv4(), text, completed: false };
        set((state) => ({
            cards: state.cards.map(c => c.id === cardId ? { ...c, checklist: [...c.checklist, newItem] } : c)
        }));
        if(USE_API) await apiCall('/checklist', 'POST', { ...newItem, cardId });
      },

      toggleChecklistItem: async (cardId, itemId) => {
        const card = get().cards.find(c => c.id === cardId);
        const item = card?.checklist.find(i => i.id === itemId);
        if (!item) return;

        set((state) => ({
            cards: state.cards.map(c => c.id === cardId ? {
                ...c,
                checklist: c.checklist.map(i => i.id === itemId ? { ...i, completed: !i.completed } : i)
            } : c)
        }));
        
        if(USE_API) await apiCall(`/checklist/${itemId}`, 'PUT', { completed: !item.completed });
      },

      deleteChecklistItem: async (cardId, itemId) => {
        set((state) => ({
            cards: state.cards.map(c => c.id === cardId ? {
                ...c,
                checklist: c.checklist.filter(i => i.id !== itemId)
            } : c)
        }));
        if(USE_API) await apiCall(`/checklist/${itemId}`, 'DELETE');
      },

      addComment: async (cardId, text) => {
        const user = get().user;
        const newComment: Comment = {
          id: uuidv4(),
          userId: user?.id || 'unknown',
          text,
          createdAt: new Date().toISOString()
        };
        set((state) => ({
            cards: state.cards.map(c => c.id === cardId ? { ...c, comments: [newComment, ...c.comments] } : c)
        }));
        if(USE_API) await apiCall('/comments', 'POST', { ...newComment, cardId });
      },

      deleteComment: async (cardId, commentId) => {
        set((state) => ({
            cards: state.cards.map(c => c.id === cardId ? {
                ...c,
                comments: c.comments.filter(cm => cm.id !== commentId)
            } : c)
        }));
        if(USE_API) await apiCall(`/comments/${commentId}`, 'DELETE');
      },

      moveCard: (cardId, sourceListId, destListId, newIndex) => {
        set((state) => {
            const newCards = [...state.cards];
            const cardIndex = newCards.findIndex(c => c.id === cardId);
            if (cardIndex === -1) return state;
            
            const card = { ...newCards[cardIndex] };
            card.listId = destListId;
            newCards[cardIndex] = card;
            
            return { cards: newCards }; 
        });
        
        if(USE_API) {
            apiCall(`/cards/${cardId}`, 'PUT', { listId: destListId, order: newIndex });
        }
      },

      reorderList: async (listId, newIndex) => {
        const currentBoardId = get().currentBoardId;
        set((state) => {
            const boardLists = state.lists.filter(l => l.boardId === currentBoardId).sort((a,b) => a.order - b.order);
            const oldIndex = boardLists.findIndex(l => l.id === listId);
            if(oldIndex === -1) return state;
            
            const list = boardLists[oldIndex];
            boardLists.splice(oldIndex, 1);
            boardLists.splice(newIndex, 0, list);
            
            const updates = boardLists.map((l, idx) => ({ id: l.id, order: idx }));
            
            return {
                lists: state.lists.map(l => {
                    const update = updates.find(u => u.id === l.id);
                    return update ? { ...l, order: update.order } : l;
                })
            };
        });
        
        if(USE_API) {
            const boardLists = get().lists.filter(l => l.boardId === currentBoardId).sort((a,b) => a.order - b.order);
            const listIds = boardLists.map(l => l.id);
            await apiCall('/lists/reorder', 'POST', { boardId: currentBoardId, listIds });
        }
      },

      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'light' ? 'dark' : 'light' 
      })),
    }),
    {
      name: 'trellix-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
