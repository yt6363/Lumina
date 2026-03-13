import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Sparkles, Plus, Edit3 } from 'lucide-react';
import Markdown from 'react-markdown';
import { Document } from '../types';

interface EditorProps {
  currentDoc: Document | undefined;
  viewMode: 'edit' | 'preview';
  editorRef: React.RefObject<HTMLTextAreaElement | null>;
  handleUpdateDoc: (content: string) => void;
  handleTextSelection: () => void;
  selection: { text: string; x: number; y: number } | null;
  handleMagicAction: (action: string) => void;
}

export const Editor: React.FC<EditorProps> = ({
  currentDoc,
  viewMode,
  editorRef,
  handleUpdateDoc,
  handleTextSelection,
  selection,
  handleMagicAction,
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-12 lg:p-20" onMouseUp={handleTextSelection}>
      <div className="max-w-3xl mx-auto relative">
        {currentDoc ? (
          viewMode === 'edit' ? (
            <textarea
              ref={editorRef}
              value={currentDoc.content}
              onChange={(e) => handleUpdateDoc(e.target.value)}
              className="w-full h-[80vh] bg-transparent border-none focus:ring-0 resize-none font-sans text-base leading-relaxed text-slate-700 placeholder:text-slate-200"
              placeholder="Start typing your product vision..."
              spellCheck={false}
            />
          ) : (
            <div className="prose prose-slate max-w-none">
              <Markdown>{currentDoc.content}</Markdown>
            </div>
          )
        ) : (
          <div className="h-[60vh] flex flex-col items-center justify-center text-slate-200 space-y-6">
            <BookOpen size={64} strokeWidth={1.5} />
            <p className="text-xl font-medium">Select a document to begin</p>
          </div>
        )}

        {/* Magic Toolbar */}
        <AnimatePresence>
          {selection && (
            <motion.div 
              initial={{ opacity: 0, y: 10, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 10, x: '-50%' }}
              style={{ left: selection.x, top: selection.y }}
              className="fixed z-50 bg-slate-900 text-white rounded-xl shadow-2xl flex items-center p-1 gap-1 border border-white/10 backdrop-blur-xl"
            >
              <button onClick={() => handleMagicAction('Summarize')} className="px-3 py-1.5 hover:bg-white/10 rounded-lg text-xs font-bold flex items-center gap-2">
                <Sparkles size={12} />
                Summarize
              </button>
              <div className="w-[1px] h-4 bg-white/10" />
              <button onClick={() => handleMagicAction('Expand')} className="px-3 py-1.5 hover:bg-white/10 rounded-lg text-xs font-bold flex items-center gap-2">
                <Plus size={12} />
                Expand
              </button>
              <div className="w-[1px] h-4 bg-white/10" />
              <button onClick={() => handleMagicAction('Rewrite')} className="px-3 py-1.5 hover:bg-white/10 rounded-lg text-xs font-bold flex items-center gap-2">
                <Edit3 size={12} />
                Rewrite
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
