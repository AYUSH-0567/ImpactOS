import React, { useState, useEffect } from 'react';
import { INITIAL_PROJECTS } from '../../data/mockData';
import { Search, Briefcase, LayoutDashboard, BrainCircuit, FileText, X, ArrowRight } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: string) => void;
  onSelectProject: (projectId: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onSelectProject
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredProjects = INITIAL_PROJECTS.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.category.toLowerCase().includes(query.toLowerCase()) ||
    p.state.toLowerCase().includes(query.toLowerCase())
  );

  const quickNav = [
    { label: 'Executive Overview', tab: 'overview', icon: LayoutDashboard },
    { label: 'Project Analytics', tab: 'projects', icon: Briefcase },
    { label: 'AI Intelligence Center', tab: 'ai-insights', icon: BrainCircuit },
    { label: 'Reports & Compliance', tab: 'reports', icon: FileText }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/30 backdrop-blur-xs flex items-start justify-center pt-20 px-4 font-sans">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Input */}
        <div className="flex items-center px-4 border-b border-slate-200">
          <Search className="w-4 h-4 text-teal-700 mr-2.5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, project name, state, or metric..."
            className="w-full py-3.5 bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
            autoFocus
          />
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 max-h-80 overflow-y-auto space-y-3 text-xs">
          {!query && (
            <div>
              <p className="font-bold text-slate-400 text-[10px] uppercase tracking-wider mb-1.5">Quick Navigation</p>
              <div className="grid grid-cols-2 gap-1.5">
                {quickNav.map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.tab}
                      onClick={() => {
                        onSelectTab(item.tab);
                        onClose();
                      }}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-teal-500/50 text-slate-700 hover:text-slate-900 transition group"
                    >
                      <span className="flex items-center gap-2 font-semibold">
                        <Icon className="w-3.5 h-3.5 text-teal-700" />
                        {item.label}
                      </span>
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <p className="font-bold text-slate-400 text-[10px] uppercase tracking-wider mb-1.5">
              Matching Projects ({filteredProjects.length})
            </p>
            <div className="space-y-1">
              {filteredProjects.map(proj => (
                <button
                  key={proj.id}
                  onClick={() => {
                    onSelectTab('projects');
                    onSelectProject(proj.id);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-50/80 border border-slate-100 hover:border-slate-300 text-left transition group"
                >
                  <div>
                    <span className="font-bold text-slate-900 group-hover:text-teal-800 transition">{proj.name}</span>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {proj.category} • {proj.district}, {proj.state} • Budget: ₹{(proj.budget/100000).toFixed(1)}L
                    </div>
                  </div>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                    {proj.status}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
