import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search } from 'lucide-react';
import { cn } from '../utils';

interface CommandItem {
  label: string;
  cmd: string;
  color: string;
  category: string;
}

interface CommandPaletteProps {
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  commandSearch: string;
  setCommandSearch: (search: string) => void;
  filteredCommands: CommandItem[];
  runCommand: (cmd: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isCommandPaletteOpen,
  setIsCommandPaletteOpen,
  commandSearch,
  setCommandSearch,
  filteredCommands,
  runCommand,
}) => {
  return (
    <AnimatePresence>
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCommandPaletteOpen(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
          >
            <div className="p-4 border-b border-slate-100 flex items-center gap-3">
              <Search size={20} className="text-slate-400" />
              <input 
                autoFocus
                value={commandSearch}
                onChange={(e) => setCommandSearch(e.target.value)}
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 text-lg"
              />
              <div className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-400">ESC</div>
            </div>
            <div className="p-2 max-h-[400px] overflow-y-auto">
              {filteredCommands.length > 0 ? (
                filteredCommands.map((item, i) => (
                  <button 
                    key={i}
                    onClick={() => runCommand(item.cmd)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-slate-700">{item.label}</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{item.category}</div>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">CMD + {i + 1}</span>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 text-sm">
                  No commands found for "{commandSearch}"
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
