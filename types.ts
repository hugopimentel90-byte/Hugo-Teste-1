export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface Label {
  id: string;
  text: string;
  color: string; // Tailwind class or hex
}

export interface Comment {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Card {
  id: string;
  listId: string;
  title: string;
  description?: string;
  order: number;
  labels: Label[];
  dueDate?: string;
  comments: Comment[];
  checklist: ChecklistItem[];
  memberIds: string[];
}

export interface List {
  id: string;
  boardId: string;
  title: string;
  order: number;
}

export interface Board {
  id: string;
  title: string;
  ownerId: string;
  createdAt: string;
  background: string; // Gradient or solid color class
}

export interface AppState {
  user: User | null;
  boards: Board[];
  lists: List[];
  cards: Card[];
  currentBoardId: string | null;
  theme: 'light' | 'dark';
}

// For DnD
export type DraggableId = string;
export type DroppableId = string;