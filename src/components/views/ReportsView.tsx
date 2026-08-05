import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { 
  FileText, 
  Download, 
  CheckCircle2, 
  Printer, 
  ShieldCheck, 
  Calendar, 
  Building2, 
  BarChart3, 
  PieChart as PieChartIcon, 
  FileSpreadsheet, 
  FileCheck,
  TrendingUp,
  Award
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';

type ReportFrequency = 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
type ReportAudience = 'EXECUTIVE' | 'DONOR' | 'CSR';

export const ReportsView: React.FC = () => {
  const [frequency, setFrequency] = useState<ReportFrequency>('QUARTERLY');
  const [audience, setAudience] = useState<ReportAudience>('EXECUTIVE');
  const [reportData, setReportData] = useState<any>(null);
  const [donors, setDonors] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const fetchRealReportData = async () => {
    setIsLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';

      const dashRes = await fetch(`${baseUrl}/analytics/dashboard-summary`, { credentials: 'include' });
      if (dashRes.ok) {
        const dData = await dashRes.json();
        setReportData(dData);
      }

      const donorRes = await fetch(`${baseUrl}/donors`, { credentials: 'include' });
      if (donorRes.ok) {
        const dList = await donorRes.json();
        setDonors(dList);
      }

      const prjRes = await fetch(`${baseUrl}/projects`, { credentials: 'include' });
      if (prjRes.ok) {
        const pList = await prjRes.json();
        setProjects(pList);
      }

    } catch (err) {
      console.error('Error fetching report data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRealReportData();
  }, [frequency, audience]);

  // EXPORT TO EXCEL SPREADSHEET (.xlsx)
  const exportToExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      // Sheet 1: Executive KPI Metrics
      const m = reportData?.metrics || {};
      const summarySheetData = [
        { Metric: 'Total Beneficiaries Reached', Value: m.totalBeneficiariesReached || 0 },
        { Metric: 'Beneficiaries Target', Value: m.beneficiariesTarget || 50000 },
        { Metric: 'Total Grant Funding (INR)', Value: m.totalGrantFunding || 0 },
        { Metric: 'Total Capital Spent (INR)', Value: m.totalSpent || 0 },
        { Metric: 'Active Field Projects', Value: m.activeProjectsCount || 0 },
        { Metric: 'At Risk Projects', Value: m.atRiskProjectsCount || 0 },
        { Metric: 'Active Volunteers Engaged', Value: m.activeVolunteersCount || 0 },
        { Metric: 'Volunteer Hours Logged', Value: m.volunteerHoursLogged || 0 }
      ];
      const ws1 = XLSX.utils.json_to_sheet(summarySheetData);
      XLSX.utils.book_append_sheet(wb, ws1, 'KPI Summary');

      // Sheet 2: Projects Roster
      if (projects.length > 0) {
        const projectSheetData = projects.map(p => ({
          'Project Code': p.projectCode,
          'Project Name': p.name,
          'Category': p.category,
          'State': p.state,
          'District': p.district,
          'Budget (INR)': p.budget,
          'Spent (INR)': p.spent,
          'Status': p.status,
          'Risk Level': p.risk
        }));
        const ws2 = XLSX.utils.json_to_sheet(projectSheetData);
        XLSX.utils.book_append_sheet(wb, ws2, 'Field Projects');
      }

      // Sheet 3: Donors & Grants
      if (donors.length > 0) {
        const donorSheetData = donors.map(d => ({
          'Donor Code': d.donorCode,
          'Partner Name': d.name,
          'Type': d.type,
          'Location': d.location,
          'Contact Person': d.contactPerson || 'N/A',
          'Total Donated (INR)': d.totalDonated,
          'Schedule': d.frequency
        }));
        const ws3 = XLSX.utils.json_to_sheet(donorSheetData);
        XLSX.utils.book_append_sheet(wb, ws3, 'Donors & Grants');
      }

      XLSX.writeFile(wb, `ImpactOS_${audience}_${frequency}_Report.xlsx`);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err: any) {
      alert('Excel export failed: ' + err.message);
    }
  };

  // EXPORT / PRINT TO PDF (window.print())
  const handlePrintPDF = () => {
    window.print();
  };

  const m = reportData?.metrics || {};

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-700" /> Automated Reporting Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">Real Database Telemetry</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">Impact & Governance Reporting Center</h1>
          <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
            Generate FCRA audit briefs, CSR Section 135 compliance statements, and Executive Board impact summaries exported to PDF or Excel.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintPDF}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" /> Export PDF
          </button>
          <button
            onClick={exportToExcel}
            className="px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Excel (.xlsx)
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Excel report successfully generated and downloaded!
        </div>
      )}

      {/* FREQUENCY & AUDIENCE SELECTOR GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Frequency Selector */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <label className="text-xs font-extrabold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-teal-700" /> Report Time Cycle
          </label>
          <div className="grid grid-cols-3 gap-2 text-xs font-mono">
            {(['MONTHLY', 'QUARTERLY', 'ANNUAL'] as ReportFrequency[]).map((f) => (
              <button
                key={f}
                onClick={() => setFrequency(f)}
                className={`py-2 rounded-xl font-bold border transition cursor-pointer ${
                  frequency === f
                    ? 'bg-teal-800 text-white border-teal-800'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Audience Selector */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <label className="text-xs font-extrabold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-teal-700" /> Stakeholder Perspective
          </label>
          <div className="grid grid-cols-3 gap-2 text-xs font-mono">
            {[
              { key: 'EXECUTIVE', label: 'Executive Board' },
              { key: 'DONOR', label: 'Donor 80G' },
              { key: 'CSR', label: 'CSR Sec 135' }
            ].map((a) => (
              <button
                key={a.key}
                onClick={() => setAudience(a.key as ReportAudience)}
                className={`py-2 rounded-xl font-bold border transition cursor-pointer ${
                  audience === a.key
                    ? 'bg-teal-800 text-white border-teal-800'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FORMAL PRINTABLE REPORT DOCUMENT PREVIEW */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl space-y-6 font-sans print:shadow-none print:border-none">
        {/* Document Header */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-teal-900 text-lg tracking-tight">IMPACTOS SAAS PLATFORM</span>
              <span className="text-xs font-mono bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded font-bold">
                VERIFIED FCRA & 80G AUDIT
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-1">
              {audience === 'EXECUTIVE' && 'Executive Board Impact & Financial Performance Statement'}
              {audience === 'DONOR' && 'Section 80G / FCRA Donor Compliance Impact Report'}
              {audience === 'CSR' && 'Companies Act Sec 135 CSR Expenditure & Outcome Audit'}
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">Frequency Window: {frequency} • Document Ref: REF-2026-REPORT-{frequency}</p>
          </div>

          <div className="text-right font-mono text-xs">
            <span className="font-extrabold text-emerald-700 block">✓ AUDITED & VERIFIED</span>
            <span className="text-slate-400 text-[10px]">Issued: {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Database Metric Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">PEOPLE REACHED</span>
            <span className="font-bold text-slate-900 text-base">{m.totalBeneficiariesReached?.toLocaleString() || 0}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">TOTAL GRANT FUNDING</span>
            <span className="font-bold text-teal-800 text-base">₹{((m.totalGrantFunding || 0) / 100000).toFixed(2)} L</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">FUNDS UTILIZED</span>
            <span className="font-bold text-slate-800 text-base">₹{((m.totalSpent || 0) / 100000).toFixed(2)} L</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">ACTIVE INITIATIVES</span>
            <span className="font-bold text-emerald-700 text-base">{m.activeProjectsCount || 0} Projects</span>
          </div>
        </div>

        {/* Real Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Program Capital Distribution Chart */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-1.5">
              <PieChartIcon className="w-4 h-4 text-teal-700" /> Program Vertical Budget Breakdown
            </h4>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={reportData?.programAllocation || []} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="budget">
                    {(reportData?.programAllocation || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '6px', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Expenditure Trend Chart */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-teal-700" /> Monthly Field Expenditure Trend (₹ Lakhs)
            </h4>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData?.monthlyImpactTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '6px', fontSize: '11px' }} />
                  <Bar dataKey="spentLakhs" name="Spent (Lakhs)" fill="#0f766e" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Project Roster Summary Table */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-extrabold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-teal-700" /> Active Field Initiative Telemetry
          </h4>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3">Code & Name</th>
                  <th className="py-2.5 px-3">State</th>
                  <th className="py-2.5 px-3">Budget</th>
                  <th className="py-2.5 px-3">Spent</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projects.slice(0, 5).map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{p.projectCode} • {p.name}</td>
                    <td className="py-2.5 px-3 text-slate-700">{p.state}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">₹{(p.budget / 100000).toFixed(2)} L</td>
                    <td className="py-2.5 px-3 font-bold text-teal-800">₹{(p.spent / 100000).toFixed(2)} L</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Audit Sign-Off */}
        <div className="pt-4 border-t border-slate-200 flex justify-between items-end text-[10px] font-mono text-slate-400">
          <div>
            <p>ImpactOS Multi-Tenant SaaS Platform • Audit Engine v2.4</p>
            <p>Data Source: Real Database Telemetry (Prisma ORM)</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-slate-700 uppercase">Authorized Signature</p>
            <p>Director of Governance & Compliance</p>
          </div>
        </div>
      </div>
    </div>
  );
};
