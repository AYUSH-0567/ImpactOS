import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Building2, 
  Users, 
  Database, 
  BrainCircuit, 
  FileText, 
  Lock, 
  BookOpen, 
  Calendar, 
  Mail, 
  Phone, 
  MapPin, 
  Sparkles, 
  DollarSign, 
  Globe2, 
  Check, 
  X,
  ChevronRight,
  Menu
} from 'lucide-react';

interface PublicWebsiteProps {
  onLaunchApp: () => void;
}

type PublicPage = 'HOME' | 'FEATURES' | 'SOLUTIONS' | 'PRICING' | 'ABOUT' | 'CONTACT' | 'SECURITY' | 'DOCUMENTATION' | 'BOOK_DEMO';

export const PublicWebsite: React.FC<PublicWebsiteProps> = ({ onLaunchApp }) => {
  const [currentPage, setCurrentPage] = useState<PublicPage>('HOME');
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Demo Booking Form State
  const [demoOrgName, setDemoOrgName] = useState('');
  const [demoEmail, setDemoEmail] = useState('');
  const [demoPhone, setDemoPhone] = useState('');
  const [demoDate, setDemoDate] = useState('');
  const [demoSubmitted, setDemoSubmitted] = useState(false);

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDemoSubmitted(true);
    setTimeout(() => {
      setDemoSubmitted(false);
      setIsDemoModalOpen(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-teal-500 selection:text-white flex flex-col">
      {/* PUBLIC NAVBAR */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-400 flex items-center justify-center text-white font-extrabold text-base shadow-lg shadow-teal-500/20">
            I
          </div>
          <span className="font-extrabold text-lg tracking-tight text-white">
            IMPACT<span className="text-teal-400">OS</span>
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-300">
          {[
            { page: 'HOME', label: 'Home' },
            { page: 'FEATURES', label: 'Features' },
            { page: 'SOLUTIONS', label: 'Solutions' },
            { page: 'PRICING', label: 'Pricing' },
            { page: 'ABOUT', label: 'About' },
            { page: 'SECURITY', label: 'Security' },
            { page: 'DOCUMENTATION', label: 'Docs' },
            { page: 'CONTACT', label: 'Contact' }
          ].map((item) => (
            <button
              key={item.page}
              onClick={() => setCurrentPage(item.page as PublicPage)}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                currentPage === item.page
                  ? 'bg-teal-950/80 text-teal-300 border border-teal-800/50 font-bold'
                  : 'hover:text-white hover:bg-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsDemoModalOpen(true)}
            className="hidden sm:inline-flex px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
          >
            Book Demo
          </button>
          <button
            onClick={onLaunchApp}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white text-xs font-extrabold shadow-lg shadow-teal-600/20 transition cursor-pointer flex items-center gap-1.5"
          >
            Launch SaaS App <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* MAIN PUBLIC PAGE CONTENT */}
      <main className="flex-1">
        {/* PAGE 1: HOME */}
        {currentPage === 'HOME' && (
          <div className="space-y-24 py-16 px-4 lg:px-8 max-w-7xl mx-auto">
            {/* HERO SECTION */}
            <div className="text-center space-y-6 max-w-4xl mx-auto pt-6">
              <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase bg-teal-950/80 text-teal-300 border border-teal-800/60 inline-flex items-center gap-1.5 shadow-inner">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" /> Enterprise Multi-Tenant NGO SaaS Platform
              </span>

              <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
                The Operating System for <br />
                <span className="bg-gradient-to-r from-teal-400 via-teal-200 to-emerald-400 bg-clip-text text-transparent">
                  Indian NGOs & CSR Foundations
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Empower your organization with multi-tenant data isolation, 80G & FCRA compliance automation, automated AI impact analytics, and flexible data ingestion.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={onLaunchApp}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white text-sm font-extrabold shadow-xl shadow-teal-600/30 transition cursor-pointer flex items-center gap-2"
                >
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsDemoModalOpen(true)}
                  className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-sm font-bold transition cursor-pointer flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-teal-400" /> Book Enterprise Demo
                </button>
              </div>
            </div>

            {/* METRICS TICKER */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm text-center font-mono">
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold text-white">500,000+</span>
                <span className="text-xs text-slate-400 block mt-1">Beneficiaries Tracked</span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold text-teal-400">₹120+ Cr</span>
                <span className="text-xs text-slate-400 block mt-1">Grant Capital Managed</span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">100%</span>
                <span className="text-xs text-slate-400 block mt-1">FCRA & 80G Compliant</span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold text-sky-400">50ms</span>
                <span className="text-xs text-slate-400 block mt-1">Sub-Second Analytics</span>
              </div>
            </div>
          </div>
        )}

        {/* PAGE 2: FEATURES */}
        {currentPage === 'FEATURES' && (
          <div className="py-16 px-4 lg:px-8 max-w-7xl mx-auto space-y-12">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-extrabold text-white">Platform Feature Matrix</h2>
              <p className="text-xs text-slate-400 max-w-xl mx-auto">
                Purpose-built modules for NGO operations, field logistics, donor relations, and governance compliance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: ShieldCheck, title: 'Multi-Tenant Data Isolation', desc: 'Complete server-side organization isolation ensuring Organization A never accesses Organization B data.' },
                { icon: Users, title: 'Beneficiary Management', desc: 'Track profiles, verification documents, program enrollments, attendance, and audit history timelines.' },
                { icon: Database, title: 'Flexible 8-Stage Data Ingestion', desc: 'Import CSV/Excel files with pre-ingestion validation, duplicate detection, and custom column mapping.' },
                { icon: BrainCircuit, title: 'Automated AI Impact Analyst', desc: 'Zero-hallucination statistical anomaly detector for duplicates, budget burns, and attendance drops.' },
                { icon: Building2, title: 'Donor & CSR Management', desc: 'Track corporate grants, Section 135 MOUs, recurring donation schedules, and 80G tax certificates.' },
                { icon: FileText, title: 'Automated Compliance Reporting', desc: 'Generate PDF & Excel audit briefs for Executive Board, Donors, and CSR regulators.' }
              ].map((f, i) => (
                <div key={i} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 hover:border-teal-500/50 transition">
                  <f.icon className="w-8 h-8 text-teal-400" />
                  <h3 className="text-base font-extrabold text-white">{f.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PAGE 3: SOLUTIONS */}
        {currentPage === 'SOLUTIONS' && (
          <div className="py-16 px-4 lg:px-8 max-w-7xl mx-auto space-y-12">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-extrabold text-white">Solutions for Every Social Impact Leader</h2>
              <p className="text-xs text-slate-400 max-w-xl mx-auto">
                Tailored workflows for field NGOs, corporate CSR foundations, and government funding agencies.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <Building2 className="w-8 h-8 text-teal-400" />
                <h3 className="text-lg font-bold text-white">For CSR Corporate Foundations</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Comply with Section 135 of the Indian Companies Act. Track grant disbursements, verify beneficiary outcomes, and download audited annual reports.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <Users className="w-8 h-8 text-sky-400" />
                <h3 className="text-lg font-bold text-white">For Field Execution NGOs</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Manage field projects, track volunteer mobilization, record offline session attendance, and ingest beneficiary spreadsheets.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* PAGE 4: PRICING */}
        {currentPage === 'PRICING' && (
          <div className="py-16 px-4 lg:px-8 max-w-7xl mx-auto space-y-12">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-extrabold text-white">Simple, Transparent Tiered Pricing</h2>
              <p className="text-xs text-slate-400 max-w-xl mx-auto">
                Scalable plans tailored to small community NGOs and large multi-state social impact foundations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <h3 className="text-base font-bold text-white">Starter NGO</h3>
                <div className="font-mono text-2xl font-black text-white">Free <span className="text-xs text-slate-500 font-normal">/ month</span></div>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-400" /> Up to 1,000 Beneficiaries</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-400" /> 3 Team Users</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-400" /> Standard CSV Data Import</li>
                </ul>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-b from-teal-950/80 to-slate-900 border border-teal-500/50 space-y-4 shadow-xl">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-teal-800 text-white">MOST POPULAR</span>
                <h3 className="text-base font-bold text-white">Growth Foundation</h3>
                <div className="font-mono text-2xl font-black text-white">₹9,999 <span className="text-xs text-slate-500 font-normal">/ month</span></div>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-400" /> Up to 50,000 Beneficiaries</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-400" /> Unlimited Team Users</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-400" /> AI Impact Analyst Engine</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-400" /> Section 80G & FCRA Automated Reports</li>
                </ul>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <h3 className="text-base font-bold text-white">Enterprise Multi-Tenant</h3>
                <div className="font-mono text-2xl font-black text-white">Custom <span className="text-xs text-slate-500 font-normal">/ annual</span></div>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-400" /> Unlimited Beneficiaries</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-400" /> Private Database Instance</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-400" /> Dedicated Compliance Auditor Support</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* PAGE 5: ABOUT */}
        {currentPage === 'ABOUT' && (
          <div className="py-16 px-4 lg:px-8 max-w-4xl mx-auto space-y-6 text-center">
            <h2 className="text-3xl font-extrabold text-white">About ImpactOS</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              ImpactOS was engineered to bridge the digital gap for non-governmental organizations in India. Built with multi-tenant data isolation, FCRA audit compliance, and statistical anomaly detection, ImpactOS helps social impact leaders verify every rupee deployed and every life transformed.
            </p>
          </div>
        )}

        {/* PAGE 6: SECURITY */}
        {currentPage === 'SECURITY' && (
          <div className="py-16 px-4 lg:px-8 max-w-4xl mx-auto space-y-6 font-sans">
            <h2 className="text-3xl font-extrabold text-white text-center">Enterprise Security & Compliance</h2>
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 text-xs text-slate-300">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-white text-sm">Multi-Tenant Tenant Isolation</h3>
                  <p className="text-slate-400 mt-1 leading-relaxed">Server middleware extracts organization IDs strictly from HttpOnly JWT cookies. IDOR direct database query tampering is 100% blocked.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PAGE 7: DOCUMENTATION */}
        {currentPage === 'DOCUMENTATION' && (
          <div className="py-16 px-4 lg:px-8 max-w-4xl mx-auto space-y-6 font-mono text-xs">
            <h2 className="text-3xl font-extrabold text-white font-sans text-center">Developer & API Documentation</h2>
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <p className="text-teal-400 font-bold">GET /api/v1/analytics/dashboard-summary</p>
              <p className="text-slate-400">Returns live calculated KPI metrics and state impact distributions for session organization.</p>
            </div>
          </div>
        )}

        {/* PAGE 8: CONTACT */}
        {currentPage === 'CONTACT' && (
          <div className="py-16 px-4 lg:px-8 max-w-xl mx-auto space-y-6 font-sans">
            <h2 className="text-3xl font-extrabold text-white text-center">Contact ImpactOS Team</h2>
            <form onSubmit={(e) => { e.preventDefault(); alert('Message sent! Our team will contact you.'); }} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Full Name</label>
                <input type="text" required placeholder="Aarav Sharma" className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-teal-500" />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Organization Email</label>
                <input type="email" required placeholder="aarav@ngo.org" className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-teal-500" />
              </div>
              <button type="submit" className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold cursor-pointer">
                Send Message
              </button>
            </form>
          </div>
        )}
      </main>

      {/* BOOK DEMO MODAL */}
      {isDemoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs font-sans animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-teal-400" /> Book Product Demo
              </h3>
              <button onClick={() => setIsDemoModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {demoSubmitted ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-white text-sm">Demo Request Confirmed!</h4>
                <p className="text-slate-400">Our solution team will reach out to schedule your walkthrough.</p>
              </div>
            ) : (
              <form onSubmit={handleDemoSubmit} className="space-y-3">
                <div>
                  <label className="block text-slate-300 mb-1">Organization Name</label>
                  <input type="text" required value={demoOrgName} onChange={(e) => setDemoOrgName(e.target.value)} placeholder="Pratham Education Foundation" className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Work Email</label>
                  <input type="email" required value={demoEmail} onChange={(e) => setDemoEmail(e.target.value)} placeholder="lead@ngo.org" className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none" />
                </div>
                <button type="submit" className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold cursor-pointer">
                  Schedule Demo Walkthrough
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 px-4 lg:px-8 text-xs text-slate-500 font-sans">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 ImpactOS Inc. All rights reserved. Multi-Tenant Enterprise Platform for Indian NGOs.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentPage('SECURITY')} className="hover:text-slate-300">Security</button>
            <button onClick={() => setCurrentPage('DOCUMENTATION')} className="hover:text-slate-300">Docs</button>
            <button onClick={() => setCurrentPage('CONTACT')} className="hover:text-slate-300">Contact</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
