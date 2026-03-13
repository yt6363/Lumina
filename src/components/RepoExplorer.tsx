import React, { useState, useEffect, useRef } from 'react';
import { Github, Folder, File, ChevronRight, ChevronDown, Loader2, Share2, ExternalLink, GitBranch, Star, Eye, Sparkles } from 'lucide-react';
import { Octokit } from 'octokit';
import mermaid from 'mermaid';
import { generateRepoDiagram } from '../services/gemini';
import { cn } from '../utils';

mermaid.initialize({
  startOnLoad: true,
  theme: 'neutral',
  securityLevel: 'loose',
  fontFamily: 'Inter, system-ui, sans-serif',
});

interface RepoFile {
  name: string;
  path: string;
  type: 'dir' | 'file';
  children?: RepoFile[];
}

export function RepoExplorer() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('github_token'));
  const [repoUrl, setRepoUrl] = useState('');
  const [repoData, setRepoData] = useState<any>(null);
  const [fileTree, setFileTree] = useState<RepoFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [diagram, setDiagram] = useState<string | null>(null);
  const [generatingDiagram, setGeneratingDiagram] = useState(false);
  const diagramRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GITHUB_AUTH_SUCCESS') {
        const newToken = event.data.token;
        setToken(newToken);
        localStorage.setItem('github_token', newToken);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (diagram && diagramRef.current) {
      diagramRef.current.innerHTML = '';
      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      mermaid.render(id, diagram).then(({ svg }) => {
        if (diagramRef.current) {
          diagramRef.current.innerHTML = svg;
        }
      });
    }
  }, [diagram]);

  const handleConnect = async () => {
    try {
      const response = await fetch('/api/auth/github/url');
      const { url } = await response.json();
      window.open(url, 'github_oauth', 'width=600,height=700');
    } catch (error) {
      console.error('Failed to get auth URL:', error);
    }
  };

  const parseRepoUrl = (url: string) => {
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (match) {
      return { owner: match[1], repo: match[2].replace('.git', '') };
    }
    return null;
  };

  const fetchRepoData = async () => {
    const parsed = parseRepoUrl(repoUrl);
    if (!parsed) return alert('Invalid GitHub URL');

    setLoading(true);
    try {
      const octokit = new Octokit({ auth: token });
      
      // Fetch repo metadata
      const { data: repo } = await octokit.rest.repos.get({
        owner: parsed.owner,
        repo: parsed.repo,
      });
      setRepoData(repo);

      // Fetch file tree (recursive)
      const { data: treeData } = await octokit.rest.git.getTree({
        owner: parsed.owner,
        repo: parsed.repo,
        tree_sha: repo.default_branch,
        recursive: 'true',
      });

      const root: RepoFile[] = [];
      const map: { [path: string]: RepoFile } = {};

      treeData.tree.forEach((item: any) => {
        const parts = item.path.split('/');
        let currentLevel = root;
        let currentPath = '';

        parts.forEach((part: string, index: number) => {
          currentPath = currentPath ? `${currentPath}/${part}` : part;
          if (!map[currentPath]) {
            const newNode: RepoFile = {
              name: part,
              path: currentPath,
              type: index === parts.length - 1 && item.type === 'blob' ? 'file' : 'dir',
              children: [],
            };
            map[currentPath] = newNode;
            currentLevel.push(newNode);
          }
          currentLevel = map[currentPath].children!;
        });
      });

      setFileTree(root);

      // Generate Diagram
      setGeneratingDiagram(true);
      
      // Get README for context
      let readme = '';
      try {
        const { data: readmeData } = await octokit.rest.repos.getReadme({
          owner: parsed.owner,
          repo: parsed.repo,
        });
        readme = atob(readmeData.content);
      } catch (e) {
        console.warn('No README found');
      }

      const structure = treeData.tree
        .filter((i: any) => i.type === 'dir' || i.path.endsWith('.ts') || i.path.endsWith('.tsx') || i.path.endsWith('.js'))
        .map((i: any) => i.path)
        .slice(0, 100)
        .join('\n');

      const diagramCode = await generateRepoDiagram(structure, readme);
      setDiagram(diagramCode);

    } catch (error) {
      console.error('Error fetching repo:', error);
      alert('Failed to fetch repository. Check if it is public or if you have access.');
    } finally {
      setLoading(false);
      setGeneratingDiagram(false);
    }
  };

  const FileNode = ({ node, depth = 0 }: { node: RepoFile, depth?: number }) => {
    const [isOpen, setIsOpen] = useState(depth < 1);
    const isDir = node.type === 'dir';

    return (
      <div className="select-none">
        <div 
          className={cn(
            "flex items-center py-1 px-2 hover:bg-slate-100 cursor-pointer rounded text-sm transition-colors",
            depth > 0 && "ml-4"
          )}
          onClick={() => isDir && setIsOpen(!isOpen)}
        >
          <span className="mr-2 text-slate-400">
            {isDir ? (
              isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
            ) : null}
          </span>
          <span className={cn("mr-2", isDir ? "text-blue-500" : "text-slate-500")}>
          </span>
          <span className="truncate">{node.name}</span>
        </div>
        {isDir && isOpen && node.children?.map(child => (
          <FileNode key={child.path} node={child} depth={depth + 1} />
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-slate-50/50">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Repo Explorer</h1>
                <p className="text-sm text-slate-500">Analyze architecture and visualize data flow</p>
              </div>
            </div>
            {!token ? (
              <button 
                onClick={handleConnect}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all font-medium text-sm shadow-sm"
              >
                Connect GitHub
              </button>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 text-xs font-medium">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                GitHub Connected
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <input 
                type="text" 
                placeholder="https://github.com/owner/repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="w-full pl-4 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm"
              />
            </div>
            <button 
              onClick={fetchRepoData}
              disabled={loading || !repoUrl}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm shadow-sm flex items-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              Analyze
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* File Tree Sidebar */}
        <div className="w-72 border-r border-slate-200 flex flex-col bg-white">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">File Explorer</span>
            {repoData && (
              <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-mono">
                {repoData.default_branch}
              </span>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200">
            {fileTree.length > 0 ? (
              fileTree.map(node => <FileNode key={node.path} node={node} />)
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center space-y-3">
                <p className="text-xs">Enter a repo URL to see files</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50/30 p-8 scrollbar-thin scrollbar-thumb-slate-200">
          <div className="max-w-5xl mx-auto space-y-8">
            {repoData && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                      {repoData.name}
                      <a href={repoData.html_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-500 transition-colors">
                        <ExternalLink size={18} />
                      </a>
                    </h2>
                    <p className="text-slate-500 text-sm max-w-2xl">{repoData.description}</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-slate-600 font-medium">
                        {repoData.stargazers_count}
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Stars</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-slate-600 font-medium">
                        {repoData.forks_count}
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Forks</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-slate-600 font-medium">
                        {repoData.watchers_count}
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Watchers</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {repoData.topics?.map((topic: string) => (
                    <span key={topic} className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium border border-blue-100">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">Architecture Diagram</span>
                </div>
                {generatingDiagram && (
                  <div className="flex items-center gap-2 text-blue-600 text-xs font-medium animate-pulse">
                    <Loader2 size={14} className="animate-spin" />
                    AI is analyzing structure...
                  </div>
                )}
              </div>
              <div className="p-8 min-h-[400px] flex items-center justify-center bg-white overflow-x-auto">
                {diagram ? (
                  <div ref={diagramRef} className="w-full h-full flex justify-center" />
                ) : (
                  <div className="text-center space-y-4 max-w-xs">
                    <div className="space-y-1">
                      <h3 className="text-slate-900 font-medium">No Diagram Generated</h3>
                      <p className="text-slate-400 text-sm">Analyze a repository to see its architecture and data flow visualized.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
