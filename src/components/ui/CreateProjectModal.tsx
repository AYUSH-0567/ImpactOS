import React, { useState } from 'react';
import { Project, ProgramCategory } from '../../types';
import { X, Briefcase, Plus } from 'lucide-react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProject: (project: Project) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onAddProject
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProgramCategory>('Education');
  const [state, setState] = useState('Haryana');
  const [district, setDistrict] = useState('Gurugram');
  const [lead, setLead] = useState('');
  const [budget, setBudget] = useState(3500000);
  const [beneficiariesTarget, setBeneficiariesTarget] = useState(5000);
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !lead) return;

    const newProject: Project = {
      id: `PRJ-${Math.floor(100 + Math.random() * 900)}`,
      name,
      category,
      state,
      district,
      lead,
      budget: Number(budget),
      spent: 0,
      progress: 0,
      beneficiariesTarget: Number(beneficiariesTarget),
      beneficiariesReached: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2026-12-31',
      status: 'On Track',
      risk: 'Low',
      description: description || 'New field project initiative launched.',
      milestones: [
        { title: 'Site Inspection & Setup', completed: false, dueDate: '2026-03-31' },
        { title: 'Phase 1 Beneficiary Registration', completed: false, dueDate: '2026-06-30' }
      ],
      keyOutcomes: ['Targeting verified community empowerment']
    };

    onAddProject(newProject);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800">
              <Briefcase className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Create New Impact Project</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Project Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Shiksha Jyoti — Rural Digital Classrooms"
              className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-teal-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Program Vertical</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProgramCategory)}
                className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-teal-600"
              >
                <option value="Education">Education</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Women Empowerment">Women Empowerment</option>
                <option value="Skill Development">Skill Development</option>
                <option value="Environment">Environment</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Project Lead *</label>
              <input
                type="text"
                required
                value={lead}
                onChange={(e) => setLead(e.target.value)}
                placeholder="e.g. Dr. Priya Nair"
                className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-teal-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">State Location</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-teal-600"
              >
                <option value="Haryana">Haryana</option>
                <option value="Delhi">Delhi</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Bihar">Bihar</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">District</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. Faridabad"
                className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-teal-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Grant Budget (₹)</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-teal-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Target Beneficiaries</label>
              <input
                type="number"
                value={beneficiariesTarget}
                onChange={(e) => setBeneficiariesTarget(Number(e.target.value))}
                className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-teal-600 font-mono"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" /> Initialize Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
