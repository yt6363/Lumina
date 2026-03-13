import React from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  PanelLeftClose, 
  Plus, 
  Trash2, 
  Settings, 
  BarChart3, 
  Users, 
  Command 
} from 'lucide-react';
import { Document } from '../types';
import { cn } from '../utils';

interface SidebarProps {
  isSidebarOpen: boolean;
  isFocusMode: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  documents: Document[];
  currentDocId: string | null;
  setCurrentDocId: (id: string | null) => void;
  handleCreateDoc: (type?: Document['type']) => void;
  handleDeleteDoc: (id: string) => void;
  getDocIcon: (type: Document['type'], active: boolean) => React.ReactNode;
  activeTeam: { name: string; color: string; status: string }[];
  setIsCommandPaletteOpen: (open: boolean) => void;
  currentView: 'workspace' | 'repo-explorer';
  setCurrentView: (view: 'workspace' | 'repo-explorer') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isSidebarOpen,
  isFocusMode,
  setIsSidebarOpen,
  documents,
  currentDocId,
  setCurrentDocId,
  handleCreateDoc,
  handleDeleteDoc,
  getDocIcon,
  activeTeam,
  setIsCommandPaletteOpen,
  currentView,
  setCurrentView,
}) => {
  return (
    <motion.aside 
      initial={false}
      animate={{ width: (isSidebarOpen && !isFocusMode) ? 280 : 0 }}
      className="relative flex flex-col border-r border-slate-200 bg-white overflow-hidden z-20"
    >
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5 font-bold text-slate-900">
          <span className="tracking-tight text-xl uppercase font-black">Lumina</span>
        </div>
        <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
          <PanelLeftClose size={20} />
        </button>
      </div>

      <div className="px-4 mb-6">
        <button 
          onClick={() => handleCreateDoc()}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-md shadow-slate-200 font-medium text-sm"
        >
          <Plus size={18} />
          New Document
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 space-y-6">
        <div>
          <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Navigation</div>
          <div className="space-y-0.5">
            <div 
              onClick={() => setCurrentView('workspace')}
              className={cn(
                "flex items-center px-3 py-2 rounded-xl cursor-pointer transition-all text-sm font-medium",
                currentView === 'workspace' ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <span>Workspace</span>
            </div>
            <div 
              onClick={() => setCurrentView('repo-explorer')}
              className={cn(
                "flex items-center px-3 py-2 rounded-xl cursor-pointer transition-all text-sm font-medium",
                currentView === 'repo-explorer' ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <span>Repo Explorer</span>
            </div>
          </div>
        </div>

        {currentView === 'workspace' && (
          <div>
            <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Documents</div>
            <div className="space-y-0.5">
              {documents.map(doc => (
                <div 
                  key={doc.id}
                  onClick={() => setCurrentDocId(doc.id)}
                  className={cn(
                    "group flex items-center px-3 py-2 rounded-xl cursor-pointer transition-all text-sm font-medium",
                    currentDocId === doc.id ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <span className="flex-1 truncate">{doc.title}</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteDoc(doc.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 text-red-500 rounded-lg transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
        )}

        <div>
          <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Team Presence</div>
          <div className="space-y-2 px-3">
            {activeTeam.map((member, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
                <div className={cn("w-2 h-2 rounded-full", member.status === 'online' ? member.color : 'bg-slate-300')} />
                <span>{member.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Quick Actions</div>
          <div className="space-y-1">
            <button onClick={() => handleCreateDoc('prd')} className="w-full flex items-center px-3 py-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
              Draft PRD
            </button>
            <button onClick={() => handleCreateDoc('user-story')} className="w-full flex items-center px-3 py-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
              User Stories
            </button>
            <button onClick={() => setIsCommandPaletteOpen(true)} className="w-full flex items-center px-3 py-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
              Command Palette
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-slate-100 flex items-center justify-between text-[10px] uppercase tracking-widest text-slate-400">
        <div className="flex items-center hover:text-slate-900 cursor-pointer transition-colors">
          <span>Settings</span>
        </div>
        <span className="font-mono">v2.1.0</span>
      </div>
    </motion.aside>
  );
};
