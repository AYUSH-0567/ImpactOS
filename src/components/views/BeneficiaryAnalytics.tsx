import React, { useState, useEffect } from 'react';
import { Beneficiary, BeneficiaryDocument, BeneficiaryAttendance, BeneficiaryEnrollment, BeneficiaryHistory } from '../../types';
import { dataService } from '../../services/dataService';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Upload, 
  FileText, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Trash2, 
  Edit3, 
  UserCheck, 
  X, 
  Phone, 
  MapPin, 
  BookOpen, 
  Award,
  History,
  FilePlus,
  UserPlus
} from 'lucide-react';

export const BeneficiaryAnalytics: React.FC = () => {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGender, setFilterGender] = useState('All');
  const [filterState, setFilterState] = useState('All States');
  const [filterStatus, setFilterStatus] = useState('All Statuses');

  // Drawer Profile State
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [targetBeneficiary, setTargetBeneficiary] = useState<Beneficiary | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formGender, setFormGender] = useState<'Female' | 'Male' | 'Other'>('Female');
  const [formAge, setFormAge] = useState(26);
  const [formPhone, setFormPhone] = useState('');
  const [formDistrict, setFormDistrict] = useState('');
  const [formState, setFormState] = useState('Delhi');
  const [formIncomeTier, setFormIncomeTier] = useState('Low Income');
  const [formStatus, setFormStatus] = useState<'Active' | 'Under Audit' | 'Graduated'>('Active');
  const [formAddress, setFormAddress] = useState('');

  // Attendance Form
  const [attendStatus, setAttendStatus] = useState<'PRESENT' | 'ABSENT' | 'EXCUSED' | 'LATE'>('PRESENT');
  const [attendNotes, setAttendNotes] = useState('');

  // Enrollment Form
  const [enrollProgramName, setEnrollProgramName] = useState('Pratham Secondary Education');

  // File Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  const fetchBeneficiaries = async () => {
    setIsLoading(true);
    try {
      const data = await dataService.getBeneficiaries({
        search: searchQuery,
        gender: filterGender,
        state: filterState,
        status: filterStatus
      });
      setBeneficiaries(data);

      // Refresh drawer if selected
      if (selectedBeneficiary) {
        const refreshed = data.find(b => b.id === selectedBeneficiary.id);
        if (refreshed) setSelectedBeneficiary(refreshed);
      }
    } catch (err) {
      console.error('Error fetching beneficiaries:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBeneficiaries();
  }, [searchQuery, filterGender, filterState, filterStatus]);

  // Open Edit Modal
  const openEditModal = (b: Beneficiary) => {
    setTargetBeneficiary(b);
    setFormName(b.name);
    setFormGender(b.gender as any);
    setFormAge(b.age);
    setFormPhone(b.phone || '');
    setFormDistrict(b.district);
    setFormState(b.state);
    setFormIncomeTier(b.incomeTier || 'Low Income');
    setFormStatus(b.status as any);
    setFormAddress(b.address || '');
    setIsEditModalOpen(true);
  };

  // Save Add Form
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dataService.createBeneficiary({
        name: formName,
        gender: formGender,
        age: formAge,
        phone: formPhone || undefined,
        district: formDistrict,
        state: formState,
        incomeTier: formIncomeTier,
        status: formStatus,
        address: formAddress || undefined
      });

      setIsAddModalOpen(false);
      resetForm();
      fetchBeneficiaries();
    } catch (err: any) {
      alert(`Error creating beneficiary: ${err.message}`);
    }
  };

  // Save Edit Form
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetBeneficiary) return;

    try {
      await dataService.updateBeneficiary(targetBeneficiary.id, {
        name: formName,
        gender: formGender,
        age: formAge,
        phone: formPhone || undefined,
        district: formDistrict,
        state: formState,
        incomeTier: formIncomeTier,
        status: formStatus,
        address: formAddress || undefined
      });

      setIsEditModalOpen(false);
      resetForm();
      fetchBeneficiaries();
    } catch (err: any) {
      alert(`Error updating beneficiary: ${err.message}`);
    }
  };

  // Confirm Delete
  const handleDeleteConfirm = async () => {
    if (!targetBeneficiary) return;
    try {
      await dataService.deleteBeneficiary(targetBeneficiary.id);
      setIsDeleteModalOpen(false);
      if (selectedBeneficiary?.id === targetBeneficiary.id) setSelectedBeneficiary(null);
      setTargetBeneficiary(null);
      fetchBeneficiaries();
    } catch (err: any) {
      alert(`Error deleting beneficiary: ${err.message}`);
    }
  };

  // Submit Attendance
  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBeneficiary) return;

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
      await fetch(`${baseUrl}/beneficiaries/${selectedBeneficiary.id}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: attendStatus, notes: attendNotes })
      });

      setAttendNotes('');
      fetchBeneficiaries();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Submit Program Enrollment
  const handleAddEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBeneficiary) return;

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
      await fetch(`${baseUrl}/beneficiaries/${selectedBeneficiary.id}/enrollments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ programName: enrollProgramName, status: 'ENROLLED' })
      });

      fetchBeneficiaries();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Submit Document Upload
  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBeneficiary || !uploadFile) return;

    setIsUploadingDoc(true);
    try {
      await dataService.uploadBeneficiaryDocument(selectedBeneficiary.id, uploadFile);
      setUploadFile(null);
      fetchBeneficiaries();
    } catch (err: any) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setIsUploadingDoc(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Beneficiary Code', 'Name', 'Gender', 'Age', 'Phone', 'Aadhaar Masked', 'District', 'State', 'Status'];
    const rows = beneficiaries.map(b => [
      b.beneficiaryCode,
      `"${b.name}"`,
      b.gender,
      b.age,
      b.phone || '',
      b.aadhaarMasked,
      `"${b.district}"`,
      `"${b.state}"`,
      b.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Beneficiaries_Export_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetForm = () => {
    setFormName('');
    setFormGender('Female');
    setFormAge(26);
    setFormPhone('');
    setFormDistrict('');
    setFormState('Delhi');
    setFormIncomeTier('Low Income');
    setFormStatus('Active');
    setFormAddress('');
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-700" /> Database Persisted Registry
            </span>
            <span className="text-xs text-slate-400 font-mono">100% Multi-Tenant Isolated</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">Beneficiary Management Engine</h1>
          <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
            Multi-tenant field beneficiary registry with verified document repositories, attendance tracking, program enrollments, and audit history timelines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            onClick={() => { resetForm(); setIsAddModalOpen(true); }}
            className="px-3.5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" /> Add Beneficiary
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, code, phone, or district..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:border-teal-700"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold focus:outline-none"
          >
            <option value="All">All Genders</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Other">Other</option>
          </select>

          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold focus:outline-none"
          >
            <option value="All States">All States</option>
            <option value="Delhi">Delhi</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Haryana">Haryana</option>
            <option value="Bihar">Bihar</option>
            <option value="Maharashtra">Maharashtra</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold focus:outline-none"
          >
            <option value="All Statuses">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Under Audit">Under Audit</option>
            <option value="Graduated">Graduated</option>
          </select>
        </div>
      </div>

      {/* Main Beneficiary Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Beneficiary Code</th>
                <th className="py-3 px-4">Name & Demographics</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Aadhaar (Masked)</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Querying multi-tenant database records...
                  </td>
                </tr>
              ) : beneficiaries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No beneficiary records match the query.
                  </td>
                </tr>
              ) : (
                beneficiaries.map((b) => (
                  <tr
                    key={b.id}
                    onClick={() => setSelectedBeneficiary(b)}
                    className="hover:bg-slate-50/80 transition cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-teal-800">{b.beneficiaryCode}</td>
                    <td className="py-3 px-4">
                      <div className="font-extrabold text-slate-900 group-hover:text-teal-800 transition">{b.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{b.gender} • {b.age} yrs</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{b.phone || '—'}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{b.aadhaarMasked}</td>
                    <td className="py-3 px-4 text-slate-700">{b.district}, {b.state}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        b.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        b.status === 'Under Audit' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(b)}
                          className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { setTargetBeneficiary(b); setIsDeleteModalOpen(true); }}
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

      {/* BENEFICIARY PROFILE DRAWER */}
      {selectedBeneficiary && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl overflow-y-auto p-6 space-y-6 animate-in slide-in-from-right duration-200 font-sans">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold font-mono uppercase bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded">
                  {selectedBeneficiary.beneficiaryCode}
                </span>
                <h2 className="text-lg font-extrabold text-slate-900 mt-1">{selectedBeneficiary.name}</h2>
              </div>
              <button
                onClick={() => setSelectedBeneficiary(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Demographics Summary */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">GENDER & AGE</span>
                <span className="font-semibold text-slate-900">{selectedBeneficiary.gender}, {selectedBeneficiary.age} Years</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">PHONE</span>
                <span className="font-mono text-slate-900">{selectedBeneficiary.phone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">AADHAAR (VERIFIED)</span>
                <span className="font-mono text-slate-900">{selectedBeneficiary.aadhaarMasked}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">LOCATION</span>
                <span className="font-semibold text-slate-900">{selectedBeneficiary.district}, {selectedBeneficiary.state}</span>
              </div>
            </div>

            {/* PROGRAM ENROLLMENTS */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                <BookOpen className="w-4 h-4 text-teal-700" /> Program Enrollments
              </h3>

              <div className="space-y-1.5">
                {selectedBeneficiary.enrollments?.map((e) => (
                  <div key={e.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-slate-800">{e.programName}</span>
                    <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                      {e.status}
                    </span>
                  </div>
                ))}
              </div>

              {/* Add Enrollment Form */}
              <form onSubmit={handleAddEnrollment} className="flex gap-2 text-xs">
                <input
                  type="text"
                  required
                  value={enrollProgramName}
                  onChange={(e) => setEnrollProgramName(e.target.value)}
                  placeholder="Program Name..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-700"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold cursor-pointer"
                >
                  + Enroll
                </button>
              </form>
            </div>

            {/* ATTENDANCE TRACKER */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                <Calendar className="w-4 h-4 text-teal-700" /> Attendance Tracker
              </h3>

              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {selectedBeneficiary.attendance?.map((a) => (
                  <div key={a.id} className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500">{new Date(a.date).toLocaleDateString()}</span>
                    <span className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase ${
                      a.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {a.status}
                    </span>
                  </div>
                ))}
              </div>

              {/* Mark Attendance Form */}
              <form onSubmit={handleMarkAttendance} className="flex gap-2 text-xs">
                <select
                  value={attendStatus}
                  onChange={(e) => setAttendStatus(e.target.value as any)}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-none"
                >
                  <option value="PRESENT">PRESENT</option>
                  <option value="ABSENT">ABSENT</option>
                  <option value="EXCUSED">EXCUSED</option>
                  <option value="LATE">LATE</option>
                </select>
                <input
                  type="text"
                  value={attendNotes}
                  onChange={(e) => setAttendNotes(e.target.value)}
                  placeholder="Notes (optional)..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-700"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold cursor-pointer"
                >
                  Mark
                </button>
              </form>
            </div>

            {/* VERIFICATION DOCUMENTS REPOSITORY */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                <FileText className="w-4 h-4 text-teal-700" /> Verification Documents Repo
              </h3>

              <div className="space-y-2">
                {selectedBeneficiary.documents?.map((doc) => (
                  <div key={doc.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <div>
                        <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="font-bold text-teal-800 hover:underline">
                          {doc.fileName}
                        </a>
                        <span className="text-[10px] text-slate-400 font-mono block">{(doc.fileSize / 1024).toFixed(1)} KB</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Document Upload Form */}
              <form onSubmit={handleUploadDoc} className="p-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 space-y-2 text-xs">
                <input
                  type="file"
                  required
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full text-slate-500 text-xs file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-800 hover:file:bg-teal-100"
                />
                <button
                  type="submit"
                  disabled={!uploadFile || isUploadingDoc}
                  className="w-full py-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold transition cursor-pointer disabled:opacity-50"
                >
                  {isUploadingDoc ? 'Uploading...' : 'Upload Supporting Verification Document'}
                </button>
              </form>
            </div>

            {/* AUDIT HISTORY TIMELINE */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                <History className="w-4 h-4 text-teal-700" /> Audit History Timeline
              </h3>

              <div className="space-y-3 border-l-2 border-slate-200 pl-4 font-sans text-xs">
                {selectedBeneficiary.history?.map((h) => (
                  <div key={h.id} className="relative">
                    <span className="w-2 h-2 rounded-full bg-teal-700 absolute -left-[21px] top-1.5" />
                    <h4 className="font-bold text-slate-900">{h.title}</h4>
                    <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">{h.description}</p>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                      {new Date(h.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT BENEFICIARY MODAL */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs font-sans animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-teal-700" /> {isAddModalOpen ? 'Add Beneficiary Record' : 'Edit Beneficiary Details'}
              </h3>
              <button onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={isAddModalOpen ? handleCreateSubmit : handleEditSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Sita Devi"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Gender</label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-700"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Age (Years)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={120}
                    value={formAge}
                    onChange={(e) => setFormAge(parseInt(e.target.value) || 20)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:border-teal-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-700"
                  >
                    <option value="Active">Active</option>
                    <option value="Under Audit">Under Audit</option>
                    <option value="Graduated">Graduated</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">District</label>
                  <input
                    type="text"
                    required
                    value={formDistrict}
                    onChange={(e) => setFormDistrict(e.target.value)}
                    placeholder="Central Delhi"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={formState}
                    onChange={(e) => setFormState(e.target.value)}
                    placeholder="Delhi"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-700"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold cursor-pointer"
                >
                  {isAddModalOpen ? 'Save Beneficiary' : 'Update Beneficiary'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && targetBeneficiary && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-sm w-full p-6 shadow-2xl space-y-4 text-xs font-sans animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-rose-700 text-sm flex items-center gap-1.5">
                <Trash2 className="w-4 h-4 text-rose-700" /> Confirm Deletion
              </h3>
              <button onClick={() => setIsDeleteModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete beneficiary record <strong>{targetBeneficiary.name}</strong> ({targetBeneficiary.beneficiaryCode})?
            </p>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold cursor-pointer"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
