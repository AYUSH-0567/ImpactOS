import React, { useState } from 'react';
import { Donor, ProgramCategory } from '../../types';
import { X, HeartHandshake, Plus } from 'lucide-react';

interface CreateDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDonor: (donor: Donor) => void;
}

export const CreateDonationModal: React.FC<CreateDonationModalProps> = ({
  isOpen,
  onClose,
  onAddDonor
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<Donor['type']>('CSR Corporate');
  const [location, setLocation] = useState('Mumbai, MH');
  const [totalDonated, setTotalDonated] = useState(2500000);
  const [frequency, setFrequency] = useState<Donor['frequency']>('Quarterly');
  const [primaryProgram, setPrimaryProgram] = useState<ProgramCategory>('Education');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newDonor: Donor = {
      id: `DNR-${Math.floor(10 + Math.random() * 90)}`,
      name,
      type,
      location,
      totalDonated: Number(totalDonated),
      lastDonationDate: new Date().toISOString().split('T')[0],
      frequency,
      status: 'Active',
      primaryProgram
    };

    onAddDonor(newDonor);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Record New Contribution / Grant</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Donor / Partner Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Wipro Cares Foundation"
              className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-teal-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Donor Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as Donor['type'])}
                className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-teal-600"
              >
                <option value="CSR Corporate">CSR Corporate</option>
                <option value="Foundation Grant">Foundation Grant</option>
                <option value="Individual">Individual Donor</option>
                <option value="Government">Government Grant</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Primary Program</label>
              <select
                value={primaryProgram}
                onChange={(e) => setPrimaryProgram(e.target.value as ProgramCategory)}
                className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-teal-600"
              >
                <option value="Education">Education</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Women Empowerment">Women Empowerment</option>
                <option value="Skill Development">Skill Development</option>
                <option value="Environment">Environment</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Grant Contribution (₹)</label>
              <input
                type="number"
                value={totalDonated}
                onChange={(e) => setTotalDonated(Number(e.target.value))}
                className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-teal-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Payment Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as Donor['frequency'])}
                className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-teal-600"
              >
                <option value="One-time">One-time Grant</option>
                <option value="Monthly">Monthly Recurring</option>
                <option value="Quarterly">Quarterly Tranche</option>
                <option value="Annual">Annual Tranche</option>
              </select>
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
              className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" /> Record Contribution
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
