import React from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  PanelRightClose, 
  MessageSquare, 
  Download, 
  Plus, 
  Send 
} from 'lucide-react';
import Markdown from 'react-markdown';
import { Message } from '../types';
import { cn } from '../utils';

interface ChatPanelProps {
  isChatOpen: boolean;
  isFocusMode: boolean;
  setIsChatOpen: (open: boolean) => void;
  chatHistory: Message[];
  isTyping: boolean;
  chatInput: string;
  setChatInput: (input: string) => void;
  handleSendMessage: () => void;
  copyToClipboard: (text: string) => void;
  applyToDocument: (content: string) => void;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  isChatOpen,
  isFocusMode,
  setIsChatOpen,
  chatHistory,
  isTyping,
  chatInput,
  setChatInput,
  handleSendMessage,
  copyToClipboard,
  applyToDocument,
  chatEndRef,
}) => {
  return (
    <motion.aside 
      initial={false}
      animate={{ width: (isChatOpen && !isFocusMode) ? 400 : 0 }}
      className="relative flex flex-col border-l border-slate-200 bg-white overflow-hidden z-20"
    >
      <div className="p-6 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-2.5 font-bold text-slate-900">
          <span className="tracking-tight">AI Strategist</span>
        </div>
        <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
          <PanelRightClose size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {chatHistory.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
            <div className="space-y-1">
              <p className="font-bold text-slate-900">Ready to strategize?</p>
              <p className="text-sm">Ask me to refine your PRD or generate a roadmap.</p>
            </div>
          </div>
        )}
        
        {chatHistory.map(msg => (
          <div key={msg.id} className={cn(
            "flex flex-col gap-2 group",
            msg.role === 'user' ? "items-end" : "items-start"
          )}>
            <div className={cn(
              "max-w-[90%] px-4 py-3 text-sm leading-relaxed relative",
              msg.role === 'user' 
                ? "bg-slate-900 text-white rounded-2xl rounded-tr-none shadow-lg shadow-slate-200" 
                : "bg-slate-50 text-slate-800 rounded-2xl rounded-tl-none border border-slate-100"
            )}>
              <div className="prose prose-slate prose-sm max-w-none">
                <Markdown>{msg.content}</Markdown>
              </div>
              {msg.role === 'assistant' && (
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => copyToClipboard(msg.content)}
                    className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-400 hover:text-slate-900 shadow-sm"
                    title="Copy to clipboard"
                  >
                    COPY
                  </button>
                  <button 
                    onClick={() => applyToDocument(msg.content)}
                    className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-blue-500 hover:bg-blue-50 shadow-sm"
                    title="Apply to document"
                  >
                    APPLY
                  </button>
                </div>
              )}
            </div>
            <span className="text-[10px] text-slate-300 font-medium px-1">
              {msg.role.toUpperCase()} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium px-2">
            <motion.div 
              animate={{ opacity: [0.4, 1, 0.4] }} 
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="flex gap-1"
            >
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
            </motion.div>
            AI is strategizing
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-6 border-t border-slate-100 bg-white">
        <div className="relative">
          <textarea 
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask for strategy, metrics, or stories..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 pr-14 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none min-h-[100px]"
          />
          <button 
            onClick={() => handleSendMessage()}
            disabled={!chatInput.trim() || isTyping}
            className="absolute right-3 bottom-3 p-2.5 bg-slate-900 text-white rounded-xl disabled:opacity-20 transition-all hover:bg-slate-800 active:scale-90"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </motion.aside>
  );
};
