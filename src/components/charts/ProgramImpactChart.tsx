import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';

interface ProgramImpactChartProps {
  customAllocation?: any[];
}

export const ProgramImpactChart: React.FC<ProgramImpactChartProps> = ({ customAllocation }) => {
  const chartData = customAllocation && customAllocation.length > 0
    ? customAllocation.map(c => ({
        program: c.category,
        beneficiaries: Math.round(c.budget / 1000),
        spendLakhs: Math.round(c.budget / 100000)
      }))
    : [];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-lg text-xs font-sans">
          <p className="font-bold text-slate-900 mb-1.5 border-b border-slate-100 pb-1">{label} Program Performance</p>
          <div className="space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Beneficiaries Reached:</span>
              <span className="font-mono font-bold text-teal-700">{payload[0]?.value.toLocaleString()} people</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Capital Allocated:</span>
              <span className="font-mono font-bold text-slate-800">₹{payload[1]?.value} Lakhs</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="program" stroke="#94a3b8" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="left" stroke="#0f766e" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 11, color: '#64748b' }} />

          <Bar yAxisId="left" dataKey="beneficiaries" name="Beneficiaries Reached" fill="#0f766e" radius={[3, 3, 0, 0]} />
          <Bar yAxisId="right" dataKey="spendLakhs" name="Spend Allocated (₹ L)" fill="#94a3b8" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
