import React, { useState, useEffect } from 'react';
import { Donor, Donation, DonorAgreement, ProgramCategory } from '../../types';
import { dataService } from '../../services/dataService';
import { 
  DollarSign, 
  Search, 
  Filter, 
  Plus, 
  Building2, 
  ShieldCheck, 
  FileText, 
  Calendar, 
  CheckCircle2, 
  Download, 
  Award, 
  Clock, 
  Mail, 
  Phone, 
  MapPin, 
  Edit3, 
  Trash2, 
  X,
  FileCheck,
  TrendingUp,
  Receipt
} from 'lucide-react';

export const DonationAnalytics: React.FC = () => {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All Types');
  const [filterStatus, setFilterStatus] = useState('All');

  // Selected Profile Drawer
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);

  // Modals
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRecordDonationOpen, setIsRecordDonationOpen] = useState(false);
  const [isAgreementModalOpen, setIsAgreementModalOpen] = useState(false);
  const [targetDonor, setTargetDonor] = useState<Donor | null>(null);

  // Donor Form State
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<any>('CSR_CORPORATE');
  const [formLocation, setFormLocation] = useState('Mumbai, MH');
  const [formContactPerson, setFormContactPerson] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPanTaxNo, setFormPanTaxNo] = useState('');
  const [formFrequency, setFormFrequency] = useState<'One-time' | 'Monthly' | 'Quarterly' | 'Annual'>('Annual');
  const [formPrimaryProgram, setFormPrimaryProgram] = useState<ProgramCategory>('EDUCATION');
  const [formInitialDonated, setFormInitialDonated] = useState(5000000);

  // Donation Record Form State
  const [donationAmount, setDonationAmount] = useState(1000000);
  const [donationProgramId, setDonationProgramId] = useState('prg-edu-01');
  const [donationPaymentMethod, setDonationPaymentMethod] = useState('NEFT / Wire Transfer');
  const [donationFrequency, setDonationFrequency] = useState('Annual');

  // Agreement Form State
  const [agreeTitle, setAgreeTitle] = useState('CSR Impact Grant MOU 2026');
  const [agreeAmount, setAgreeAmount] = useState(10000000);
  const [agreeStartDate, setAgreeStartDate] = useState('');
  const [agreeEndDate, setAgreeEndDate] = useState('');

  const fetchDonorData = async () => {
    setIsLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';

      const query = new URLSearchParams();
      if (searchQuery) query.append('search', searchQuery);
      if (filterType !== 'All Types') query.append('type', filterType);
      if (filterStatus !== 'All') query.append('status', filterStatus);

      const res = await fetch(`${baseUrl}/donors?${query.toString()}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setDonors(data);
        if (selectedDonor) {
          const refreshed = data.find((d: Donor) => d.id === selectedDonor.id);
          if (refreshed) setSelectedDonor(refreshed);
        }
      }

      const summaryRes = await fetch(`${baseUrl}/donors/analytics/funding`, { credentials: 'include' });
      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setSummary(summaryData);
      }
    } catch (err) {
      console.error('Error fetching donors:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDonorData();
  }, [searchQuery, filterType, filterStatus]);

  // Register Donor
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
      const res = await fetch(`${baseUrl}/donors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formName,
          type: formType,
          location: formLocation,
          contactPerson: formContactPerson,
          email: formEmail,
          phone: formPhone,
          panTaxNo: formPanTaxNo,
          frequency: formFrequency,
          primaryProgram: formPrimaryProgram,
          totalDonated: formInitialDonated
        })
      });

      if (res.ok) {
        setIsRegisterModalOpen(false);
        resetForm();
        fetchDonorData();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Record Donation Disbursement
  const handleRecordDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDonor) return;

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
      await fetch(`${baseUrl}/donors/${selectedDonor.id}/donations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          amount: donationAmount,
          programId: donationProgramId,
          paymentMethod: donationPaymentMethod,
          frequency: donationFrequency
        })
      });

      setIsRecordDonationOpen(false);
      fetchDonorData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Record Grant Agreement
  const handleAgreementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDonor || !agreeStartDate || !agreeEndDate) return;

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
      await fetch(`${baseUrl}/donors/${selectedDonor.id}/agreements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: agreeTitle,
          grantAmount: agreeAmount,
          startDate: agreeStartDate,
          endDate: agreeEndDate
        })
      });

      setIsAgreementModalOpen(false);
      fetchDonorData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Delete Donor
  const handleDeleteDonor = async (id: string) => {
    if (!confirm('Are you sure you want to delete this donor record?')) return;
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
      await fetch(`${baseUrl}/donors/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (selectedDonor?.id === id) setSelectedDonor(null);
      fetchDonorData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Generate 80G Tax Summary Report
  const handleGenerateDonorSummary = (donor: Donor) => {
    const summaryText = `IMPACTOS FOUNDATION INDIA — FORM 80G / FCRA DONOR SUMMARY REPORT
----------------------------------------------------------------------
Donor Name: ${donor.name}
Donor Code: ${donor.donorCode || 'DNR-2026'}
Donor Type: ${donor.type}
Location: ${donor.location}
Contact Person: ${donor.contactPerson || 'N/A'}
PAN / Tax ID: ${donor.panTaxNo || 'AAATI9982K'}
Total Contributions: ₹${(donor.totalDonated / 100000).toFixed(2)} Lakhs
Recurring Schedule: ${donor.frequency}
Report Issued Date: ${new Date().toLocaleDateString()}
----------------------------------------------------------------------
This document certifies that contributions received are compliant under Section 80G of the Indian Income Tax Act.`;

    const blob = new Blob([summaryText], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Donor_80G_Summary_${donor.name.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetForm = () => {
    setFormName('');
    setFormType('CSR_CORPORATE');
    setFormLocation('Mumbai, MH');
    setFormContactPerson('');
    setFormEmail('');
    setFormPhone('');
    setFormPanTaxNo('');
    setFormFrequency('Annual');
    setFormInitialDonated(5000000);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-700" /> Multi-Tenant Grant Registry
            </span>
            <span className="text-xs text-slate-400 font-mono">FCRA & Section 80G Compliant</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">Donor & CSR Partner Management</h1>
          <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
            Track CSR corporate grants, individual donors, foundation MOUs, recurring donation pipelines, and generate 80G tax summaries.
          </p>
        </div>

        <button
          onClick={() => { resetForm(); setIsRegisterModalOpen(true); }}
          className="px-3.5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs shadow-2xs transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Register Donor / CSR
        </button>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-semibold uppercase block">TOTAL CAPITAL RAISED</span>
          <span className="font-bold text-teal-800 text-base mt-0.5 block">
            ₹{((summary?.totalCapitalRaised || donors.reduce((sum, d) => sum + d.totalDonated, 0)) / 10000000).toFixed(2)} Cr
          </span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-semibold uppercase block">ACTIVE DONORS & CSR</span>
          <span className="font-bold text-slate-900 text-base mt-0.5 block">{summary?.totalDonors || donors.length} Partners</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-semibold uppercase block">RECURRING PIPELINE</span>
          <span className="font-bold text-emerald-700 text-base mt-0.5 block">
            {summary?.recurringPipeline?.find((r: any) => r.frequency === 'Annual')?.count || 0} Annual MOUs
          </span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-semibold uppercase block">PRIMARY CATEGORY</span>
          <span className="font-bold text-slate-800 text-xs mt-1 block truncate">
            CSR Corporate Grants
          </span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center gap-3 text-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search donors by partner name, code, contact person, or location..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:border-teal-700"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold focus:outline-none"
          >
            <option value="All Types">All Partner Types</option>
            <option value="CSR_CORPORATE">CSR Corporate</option>
            <option value="FOUNDATION_GRANT">Foundation Grant</option>
            <option value="INDIVIDUAL">Individual</option>
            <option value="GOVERNMENT">Government</option>
          </select>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Donor Code</th>
                <th className="py-3 px-4">Partner Name & Contact</th>
                <th className="py-3 px-4">Partner Type</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Total Donated</th>
                <th className="py-3 px-4">Frequency</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Querying donor & grant database records...
                  </td>
                </tr>
              ) : donors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No donor records match the query.
                  </td>
                </tr>
              ) : (
                donors.map((d) => (
                  <tr
                    key={d.id}
                    onClick={() => setSelectedDonor(d)}
                    className="hover:bg-slate-50/80 transition cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-teal-800">{d.donorCode || 'DNR-2026'}</td>
                    <td className="py-3 px-4">
                      <div className="font-extrabold text-slate-900 group-hover:text-teal-800 transition">{d.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{d.contactPerson || d.email || 'Direct Contact'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                        {String(d.type).replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{d.location}</td>
                    <td className="py-3 px-4 font-mono font-bold text-teal-800">₹{(d.totalDonated / 100000).toFixed(2)} Lakhs</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 font-mono">
                        {d.frequency}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleGenerateDonorSummary(d)}
                          className="p-1.5 rounded hover:bg-teal-50 text-slate-400 hover:text-teal-700 transition cursor-pointer"
                          title="Generate 80G Tax Summary"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDonor(d.id)}
                          className="p-1.5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-700 transition cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DONOR PROFILE DRAWER */}
      {selectedDonor && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl overflow-y-auto p-6 space-y-6 animate-in slide-in-from-right duration-200 font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold font-mono uppercase bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded">
                  {selectedDonor.donorCode || 'DNR-2026'}
                </span>
                <h2 className="text-lg font-extrabold text-slate-900 mt-1">{selectedDonor.name}</h2>
              </div>
              <button onClick={() => setSelectedDonor(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Summary */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">CONTACT PERSON</span>
                <span className="font-semibold text-slate-900">{selectedDonor.contactPerson || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">EMAIL / PHONE</span>
                <span className="font-mono text-slate-900">{selectedDonor.email || selectedDonor.phone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">TOTAL CONTRIBUTED</span>
                <span className="font-mono font-bold text-teal-800">₹{(selectedDonor.totalDonated / 100000).toFixed(2)} Lakhs</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">RECURRING SCHEDULE</span>
                <span className="font-semibold text-slate-900">{selectedDonor.frequency}</span>
              </div>
            </div>

            {/* GRANT DISBURSEMENTS & DONATIONS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                  <DollarSign className="w-4 h-4 text-teal-700" /> Grant Disbursement History
                </h3>

                <button
                  onClick={() => setIsRecordDonationOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-teal-800 text-white font-bold text-xs cursor-pointer"
                >
                  + Record Disbursement
                </button>
              </div>

              <div className="space-y-1.5">
                {selectedDonor.donations?.map((don) => (
                  <div key={don.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="font-bold text-teal-800">₹{(don.amount / 100000).toFixed(2)} Lakhs</span>
                      <span className="text-[10px] text-slate-400 block">{don.paymentMethod} • {don.txHash || 'TXN-2026'}</span>
                    </div>
                    <span className="text-slate-500">{new Date(don.date).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* GRANT AGREEMENTS & MOUS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                  <FileCheck className="w-4 h-4 text-teal-700" /> Grant MOUs & Agreements
                </h3>

                <button
                  onClick={() => setIsAgreementModalOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs cursor-pointer"
                >
                  + Add Agreement
                </button>
              </div>

              <div className="space-y-2">
                {selectedDonor.agreements?.map((ag) => (
                  <div key={ag.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs font-mono">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">{ag.title}</span>
                      <span className="text-teal-800 font-bold">₹{(ag.grantAmount / 100000).toFixed(2)} L</span>
                    </div>
                    <p className="text-[10px] text-slate-400">MOU Ref: {ag.agreementNo} • Term: {new Date(ag.startDate).toLocaleDateString()} to {new Date(ag.endDate).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 80G SUMMARY REPORT ACTION */}
            <div className="pt-2">
              <button
                onClick={() => handleGenerateDonorSummary(selectedDonor)}
                className="w-full py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs transition shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download 80G / FCRA Impact Summary Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REGISTER DONOR MODAL */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4 text-xs font-sans animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-teal-700" /> Register Donor / CSR Corporate Partner
              </h3>
              <button onClick={() => setIsRegisterModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Partner Organization Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Tata CSR Foundation"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Partner Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-700"
                  >
                    <option value="CSR_CORPORATE">CSR Corporate</option>
                    <option value="FOUNDATION_GRANT">Foundation Grant</option>
                    <option value="INDIVIDUAL">Individual Donor</option>
                    <option value="GOVERNMENT">Government Grant</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Recurring Schedule</label>
                  <select
                    value={formFrequency}
                    onChange={(e) => setFormFrequency(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-700"
                  >
                    <option value="Annual">Annual MOU</option>
                    <option value="Quarterly">Quarterly Tranche</option>
                    <option value="Monthly">Monthly Recurring</option>
                    <option value="One-time">One-time Grant</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={formContactPerson}
                    onChange={(e) => setFormContactPerson(e.target.value)}
                    placeholder="Rajesh Malhotra"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="Mumbai, MH"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-700"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold cursor-pointer"
                >
                  Register Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD DONATION MODAL */}
      {isRecordDonationOpen && selectedDonor && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-sm w-full p-6 shadow-2xl space-y-4 text-xs font-sans animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-teal-700" /> Record Grant Disbursement
              </h3>
              <button onClick={() => setIsRecordDonationOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordDonationSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Disbursement Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:border-teal-700"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Payment Method</label>
                <input
                  type="text"
                  value={donationPaymentMethod}
                  onChange={(e) => setDonationPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-700"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRecordDonationOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold cursor-pointer"
                >
                  Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
