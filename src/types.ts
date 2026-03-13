export interface Document {
  id: string;
  title: string;
  content: string;
  type: 'prd' | 'user-story' | 'roadmap' | 'general';
  updatedAt: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface AppState {
  documents: Document[];
  currentDocumentId: string | null;
  chatHistory: Message[];
  isChatOpen: boolean;
}
