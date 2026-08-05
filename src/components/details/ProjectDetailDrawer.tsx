import React from 'react';
import { Project } from '../../types';
import { Badge } from '../ui/Badge';
import { formatINR, formatNumber } from '../../utils/formatters';
import { X, Calendar, MapPin, User, Target, CheckCircle2, AlertTriangle, IndianRupee, Layers } from 'lucide-react';

interface ProjectDetailDrawerProps {
  project: Project | null;
  onClose: () => void;
}

export const ProjectDetailDrawer: React.FC<ProjectDetailDrawerProps> = ({ project, onClose }) => {
  if (!project) return null;

  const utilization = Math.round((project.spent / project.budget) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end transition-all">
      <div className="w-full max-w-xl bg-white border-l border-slate-200 h-full flex flex-col shadow-xl overflow-y-auto animate-in slide-in-from-right duration-250 font-sans">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50/60 sticky top-0 z-10 backdrop-blur-md">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-teal-800 font-bold">{project.id}</span>
              <Badge label={project.status} />
              <Badge label={`Risk: ${project.risk}`} />
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">{project.name}</h2>
            <div className="flex items-center gap-4 text-xs text-slate-500 mt-0.5">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {project.district}, {project.state}
              </span>
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {project.lead}
              </span>
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-teal-700" />
                {project.category}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 text-xs">
          {/* Description */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed">
            {project.description}
          </div>

          {/* Budget & Target Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="font-medium">Total Grant Budget</span>
                <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-lg font-bold text-slate-900 font-mono">{formatINR(project.budget, false)}</div>
              <div className="mt-2">
                <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                  <span>Spent: {formatINR(project.spent, true)}</span>
                  <span className="font-bold">{utilization}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      utilization > 90 ? 'bg-amber-600' : 'bg-emerald-600'
                    }`}
                    style={{ width: `${Math.min(utilization, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="font-medium">Beneficiaries Reached</span>
                <Target className="w-3.5 h-3.5 text-sky-600" />
              </div>
              <div className="text-lg font-bold text-slate-900 font-mono">
                {formatNumber(project.beneficiariesReached)}{' '}
                <span className="text-xs text-slate-400 font-normal">/ {formatNumber(project.beneficiariesTarget)}</span>
              </div>
              <div className="mt-2">
                <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                  <span>Target Achievement</span>
                  <span className="font-bold">{Math.round((project.beneficiariesReached / project.beneficiariesTarget) * 100)}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-teal-700"
                    style={{
                      width: `${Math.min(
                        Math.round((project.beneficiariesReached / project.beneficiariesTarget) * 100),
                        100
                      )}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Timeline & Milestones */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-teal-700" /> Key Implementation Milestones
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                {project.startDate} to {project.endDate}
              </span>
            </div>

            <div className="space-y-2">
              {project.milestones?.map((m, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                >
                  <div className="flex items-center gap-2">
                    {m.completed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    )}
                    <span className={m.completed ? 'text-slate-500 line-through' : 'text-slate-900 font-medium'}>
                      {m.title}
                    </span>
                  </div>
                  <span className="text-slate-400 font-mono text-[10px]">Due: {m.dueDate}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Outcomes */}
          <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200">
            <h3 className="font-bold text-teal-900 mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" /> Verified Outcome Metrics
            </h3>
            <ul className="space-y-1.5 text-teal-800">
              {project.keyOutcomes?.map((outcome, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-700 mt-1.5 flex-shrink-0" />
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/60 flex items-center justify-between mt-auto">
          <button className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition">
            Export Audit Record
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-xs font-bold text-white transition shadow-2xs"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
