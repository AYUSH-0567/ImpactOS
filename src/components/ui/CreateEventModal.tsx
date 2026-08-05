import React, { useState } from 'react';
import { ProgramCategory } from '../../types';
import { X, Calendar, Plus } from 'lucide-react';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEvent: (evt: { title: string; date: string; location: string; volunteers: number; program: ProgramCategory }) => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onAddEvent
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-04-15');
  const [location, setLocation] = useState('Patna, BR');
  const [volunteers, setVolunteers] = useState(20);
  const [program, setProgram] = useState<ProgramCategory>('Education');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    onAddEvent({
      title,
      date,
      location,
      volunteers: Number(volunteers),
      program
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Plan Mobilization Drive</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Drive Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Patna Rural Health Screening Camp"
              className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-teal-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Program Vertical</label>
              <select
                value={program}
                onChange={(e) => setProgram(e.target.value as ProgramCategory)}
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
              <label className="block text-slate-600 font-semibold mb-1">Scheduled Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-teal-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Location / District</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Varanasi, UP"
                className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Target Volunteers</label>
              <input
                type="number"
                value={volunteers}
                onChange={(e) => setVolunteers(Number(e.target.value))}
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
              <Plus className="w-3.5 h-3.5" /> Schedule Drive
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
