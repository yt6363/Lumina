import React from 'react';
import { 
  PanelLeftOpen, 
  Sparkles, 
  Layout, 
  Edit3, 
  Eye, 
  Share2, 
  Download, 
  PanelRightOpen 
} from 'lucide-react';
import { Document } from '../types';
import { cn } from '../utils';

interface HeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  currentDoc: Document | undefined;
  currentDocId: string | null;
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  handleMagicInsight: () => void;
  isFocusMode: boolean;
  setIsFocusMode: (focus: boolean) => void;
  viewMode: 'edit' | 'preview';
  setViewMode: (mode: 'edit' | 'preview') => void;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  currentDoc,
  currentDocId,
  setDocuments,
  handleMagicInsight,
  isFocusMode,
  setIsFocusMode,
  viewMode,
  setViewMode,
  isChatOpen,
  setIsChatOpen,
}) => {
  return (
    <header className="h-16 border-b border-slate-100 flex items-center justify-between px-6 bg-white/80 backdrop-blur-xl sticky top-0 z-10">
      <div className="flex items-center gap-4">
        {!isSidebarOpen && (
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
            <PanelLeftOpen size={20} />
          </button>
        )}
        <div className="flex items-center gap-2">
          <input 
            value={currentDoc?.title || ''}
            onChange={(e) => {
              if (!currentDocId) return;
              setDocuments(docs => docs.map(d => d.id === currentDocId ? { ...d, title: e.target.value } : d));
            }}
            className="bg-transparent border-none focus:ring-0 text-lg font-bold text-slate-900 w-80 placeholder:text-slate-200"
            placeholder="Untitled Document"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex bg-slate-100 p-1 rounded-xl mr-4">
          <button 
            onClick={handleMagicInsight}
            className="flex items-center px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 hover:bg-white transition-all"
            title="Get Magic Insight"
          >
            Insight
          </button>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl mr-4">
          <button 
            onClick={() => setIsFocusMode(!isFocusMode)}
            className={cn(
              "flex items-center px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              isFocusMode ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-900"
            )}
            title="Focus Mode (CMD+F)"
          >
            Focus
          </button>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl mr-4">
          <button 
            onClick={() => setViewMode('edit')}
            className={cn(
              "flex items-center px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              viewMode === 'edit' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
            )}
          >
            Edit
          </button>
          <button 
            onClick={() => setViewMode('preview')}
            className={cn(
              "flex items-center px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              viewMode === 'preview' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
            )}
          >
            Preview
          </button>
        </div>
        <button className="px-3 py-1.5 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors text-xs font-medium">
          Share
        </button>
        <button className="px-3 py-1.5 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors text-xs font-medium">
          Download
        </button>
        <div className="h-6 w-[1px] bg-slate-200 mx-2" />
        {!isChatOpen && (
          <button onClick={() => setIsChatOpen(true)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
            <PanelRightOpen size={20} />
          </button>
        )}
      </div>
    </header>
  );
};
