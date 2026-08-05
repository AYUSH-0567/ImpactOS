import React, { useState, useEffect } from 'react';
import { Volunteer, VolunteerCertificate, VolunteerAssignment } from '../../types';
import { dataService } from '../../services/dataService';
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  Award, 
  Star, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Calendar, 
  BookOpen, 
  Mail, 
  Phone, 
  MapPin, 
  Edit3, 
  Trash2, 
  X,
  FileCheck,
  Zap
} from 'lucide-react';

export const VolunteerAnalytics: React.FC = () => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSkill, setFilterSkill] = useState('All');
  const [filterCity, setFilterCity] = useState('All Cities');
  const [filterAvailability, setFilterAvailability] = useState('All');

  // Selected Profile Drawer
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);

  // Modals
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [targetVolunteer, setTargetVolunteer] = useState<Volunteer | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formState, setFormState] = useState('Delhi');
  const [formCity, setFormCity] = useState('New Delhi');
  const [formSkill, setFormSkill] = useState('Digital STEM Pedagogy');
  const [formAvailability, setFormAvailability] = useState('Weekends');
  const [formHours, setFormHours] = useState(0);
  const [formRating, setFormRating] = useState(5.0);

  // Assignment & Certificate Forms
  const [assignProgramName, setAssignProgramName] = useState('Pratham Secondary Education');
  const [assignRole, setAssignRole] = useState('Field Mentor');
  const [certTitle, setCertTitle] = useState('Certificate of Appreciation');
  const [certProgramName, setCertProgramName] = useState('Gurugram Rural STEM Workshop');
  const [certHours, setCertHours] = useState(50);

  const fetchVolunteersData = async () => {
    setIsLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
      
      const query = new URLSearchParams();
      if (searchQuery) query.append('search', searchQuery);
      if (filterSkill !== 'All') query.append('skill', filterSkill);
      if (filterCity !== 'All Cities') query.append('city', filterCity);
      if (filterAvailability !== 'All') query.append('availability', filterAvailability);

      const res = await fetch(`${baseUrl}/volunteers?${query.toString()}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setVolunteers(data);
        if (selectedVolunteer) {
          const refreshed = data.find((v: Volunteer) => v.id === selectedVolunteer.id);
          if (refreshed) setSelectedVolunteer(refreshed);
        }
      }

      const summaryRes = await fetch(`${baseUrl}/volunteers/analytics/summary`, { credentials: 'include' });
      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setSummary(summaryData);
      }

    } catch (err) {
      console.error('Error fetching volunteers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteersData();
  }, [searchQuery, filterSkill, filterCity, filterAvailability]);

  // Register Volunteer
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
      const res = await fetch(`${baseUrl}/volunteers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          phone: formPhone,
          state: formState,
          city: formCity,
          skill: formSkill,
          availability: formAvailability,
          hoursLogged: formHours,
          rating: formRating
        })
      });

      if (res.ok) {
        setIsRegisterModalOpen(false);
        resetForm();
        fetchVolunteersData();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Edit Volunteer
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetVolunteer) return;

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
      const res = await fetch(`${baseUrl}/volunteers/${targetVolunteer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          phone: formPhone,
          state: formState,
          city: formCity,
          skill: formSkill,
          availability: formAvailability,
          hoursLogged: formHours,
          rating: formRating
        })
      });

      if (res.ok) {
        setIsEditModalOpen(false);
        resetForm();
        fetchVolunteersData();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Assign to Program
  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVolunteer) return;

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
      await fetch(`${baseUrl}/volunteers/${selectedVolunteer.id}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ programName: assignProgramName, role: assignRole })
      });

      fetchVolunteersData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Issue Certificate
  const handleIssueCertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVolunteer) return;

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
      await fetch(`${baseUrl}/volunteers/${selectedVolunteer.id}/certificates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: certTitle, programName: certProgramName, hoursRecognized: certHours })
      });

      fetchVolunteersData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Delete Volunteer
  const handleDeleteVolunteer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this volunteer record?')) return;
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
      await fetch(`${baseUrl}/volunteers/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (selectedVolunteer?.id === id) setSelectedVolunteer(null);
      fetchVolunteersData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormState('Delhi');
    setFormCity('New Delhi');
    setFormSkill('Digital STEM Pedagogy');
    setFormAvailability('Weekends');
    setFormHours(0);
    setFormRating(5.0);
  };

  const openEditModal = (v: Volunteer) => {
    setTargetVolunteer(v);
    setFormName(v.name);
    setFormEmail(v.email);
    setFormPhone(v.phone || '');
    setFormState(v.state);
    setFormCity(v.city);
    setFormSkill(v.skill);
    setFormAvailability(v.availability || 'Weekends');
    setFormHours(v.hoursLogged);
    setFormRating(v.rating);
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-700" /> Multi-Tenant Volunteer Registry
            </span>
            <span className="text-xs text-slate-400 font-mono">Skill Mapping & Certificates</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">Volunteer Management System</h1>
          <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
            Register field volunteers, map specialized skills, track program assignments, log hours, evaluate performance ratings, and issue service certificates.
          </p>
        </div>

        <button
          onClick={() => { resetForm(); setIsRegisterModalOpen(true); }}
          className="px-3.5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs shadow-2xs transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" /> Onboard Volunteer
        </button>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-semibold uppercase block">REGISTERED VOLUNTEERS</span>
          <span className="font-bold text-slate-900 text-base mt-0.5 block">{summary?.totalVolunteers || volunteers.length} Active</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-semibold uppercase block">HOURS LOGGED</span>
          <span className="font-bold text-teal-800 text-base mt-0.5 block">{summary?.totalHoursLogged?.toLocaleString() || 0} Hours</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-semibold uppercase block">AVG PERFORMANCE</span>
          <span className="font-bold text-emerald-700 text-base mt-0.5 block flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" /> {summary?.averageRating?.toFixed(1) || '5.0'} / 5.0
          </span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-semibold uppercase block">PRIMARY SKILL</span>
          <span className="font-bold text-slate-800 text-xs mt-1 block truncate">
            {summary?.skillDistribution?.[0]?.skill || 'STEM Pedagogy'}
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
            placeholder="Search volunteers by name, skill, email, or city..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:border-teal-700"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={filterAvailability}
            onChange={(e) => setFilterAvailability(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold focus:outline-none"
          >
            <option value="All">All Availabilities</option>
            <option value="Weekends">Weekends</option>
            <option value="Weekdays">Weekdays</option>
            <option value="Full-Time">Full-Time</option>
            <option value="Remote">Remote</option>
          </select>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Volunteer Code</th>
                <th className="py-3 px-4">Volunteer Name & Email</th>
                <th className="py-3 px-4">Specialized Skill</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Availability</th>
                <th className="py-3 px-4">Hours Logged</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Loading volunteer records from database...
                  </td>
                </tr>
              ) : volunteers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No volunteers match the query filters.
                  </td>
                </tr>
              ) : (
                volunteers.map((v) => (
                  <tr
                    key={v.id}
                    onClick={() => setSelectedVolunteer(v)}
                    className="hover:bg-slate-50/80 transition cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-teal-800">{v.volunteerCode || 'VOL-2026-DL'}</td>
                    <td className="py-3 px-4">
                      <div className="font-extrabold text-slate-900 group-hover:text-teal-800 transition">{v.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{v.email}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{v.skill}</td>
                    <td className="py-3 px-4 text-slate-700">{v.city}, {v.state}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {v.availability || 'Weekends'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-teal-800">{v.hoursLogged} hrs</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">★ {v.rating.toFixed(1)}</td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(v)}
                          className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteVolunteer(v.id)}
                          className="p-1.5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-700 transition cursor-pointer"
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

      {/* VOLUNTEER PROFILE DRAWER */}
      {selectedVolunteer && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl overflow-y-auto p-6 space-y-6 animate-in slide-in-from-right duration-200 font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold font-mono uppercase bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded">
                  {selectedVolunteer.volunteerCode || 'VOL-2026'}
                </span>
                <h2 className="text-lg font-extrabold text-slate-900 mt-1">{selectedVolunteer.name}</h2>
              </div>
              <button onClick={() => setSelectedVolunteer(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Metrics */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">PRIMARY SKILL</span>
                <span className="font-semibold text-slate-900">{selectedVolunteer.skill}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">AVAILABILITY</span>
                <span className="font-semibold text-slate-900">{selectedVolunteer.availability || 'Weekends'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">HOURS LOGGED</span>
                <span className="font-mono font-bold text-teal-800">{selectedVolunteer.hoursLogged} Hours</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">PERFORMANCE RATING</span>
                <span className="font-mono font-bold text-emerald-700">★ {selectedVolunteer.rating.toFixed(1)} / 5.0</span>
              </div>
            </div>

            {/* PROGRAM ASSIGNMENTS */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                <BookOpen className="w-4 h-4 text-teal-700" /> Connected Program Assignments
              </h3>

              <div className="space-y-1.5">
                {selectedVolunteer.assignments?.map((a) => (
                  <div key={a.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="font-bold text-slate-900 block">{a.programName}</span>
                      <span className="text-[10px] text-slate-400">{a.role}</span>
                    </div>
                    <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                      {a.status}
                    </span>
                  </div>
                ))}
              </div>

              {/* Assign Form */}
              <form onSubmit={handleAssignSubmit} className="flex gap-2 text-xs">
                <input
                  type="text"
                  required
                  value={assignProgramName}
                  onChange={(e) => setAssignProgramName(e.target.value)}
                  placeholder="Program Name..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-700"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-teal-800 text-white font-bold cursor-pointer"
                >
                  + Assign Program
                </button>
              </form>
            </div>

            {/* ISSUED CERTIFICATES */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                <Award className="w-4 h-4 text-teal-700" /> Issued Service Certificates
              </h3>

              <div className="space-y-2">
                {selectedVolunteer.certificates?.map((c) => (
                  <div key={c.id} className="p-3 rounded-xl bg-teal-50/70 border border-teal-200 space-y-1 text-xs font-mono">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-teal-950">{c.title}</span>
                      <span className="text-[10px] text-teal-700">{c.certificateNo}</span>
                    </div>
                    <p className="text-teal-800 text-[11px]">Program: {c.programName} ({c.hoursRecognized} hrs recognized)</p>
                  </div>
                ))}
              </div>

              {/* Issue Certificate Form */}
              <form onSubmit={handleIssueCertSubmit} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <span className="font-bold text-slate-800 block text-[11px]">Issue New Certificate of Appreciation</span>
                <input
                  type="text"
                  required
                  value={certTitle}
                  onChange={(e) => setCertTitle(e.target.value)}
                  placeholder="Certificate Title..."
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={certProgramName}
                    onChange={(e) => setCertProgramName(e.target.value)}
                    placeholder="Program / Event..."
                    className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none"
                  />
                  <input
                    type="number"
                    required
                    value={certHours}
                    onChange={(e) => setCertHours(parseFloat(e.target.value) || 0)}
                    placeholder="Hours..."
                    className="w-20 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold cursor-pointer"
                >
                  Generate & Issue Certificate
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* REGISTER / EDIT MODAL */}
      {(isRegisterModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4 text-xs font-sans animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-teal-700" /> {isRegisterModalOpen ? 'Onboard Field Volunteer' : 'Edit Volunteer Profile'}
              </h3>
              <button onClick={() => { setIsRegisterModalOpen(false); setIsEditModalOpen(false); }} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={isRegisterModalOpen ? handleRegisterSubmit : handleEditSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Aarav Sharma"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="aarav@gmail.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:border-teal-700"
                  />
                </div>

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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder="Gurugram"
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
                    placeholder="Haryana"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Specialized Skill</label>
                  <input
                    type="text"
                    required
                    value={formSkill}
                    onChange={(e) => setFormSkill(e.target.value)}
                    placeholder="STEM Pedagogy"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Availability Schedule</label>
                  <select
                    value={formAvailability}
                    onChange={(e) => setFormAvailability(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-700"
                  >
                    <option value="Weekends">Weekends</option>
                    <option value="Weekdays">Weekdays</option>
                    <option value="Full-Time">Full-Time</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setIsRegisterModalOpen(false); setIsEditModalOpen(false); }}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold cursor-pointer"
                >
                  {isRegisterModalOpen ? 'Onboard Volunteer' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
