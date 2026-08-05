import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  PieChart, 
  BarChart3, 
  Calendar, 
  ShieldCheck, 
  Plus, 
  Receipt, 
  ArrowUpRight, 
  AlertCircle, 
  CheckCircle2, 
  Building2, 
  Search, 
  Trash2, 
  X,
  Lock,
  Wallet
} from 'lucide-react';
import { AuthService } from '../../services/authService';

export const FinanceAnalytics: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [budgetVsActual, setBudgetVsActual] = useState<any[]>([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState<any[]>([]);
  const [cashFlow, setCashFlow] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasPermission, setHasPermission] = useState<boolean>(true);

  // Modal State
  const [isLogExpenseOpen, setIsLogExpenseOpen] = useState(false);
  const [expCategory, setExpCategory] = useState('Program Execution');
  const [expAmount, setExpAmount] = useState(250000);
  const [expProjectId, setExpProjectId] = useState('');
  const [expVendor, setExpVendor] = useState('');
  const [expReceiptNo, setExpReceiptNo] = useState('');

  const fetchFinanceData = async () => {
    setIsLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';

      const summaryRes = await fetch(`${baseUrl}/finance/summary`, { credentials: 'include' });
      if (summaryRes.status === 403 || summaryRes.status === 401) {
        setHasPermission(false);
        setIsLoading(false);
        return;
      }

      if (summaryRes.ok) {
        const sData = await summaryRes.json();
        setSummary(sData);
      }

      const bvaRes = await fetch(`${baseUrl}/finance/budget-vs-actual`, { credentials: 'include' });
      if (bvaRes.ok) {
        const bvaData = await bvaRes.json();
        setBudgetVsActual(bvaData);
      }

      const bdRes = await fetch(`${baseUrl}/finance/expense-breakdown`, { credentials: 'include' });
      if (bdRes.ok) {
        const bdData = await bdRes.json();
        setExpenseBreakdown(bdData);
      }

      const cfRes = await fetch(`${baseUrl}/finance/cash-flow`, { credentials: 'include' });
      if (cfRes.ok) {
        const cfData = await cfRes.json();
        setCashFlow(cfData);
      }

      const expRes = await fetch(`${baseUrl}/finance/expenses`, { credentials: 'include' });
      if (expRes.ok) {
        const expData = await expRes.json();
        setExpenses(expData);
      }

      const prjRes = await fetch(`${baseUrl}/projects`, { credentials: 'include' });
      if (prjRes.ok) {
        const prjData = await prjRes.json();
        setProjects(prjData);
        if (prjData.length > 0) setExpProjectId(prjData[0].id);
      }

    } catch (err) {
      console.error('Error fetching finance data:', err);
    } fontically: {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  // Submit New Expense
  const handleLogExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
      const res = await fetch(`${baseUrl}/finance/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          category: expCategory,
          amount: expAmount,
          projectId: expProjectId,
          vendor: expVendor || 'Authorized Vendor',
          receiptNumber: expReceiptNo || undefined
        })
      });

      if (res.ok) {
        setIsLogExpenseOpen(false);
        setExpVendor('');
        setExpReceiptNo('');
        fetchFinanceData();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to log expense.');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!hasPermission) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3 font-sans max-w-lg mx-auto my-12">
        <Lock className="w-10 h-10 text-amber-600 mx-auto" />
        <h2 className="text-base font-extrabold text-slate-900">Restricted Finance Module Access</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Your active user role lacks the <code>view:finance</code> permission. Finance telemetry and disbursement statements are strictly isolated to authorized Finance Leads, Directors, and Administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-700" /> Isolated Financial Architecture
            </span>
            <span className="text-xs text-slate-400 font-mono">FCRA & Audit Telemetry</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">Financial Management & Grants Control</h1>
          <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
            Capital inflow tracking, line-item expense logging, budget vs actual variance analysis, cash flow forecasts, and FCRA utilization metrics.
          </p>
        </div>

        {AuthService.hasPermission('write:finance') && (
          <button
            onClick={() => setIsLogExpenseOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs shadow-2xs transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Receipt className="w-4 h-4" /> + Log Line-Item Expense
          </button>
        )}
      </div>

      {/* Financial KPIs Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-semibold uppercase block">TOTAL CAPITAL INFLOW</span>
          <span className="font-bold text-teal-800 text-base mt-0.5 block">
            ₹{((summary?.totalIncome || 0) / 100000).toFixed(2)} Lakhs
          </span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-semibold uppercase block">ALLOCATED BUDGET</span>
          <span className="font-bold text-slate-900 text-base mt-0.5 block">
            ₹{((summary?.totalBudget || 0) / 100000).toFixed(2)} Lakhs
          </span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-semibold uppercase block">ACTUAL SPEND</span>
          <span className="font-bold text-slate-800 text-base mt-0.5 block">
            ₹{((summary?.totalSpent || 0) / 100000).toFixed(2)} Lakhs
          </span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-semibold uppercase block">UTILIZATION RATE</span>
          <span className="font-bold text-emerald-700 text-base mt-0.5 block">
            {(summary?.utilizationRate || 0).toFixed(1)}% Capital Burn
          </span>
        </div>
      </div>

      {/* BUDGET VS ACTUAL ANALYSIS TABLE */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 font-sans">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-teal-700" /> Budget vs Actual Variance Analysis
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Line-item comparison of allocated capital vs field disbursements.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider font-mono">
                <th className="py-2.5 px-3">Project Code & Name</th>
                <th className="py-2.5 px-3">Allocated Budget</th>
                <th className="py-2.5 px-3">Actual Spent</th>
                <th className="py-2.5 px-3">Variance</th>
                <th className="py-2.5 px-3">Burn Utilization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {budgetVsActual.map((item) => (
                <tr key={item.projectId} className="hover:bg-slate-50/80 transition">
                  <td className="py-2.5 px-3 font-bold text-slate-900">
                    <span className="font-mono text-teal-800 text-[10px] block">{item.projectCode}</span>
                    {item.projectName}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">₹{(item.allocatedBudget / 100000).toFixed(2)} L</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-teal-800">₹{(item.actualSpent / 100000).toFixed(2)} L</td>
                  <td className="py-2.5 px-3 font-mono text-emerald-700 font-bold">₹{(item.variance / 100000).toFixed(2)} L</td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-teal-700 h-full rounded-full"
                          style={{ width: `${Math.min(100, item.utilizationPercentage)}%` }}
                        />
                      </div>
                      <span className="font-mono text-[10px] text-slate-600 font-bold">{item.utilizationPercentage}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CASH FLOW STATEMENT & FORECAST */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Cash Flow Statement */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <h3 className="text-xs font-extrabold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-teal-700" /> Quarterly Cash Flow Statement
          </h3>

          <div className="space-y-2">
            {cashFlow?.cashFlowMonths?.map((cf: any, i: number) => (
              <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-slate-900">{cf.month}</span>
                <div className="flex items-center gap-4">
                  <span className="text-emerald-700 font-bold">Inflow: +₹{(cf.inflow / 100000).toFixed(1)} L</span>
                  <span className="text-rose-700 font-bold">Outflow: -₹{(cf.outflow / 100000).toFixed(1)} L</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Runway Forecast */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <h3 className="text-xs font-extrabold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-teal-700" /> Capital Runway Forecast
          </h3>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200">
              <span className="text-[10px] text-teal-800 font-semibold block uppercase">ESTIMATED CAPITAL RUNWAY</span>
              <span className="font-bold text-teal-950 text-base block mt-0.5">{cashFlow?.forecast?.monthsCapitalRunway || 12} Months</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">MONTHLY BURN RATE</span>
              <span className="font-bold text-slate-900 block mt-0.5">₹{((cashFlow?.forecast?.projectedBurnRateMonthly || 0) / 100000).toFixed(2)} Lakhs / mo</span>
            </div>
          </div>
        </div>
      </div>

      {/* LINE-ITEM EXPENSE ROSTER */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-teal-700" /> Line-Item Expense Disbursements ({expenses.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider font-mono">
                <th className="py-2.5 px-3">Receipt / Date</th>
                <th className="py-2.5 px-3">Expense Category</th>
                <th className="py-2.5 px-3">Project Initiative</th>
                <th className="py-2.5 px-3">Vendor</th>
                <th className="py-2.5 px-3">Amount (₹)</th>
                <th className="py-2.5 px-3">Approved By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/80 transition font-mono">
                  <td className="py-2.5 px-3 font-bold text-slate-900">
                    <span>{exp.receiptNumber}</span>
                    <span className="text-[10px] text-slate-400 block font-normal">{new Date(exp.date).toLocaleDateString()}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-800">{exp.category}</td>
                  <td className="py-2.5 px-3 text-teal-800 font-bold">{exp.project?.name || 'Field Project'}</td>
                  <td className="py-2.5 px-3 text-slate-600">{exp.vendor}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">₹{exp.amount.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-slate-500">{exp.approvedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* LOG EXPENSE MODAL */}
      {isLogExpenseOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4 text-xs font-sans animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-teal-700" /> Log Line-Item Expense
              </h3>
              <button onClick={() => setIsLogExpenseOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLogExpenseSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Expense Category</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-700"
                >
                  <option value="Program Execution">Program Execution</option>
                  <option value="Admin & Operations">Admin & Operations</option>
                  <option value="Equipment & Supplies">Equipment & Supplies</option>
                  <option value="Travel & Logistics">Travel & Logistics</option>
                  <option value="Fundraising">Fundraising</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={expAmount}
                    onChange={(e) => setExpAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:border-teal-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Project Initiative</label>
                  <select
                    value={expProjectId}
                    onChange={(e) => setExpProjectId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-700"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Vendor / Recipient</label>
                <input
                  type="text"
                  required
                  value={expVendor}
                  onChange={(e) => setExpVendor(e.target.value)}
                  placeholder="Apex Hardware Solutions"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-700"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLogExpenseOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold cursor-pointer"
                >
                  Log Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
