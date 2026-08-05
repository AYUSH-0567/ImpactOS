import React, { useState, useEffect } from 'react';
import { Project, ProgramCategory, RiskLevel, ProjectStatus } from '../../types';
import { dataService } from '../../services/dataService';
import { 
  FolderKanban, 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Users, 
  DollarSign, 
  ShieldCheck, 
  Archive, 
  Edit3, 
  Trash2, 
  Target, 
  Calendar, 
  ArrowUpRight, 
  BookOpen,
  X,
  ListTodo,
  CheckSquare
} from 'lucide-react';

export const ProjectAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'projects' | 'programs'>('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Modals
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isCreateProgramOpen, setIsCreateProgramOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Program Form State
  const [progName, setProgName] = useState('');
  const [progVertical, setProgVertical] = useState<ProgramCategory>('EDUCATION');
  const [progBudget, setProgBudget] = useState(10000000);
  const [progStartDate, setProgStartDate] = useState('');
  const [progEndDate, setProgEndDate] = useState('');
  const [progObjectives, setProgObjectives] = useState('');
  const [progKPIs, setProgKPIs] = useState('');

  // Project Form State
  const [projName, setProjName] = useState('');
  const [projCategory, setProjCategory] = useState<ProgramCategory>('EDUCATION');
  const [projState, setProjState] = useState('Delhi');
  const [projDistrict, setProjDistrict] = useState('Central Delhi');
  const [projLead, setProjLead] = useState('Ananya Verma');
  const [projBudget, setProjBudget] = useState(5000000);
  const [projTarget, setProjTarget] = useState(2500);
  const [projRisk, setProjRisk] = useState<RiskLevel>('LOW');
  const [projStatus, setProjStatus] = useState<ProjectStatus>('ON_TRACK');
  const [projDesc, setProjDesc] = useState('');

  // Task Milestone State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const p = await dataService.getProjects();
      setProjects(p);

      const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
      const progRes = await fetch(`${baseUrl}/programs`, { credentials: 'include' });
      if (progRes.ok) {
        const progData = await progRes.json();
        setPrograms(progData);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Submit New Program
  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
      const res = await fetch(`${baseUrl}/programs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: progName,
          vertical: progVertical,
          budget: progBudget,
          startDate: progStartDate || undefined,
          endDate: progEndDate || undefined,
          objectives: progObjectives,
          kpis: progKPIs
        })
      });

      if (res.ok) {
        setIsCreateProgramOpen(false);
        resetProgForm();
        fetchAllData();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Archive Program
  const handleArchiveProgram = async (id: string) => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
      await fetch(`${baseUrl}/programs/${id}/archive`, {
        method: 'POST',
        credentials: 'include'
      });
      fetchAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Submit New Project
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dataService.createProject({
        name: projName,
        category: projCategory,
        state: projState,
        district: projDistrict,
        lead: projLead,
        budget: projBudget,
        beneficiariesTarget: projTarget,
        risk: projRisk,
        status: projStatus,
        description: projDesc,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString()
      });

      setIsCreateProjectOpen(false);
      resetProjForm();
      fetchAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Delete Project
  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await dataService.deleteProject(id);
      if (selectedProject?.id === id) setSelectedProject(null);
      fetchAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Add Task Milestone
  const handleAddTaskMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !taskTitle || !taskDueDate) return;

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
      await fetch(`${baseUrl}/projects/${selectedProject.id}/milestones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: taskTitle, dueDate: taskDueDate, status: 'PENDING' })
      });

      setTaskTitle('');
      setTaskDueDate('');
      fetchAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const resetProgForm = () => {
    setProgName('');
    setProgVertical('EDUCATION');
    setProgBudget(10000000);
    setProgObjectives('');
    setProgKPIs('');
  };

  const resetProjForm = () => {
    setProjName('');
    setProjCategory('EDUCATION');
    setProjState('Delhi');
    setProjDistrict('Central Delhi');
    setProjBudget(5000000);
    setProjTarget(2500);
    setProjRisk('LOW');
    setProjStatus('ON_TRACK');
    setProjDesc('');
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-700" /> Relational Architecture
            </span>
            <span className="text-xs text-slate-400 font-mono">Automatic Dashboard Sync</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">Program & Project Management</h1>
          <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
            Manage strategic program verticals, allocated budgets, objectives, project task milestones, team leads, and risk mitigations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateProgramOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-4 h-4" /> + New Program
          </button>
          <button
            onClick={() => setIsCreateProjectOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> + New Project
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-bold">
        <button
          onClick={() => setActiveTab('projects')}
          className={`pb-2 px-1 transition border-b-2 cursor-pointer ${
            activeTab === 'projects' ? 'border-teal-700 text-teal-800' : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Field Projects ({projects.length})
        </button>
        <button
          onClick={() => setActiveTab('programs')}
          className={`pb-2 px-1 transition border-b-2 cursor-pointer ${
            activeTab === 'programs' ? 'border-teal-700 text-teal-800' : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Strategic Programs ({programs.length})
        </button>
      </div>

      {/* TAB 1: PROJECTS GRID */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedProject(p)}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3 transition hover:border-slate-300 cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold font-mono text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                      {p.projectCode}
                    </span>
                    <span className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase ${
                      p.risk === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      p.risk === 'HIGH' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      Risk: {p.risk}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-sm">{p.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{p.description}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex justify-between text-slate-600 font-mono text-[11px]">
                    <span>Capital Spent: ₹{(p.spent / 100000).toFixed(1)} L</span>
                    <span className="font-bold text-slate-900">Budget: ₹{(p.budget / 100000).toFixed(1)} L</span>
                  </div>

                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-teal-700 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, (p.spent / p.budget) * 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-500">
                    <span>Lead: <strong>{p.lead}</strong></span>
                    <span>Reach: <strong>{p.beneficiariesReached.toLocaleString()}</strong> / {p.beneficiariesTarget.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: STRATEGIC PROGRAMS */}
      {activeTab === 'programs' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {programs.map((prog) => (
              <div key={prog.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3 font-sans">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 font-mono">
                      {prog.vertical} VERTICAL
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 mt-1">{prog.name}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      prog.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {prog.status}
                    </span>
                    {prog.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleArchiveProgram(prog.id)}
                        className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
                        title="Archive Program"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs font-mono bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">BUDGET ALLOCATED</span>
                    <span className="font-bold text-slate-900">₹{(prog.budget / 100000).toFixed(1)} L</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">PROJECTS</span>
                    <span className="font-bold text-teal-800">{prog._count?.projects || 0} Projects</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">BENEFICIARIES</span>
                    <span className="font-bold text-emerald-700">{prog._count?.beneficiaries || 0} Reached</span>
                  </div>
                </div>

                {prog.objectives && (
                  <div className="text-xs text-slate-600 space-y-1">
                    <span className="font-bold text-slate-900 block text-[11px]">Strategic Objectives:</span>
                    <p className="text-slate-600 leading-relaxed text-[11px] bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                      {prog.objectives}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE PROGRAM MODAL */}
      {isCreateProgramOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4 text-xs font-sans animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-teal-700" /> Create Strategic Program Vertical
              </h3>
              <button onClick={() => setIsCreateProgramOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProgram} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Program Name</label>
                <input
                  type="text"
                  required
                  value={progName}
                  onChange={(e) => setProgName(e.target.value)}
                  placeholder="Digital Pedagogy Initiative"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Vertical Category</label>
                  <select
                    value={progVertical}
                    onChange={(e) => setProgVertical(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-700"
                  >
                    <option value="EDUCATION">EDUCATION</option>
                    <option value="HEALTHCARE">HEALTHCARE</option>
                    <option value="WOMEN_EMPOWERMENT">WOMEN EMPOWERMENT</option>
                    <option value="SKILL_DEVELOPMENT">SKILL DEVELOPMENT</option>
                    <option value="ENVIRONMENT">ENVIRONMENT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Allocated Budget (₹)</label>
                  <input
                    type="number"
                    required
                    value={progBudget}
                    onChange={(e) => setProgBudget(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:border-teal-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Strategic Objectives</label>
                <textarea
                  rows={2}
                  value={progObjectives}
                  onChange={(e) => setProgObjectives(e.target.value)}
                  placeholder="Outline key multi-year milestone goals..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-700"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateProgramOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold cursor-pointer"
                >
                  Create Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE PROJECT MODAL */}
      {isCreateProjectOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs font-sans animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                <FolderKanban className="w-4 h-4 text-teal-700" /> Create Field Project
              </h3>
              <button onClick={() => setIsCreateProjectOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                  placeholder="Gurugram STEM Lab Initiative"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={projState}
                    onChange={(e) => setProjState(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">District</label>
                  <input
                    type="text"
                    required
                    value={projDistrict}
                    onChange={(e) => setProjDistrict(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Budget (₹)</label>
                  <input
                    type="number"
                    required
                    value={projBudget}
                    onChange={(e) => setProjBudget(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:border-teal-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Target Beneficiaries</label>
                  <input
                    type="number"
                    required
                    value={projTarget}
                    onChange={(e) => setProjTarget(parseInt(e.target.value) || 1000)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:border-teal-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  placeholder="Project field scope and parameters..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-700"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateProjectOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold cursor-pointer"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROJECT DETAILED DRAWER (Tasks, Deadlines, Milestones) */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl overflow-y-auto p-6 space-y-6 animate-in slide-in-from-right duration-200 font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold font-mono uppercase bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded">
                  {selectedProject.projectCode}
                </span>
                <h2 className="text-lg font-extrabold text-slate-900 mt-1">{selectedProject.name}</h2>
              </div>
              <button onClick={() => setSelectedProject(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* TASK MILESTONES */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                <ListTodo className="w-4 h-4 text-teal-700" /> Project Tasks & Deadlines
              </h3>

              <div className="space-y-2">
                {selectedProject.milestones?.map((m) => (
                  <div key={m.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-teal-700" />
                      <span className="font-bold text-slate-900">{m.title}</span>
                    </div>
                    <span className="text-slate-500">Due: {new Date(m.dueDate).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>

              {/* Add Milestone Form */}
              <form onSubmit={handleAddTaskMilestone} className="flex gap-2 text-xs">
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Task title..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-700"
                />
                <input
                  type="date"
                  required
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-700"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-teal-800 text-white font-bold cursor-pointer"
                >
                  + Add Task
                </button>
              </form>
            </div>

            <div className="pt-4 flex justify-between border-t border-slate-100">
              <button
                onClick={() => handleDeleteProject(selectedProject.id)}
                className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition cursor-pointer"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
