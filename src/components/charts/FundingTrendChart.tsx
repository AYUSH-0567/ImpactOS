import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';


interface FundingTrendChartProps {
  customTrendData?: any[];
}

export const FundingTrendChart: React.FC<FundingTrendChartProps> = ({ customTrendData }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'CSR' | 'Individual' | 'Grants'>('all');
  const chartData = customTrendData || [];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-lg text-xs font-sans">
          <p className="font-bold text-slate-800 mb-1.5 border-b border-slate-100 pb-1">{label} Financial Telemetry</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5">
              <span className="flex items-center gap-1.5 font-medium text-slate-600">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-mono font-bold text-slate-900">₹{entry.value.toFixed(1)} Lakhs</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              activeCategory === 'all'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Channels
          </button>
          <button
            onClick={() => setActiveCategory('CSR')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              activeCategory === 'CSR'
                ? 'bg-white text-teal-800 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            CSR Corporate
          </button>
          <button
            onClick={() => setActiveCategory('Individual')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              activeCategory === 'Individual'
                ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Individual Donors
          </button>
          <button
            onClick={() => setActiveCategory('Grants')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              activeCategory === 'Grants'
                ? 'bg-white text-amber-800 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Grants
          </button>
        </div>
        <span className="text-xs text-slate-400 font-mono">Amounts in ₹ Lakhs</span>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCsrLight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0f766e" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorIndLight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorGrantsLight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d97706" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 11, color: '#64748b' }} />

            {(activeCategory === 'all' || activeCategory === 'CSR') && (
              <Area
                type="monotone"
                dataKey="CSR"
                name="CSR Corporate"
                stroke="#0f766e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCsrLight)"
              />
            )}
            {(activeCategory === 'all' || activeCategory === 'Grants') && (
              <Area
                type="monotone"
                dataKey="Grants"
                name="Foundation Grants"
                stroke="#d97706"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorGrantsLight)"
              />
            )}
            {(activeCategory === 'all' || activeCategory === 'Individual') && (
              <Area
                type="monotone"
                dataKey="Individual"
                name="Individual Donors"
                stroke="#059669"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorIndLight)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
