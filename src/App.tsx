import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  FileText, 
  BarChart3, 
  Users, 
  Sparkles,
  Target,
  Activity,
  Clock,
  Edit3,
  Zap
} from 'lucide-react';
import { Document, Message } from './types';
import { generateResponse } from './services/gemini';
import { RepoExplorer } from './components/RepoExplorer';
import { cn } from './utils';

// Components
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Editor } from './components/Editor';
import { AnalysisSidebar } from './components/AnalysisSidebar';
import { ChatPanel } from './components/ChatPanel';
import { CommandPalette } from './components/CommandPalette';

// Initialize Gemini
// (Moved to services/gemini.ts)

export default function App() {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      title: 'Product Strategy: Project Phoenix',
      content: '# Project Phoenix Strategy\n\n## Overview\nProject Phoenix is our next-generation platform for real-time collaboration. \n\n## Core Objectives\n- Reduce latency by 40%\n- Increase MAU by 25% within Q3\n- Implement end-to-end encryption\n\n## Target Audience\nProduct teams in enterprise environments who require high-security collaboration tools.',
      type: 'prd',
      updatedAt: Date.now()
    }
  ]);
  const [currentDocId, setCurrentDocId] = useState<string | null>('1');
  const [currentView, setCurrentView] = useState<'workspace' | 'repo-explorer'>('workspace');
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [commandSearch, setCommandSearch] = useState('');
  const [isDeepAnalyzing, setIsDeepAnalyzing] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [selection, setSelection] = useState<{ text: string, x: number, y: number } | null>(null);
  const [activeTeam, setActiveTeam] = useState([
    { name: 'Sarah (Design)', color: 'bg-pink-500', status: 'online' },
    { name: 'Mike (Eng)', color: 'bg-emerald-500', status: 'online' },
    { name: 'Alex (PM)', color: 'bg-blue-500', status: 'away' },
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const currentDoc = documents.find(d => d.id === currentDocId);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault();
        setIsChatOpen(prev => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setIsSidebarOpen(prev => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        setIsFocusMode(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Insane Functionality: Document Analysis
  const analysis = useMemo(() => {
    if (!currentDoc?.content) return null;
    const wordCount = currentDoc.content.split(/\s+/).length;
    const hasGoals = currentDoc.content.toLowerCase().includes('goal') || currentDoc.content.toLowerCase().includes('objective');
    const hasMetrics = currentDoc.content.toLowerCase().includes('metric') || currentDoc.content.toLowerCase().includes('kpi');
    const hasUserStories = currentDoc.content.toLowerCase().includes('user story') || currentDoc.content.toLowerCase().includes('as a');
    
    let score = 0;
    if (wordCount > 100) score += 25;
    if (hasGoals) score += 25;
    if (hasMetrics) score += 25;
    if (hasUserStories) score += 25;
    
    return { score, wordCount, hasGoals, hasMetrics, hasUserStories };
  }, [currentDoc?.content]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleCreateDoc = (type: Document['type'] = 'general') => {
    let initialContent = '';
    let title = `New ${type.toUpperCase()}`;

    if (type === 'prd') {
      title = 'Product Requirements Document';
      initialContent = '# PRD: [Feature Name]\n\n## 1. Context\nWhy are we building this?\n\n## 2. Goals\nWhat does success look like?\n\n## 3. User Stories\n- **As a** [user], **I want** [action], **so that** [value].\n\n## 4. Functional Specs\nDetailed requirements...';
    } else if (type === 'user-story') {
      title = 'User Stories';
      initialContent = '# User Stories\n\n- [ ] Story 1\n- [ ] Story 2';
    }

    const newDoc: Document = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      content: initialContent,
      type,
      updatedAt: Date.now()
    };
    setDocuments([newDoc, ...documents]);
    setCurrentDocId(newDoc.id);
  };

  const handleUpdateDoc = (content: string) => {
    if (!currentDocId) return;
    setDocuments(docs => docs.map(d => 
      d.id === currentDocId ? { ...d, content, updatedAt: Date.now() } : d
    ));
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const input = customPrompt || chatInput;
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    try {
      const responseText = await generateResponse(input, currentDoc, chatHistory);

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText || "I encountered an error processing your request.",
        timestamp: Date.now()
      };

      setChatHistory(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const runCommand = (cmd: string) => {
    handleSendMessage(cmd);
    setIsCommandPaletteOpen(false);
    setCommandSearch('');
  };

  const handleDeepAnalysis = async () => {
    if (!currentDoc) return;
    setIsDeepAnalyzing(true);
    setIsChatOpen(true);
    await handleSendMessage(`Perform a deep strategic analysis of this document. Critique the goals, metrics, and user stories. Suggest 3 high-impact improvements.`);
    setIsDeepAnalyzing(false);
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setSelection(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    if (rect.width > 0) {
      setSelection({
        text: selection.toString(),
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });
    }
  };

  const handleMagicInsight = () => {
    handleSendMessage("Give me one 'insane' strategic insight or a provocative question about this product vision that I haven't considered yet.");
  };

  const handleMagicAction = (action: string) => {
    if (!selection) return;
    handleSendMessage(`${action} this text: "${selection.text}"`);
    setSelection(null);
  };

  const getDocIcon = (type: Document['type'], active: boolean) => {
    return null;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast here
  };

  const applyToDocument = (text: string) => {
    if (!currentDoc) return;
    // Simple append for now, or could replace selection
    handleUpdateDoc(currentDoc.content + '\n\n' + text);
  };

  const handleDeleteDoc = (id: string) => {
    setDocuments(docs => docs.filter(d => d.id !== id));
    if (currentDocId === id) {
      setCurrentDocId(documents.find(d => d.id !== id)?.id || null);
    }
  };

  const commands = [
    { label: 'Generate PRD', cmd: 'Draft a comprehensive PRD for this feature', color: 'text-blue-500', category: 'Creation' },
    { label: 'Create User Stories', cmd: 'Break this feature down into 5 detailed user stories', color: 'text-purple-500', category: 'Creation' },
    { label: 'Suggest Metrics', cmd: 'Suggest 3 primary and 2 secondary success metrics for this feature', color: 'text-emerald-500', category: 'Strategy' },
    { label: 'Analyze Health', cmd: 'Analyze the health of this document and suggest improvements', color: 'text-orange-500', category: 'Analysis' },
    { label: 'Generate Roadmap', cmd: 'Generate a 3-month roadmap based on this document, broken down by month', color: 'text-indigo-500', category: 'Strategy' },
    { label: 'Market Analysis', cmd: 'Perform a quick competitive analysis for this feature', color: 'text-pink-500', category: 'Strategy' },
    { label: 'Rewrite for Clarity', cmd: 'Rewrite the current document to be more concise and clear', color: 'text-slate-500', category: 'Editing' },
    { label: 'Suggest Edge Cases', cmd: 'What are some technical or user edge cases we should consider?', color: 'text-yellow-500', category: 'Analysis' },
  ];

  const filteredCommands = commands.filter(c => 
    c.label.toLowerCase().includes(commandSearch.toLowerCase()) ||
    c.category.toLowerCase().includes(commandSearch.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <Sidebar 
        isSidebarOpen={isSidebarOpen}
        isFocusMode={isFocusMode}
        setIsSidebarOpen={setIsSidebarOpen}
        documents={documents}
        currentDocId={currentDocId}
        setCurrentDocId={setCurrentDocId}
        handleCreateDoc={handleCreateDoc}
        handleDeleteDoc={handleDeleteDoc}
        getDocIcon={getDocIcon}
        activeTeam={activeTeam}
        setIsCommandPaletteOpen={setIsCommandPaletteOpen}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      <main className="flex-1 flex flex-col min-w-0 bg-white relative">
        {currentView === 'workspace' ? (
          <>
            <Header 
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
              currentDoc={currentDoc}
              currentDocId={currentDocId}
              setDocuments={setDocuments}
              handleMagicInsight={handleMagicInsight}
              isFocusMode={isFocusMode}
              setIsFocusMode={setIsFocusMode}
              viewMode={viewMode}
              setViewMode={setViewMode}
              isChatOpen={isChatOpen}
              setIsChatOpen={setIsChatOpen}
            />

            <div className="flex-1 flex overflow-hidden">
              <Editor 
                currentDoc={currentDoc}
                viewMode={viewMode}
                editorRef={editorRef}
                handleUpdateDoc={handleUpdateDoc}
                handleTextSelection={handleTextSelection}
                selection={selection}
                handleMagicAction={handleMagicAction}
              />

              <AnalysisSidebar 
                analysis={analysis}
                handleDeepAnalysis={handleDeepAnalysis}
                isDeepAnalyzing={isDeepAnalyzing}
              />
            </div>
          </>
        ) : (
          <RepoExplorer />
        )}
      </main>

      <ChatPanel 
        isChatOpen={isChatOpen}
        isFocusMode={isFocusMode}
        setIsChatOpen={setIsChatOpen}
        chatHistory={chatHistory}
        isTyping={isTyping}
        chatInput={chatInput}
        setChatInput={setChatInput}
        handleSendMessage={handleSendMessage}
        copyToClipboard={copyToClipboard}
        applyToDocument={applyToDocument}
        chatEndRef={chatEndRef}
      />

      <CommandPalette 
        isCommandPaletteOpen={isCommandPaletteOpen}
        setIsCommandPaletteOpen={setIsCommandPaletteOpen}
        commandSearch={commandSearch}
        setCommandSearch={setCommandSearch}
        filteredCommands={filteredCommands}
        runCommand={runCommand}
      />
    </div>
  );
}
