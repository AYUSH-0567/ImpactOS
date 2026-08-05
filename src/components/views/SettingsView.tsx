import React, { useState, useEffect } from 'react';
import { dataService } from '../../services/dataService';
import { AuthService } from '../../services/authService';
import { 
  Building2, 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Mail, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Copy, 
  Check, 
  FileCheck, 
  Globe, 
  Clock,
  X
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [orgProfile, setOrgProfile] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Edit Org Form State
  const [isEditingOrg, setIsEditingOrg] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [tax80GId, setTax80GId] = useState('');
  const [headquarters, setHeadquarters] = useState('');

  // Invite Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('PROGRAM_MANAGER');
  const [generatedInviteToken, setGeneratedInviteToken] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const activeUserSession = AuthService.getSession();
  const isAdminOrDirector = AuthService.hasPermission('admin:settings');

  const fetchOrgData = async () => {
    setIsLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';

      // Fetch Org Profile
      const profileRes = await fetch(`${baseUrl}/organization/profile`, { credentials: 'include' });
      if (profileRes.ok) {
        const org = await profileRes.json();
        setOrgProfile(org);
        setOrgName(org.name);
        setTax80GId(org.tax80GId || '');
        setHeadquarters(org.headquarters);
      }

      // Fetch Members
      const membersRes = await fetch(`${baseUrl}/organization/members`, { credentials: 'include' });
      if (membersRes.ok) {
        const members = await membersRes.json();
        setTeamMembers(members);
      }

      // Fetch Invitations
      if (isAdminOrDirector) {
        const invitesRes = await fetch(`${baseUrl}/organization/invitations`, { credentials: 'include' });
        if (invitesRes.ok) {
          const invites = await invitesRes.json();
          setInvitations(invites);
        }
      }
    } catch (err) {
      console.error('Error loading organization data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgData();
  }, []);

  // Update Org Profile
  const handleUpdateOrgProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
      const res = await fetch(`${baseUrl}/organization/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: orgName, tax80GId, headquarters })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setNotification({ type: 'error', message: data.message || 'Failed to update profile.' });
      } else {
        setOrgProfile(data.organization);
        setIsEditingOrg(false);
        setNotification({ type: 'success', message: 'Organization profile updated successfully.' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  // Generate Member Invitation
  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
      const res = await fetch(`${baseUrl}/organization/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: inviteEmail, role: inviteRole })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setNotification({ type: 'error', message: data.message || 'Failed to generate invitation.' });
      } else {
        setGeneratedInviteToken(data.invitationToken);
        setNotification({ type: 'success', message: `Invitation token generated for ${inviteEmail}.` });
        fetchOrgData();
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  // Revoke Invitation
  const handleRevokeInvite = async (id: string) => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
      const res = await fetch(`${baseUrl}/organization/invitations/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        setNotification({ type: 'success', message: 'Invitation revoked.' });
        fetchOrgData();
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Title */}
      <div className="pb-3 border-b border-slate-200">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Building2 className="w-5 h-5 text-teal-700" /> Organization Profile & Team Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Multi-tenant organization parameters, FCRA identity, team member roles, and invitation token management.
        </p>
      </div>

      {notification && (
        <div className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
          notification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* ORGANIZATION PROFILE CARD */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 inline-flex items-center gap-1 font-mono">
              <ShieldCheck className="w-3 h-3 text-teal-700" /> Organization Tenant ID: {orgProfile?.id || activeUserSession?.user.organizationId}
            </span>
            <h2 className="text-base font-extrabold text-slate-900 mt-1">
              {orgProfile?.name || activeUserSession?.user.organizationName || 'ImpactOS NGO Foundation'}
            </h2>
          </div>

          {isAdminOrDirector && (
            <button
              onClick={() => setIsEditingOrg(!isEditingOrg)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              {isEditingOrg ? 'Cancel' : 'Edit Profile'}
            </button>
          )}
        </div>

        {isEditingOrg ? (
          <form onSubmit={handleUpdateOrgProfile} className="space-y-3 text-xs max-w-lg">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Organization Name</label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">80G Tax ID</label>
                <input
                  type="text"
                  value={tax80GId}
                  onChange={(e) => setTax80GId(e.target.value)}
                  placeholder="80G-DELHI-2024-9982"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:border-teal-700"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Headquarters</label>
                <input
                  type="text"
                  required
                  value={headquarters}
                  onChange={(e) => setHeadquarters(e.target.value)}
                  placeholder="New Delhi, India"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-700"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold cursor-pointer"
              >
                Save Profile
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block font-mono">FCRA REGISTRATION ID</span>
              <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">{orgProfile?.fcraRegId || 'FCRA-2026-IND-01'}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block font-mono">80G TAX EXEMPTION</span>
              <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">{orgProfile?.tax80GId || '80G-DELHI-2024-9982'}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block font-mono">HEADQUARTERS</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">{orgProfile?.headquarters || 'New Delhi, India'}</span>
            </div>
          </div>
        )}
      </div>

      {/* TEAM MEMBERS ROSTER */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-700" /> Organization Team Members ({teamMembers.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Authenticated users belonging strictly to your organization tenant.</p>
          </div>

          {isAdminOrDirector && (
            <button
              onClick={() => { setGeneratedInviteToken(null); setIsInviteModalOpen(true); }}
              className="px-3.5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" /> Invite Member
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Member Name</th>
                <th className="py-2.5 px-3">Email Address</th>
                <th className="py-2.5 px-3">Assigned Role</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teamMembers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-2.5 px-3 font-bold text-slate-900">{user.name}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{user.email}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                      {user.role}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ACTIVE INVITATIONS TABLE */}
      {isAdminOrDirector && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" /> Pending Organization Invitations ({invitations.length})
            </h3>
          </div>

          {invitations.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No pending team invitations.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Invited Email</th>
                    <th className="py-2.5 px-3">Assigned Role</th>
                    <th className="py-2.5 px-3">Invitation Token</th>
                    <th className="py-2.5 px-3">Expires At</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {invitations.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{inv.email}</td>
                      <td className="py-2.5 px-3 text-slate-700">{inv.role}</td>
                      <td className="py-2.5 px-3 text-teal-800 font-bold">{inv.token}</td>
                      <td className="py-2.5 px-3 text-slate-500">{new Date(inv.expiresAt).toLocaleDateString()}</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleRevokeInvite(inv.id)}
                          className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-700 transition cursor-pointer"
                          title="Revoke Invite"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* INVITE MEMBER MODAL */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4 text-xs font-sans animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-teal-700" /> Generate Team Invitation Token
              </h3>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {generatedInviteToken ? (
              <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 space-y-3 font-mono">
                <span className="text-[10px] uppercase font-bold text-teal-800 block">Invitation Token Generated</span>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-teal-300 font-bold text-teal-950">
                  <span>{generatedInviteToken}</span>
                  <button
                    onClick={() => copyToClipboard(generatedInviteToken)}
                    className="p-1 rounded hover:bg-teal-100 text-teal-700 cursor-pointer"
                  >
                    {copiedToken ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-teal-800 font-sans leading-relaxed">
                  Share this token with <strong>{inviteEmail}</strong>. They can paste this token on the registration page to join your organization as <strong>{inviteRole}</strong>.
                </p>
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => { setGeneratedInviteToken(null); setIsInviteModalOpen(false); }}
                    className="px-4 py-1.5 rounded-xl bg-teal-800 text-white font-bold cursor-pointer font-sans"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateInvite} className="space-y-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Invited User Email Address</label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="teammate@organization.org"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Assigned Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-700"
                  >
                    <option value="ADMIN">Admin (Full Control)</option>
                    <option value="DIRECTOR">Executive Director</option>
                    <option value="FINANCE_LEAD">Finance Lead</option>
                    <option value="PROGRAM_MANAGER">Program Manager</option>
                    <option value="VOLUNTEER_MANAGER">Volunteer Manager</option>
                    <option value="DATA_ANALYST">Data Analyst (Read-Only)</option>
                    <option value="VIEWER">Viewer (Read-Only)</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold cursor-pointer"
                  >
                    Generate Invite Token
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
