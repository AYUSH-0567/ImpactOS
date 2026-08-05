import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { EXPENSE_CATEGORIES } from '../../data/mockData';
import { formatINR } from '../../utils/formatters';

export const ExpenseBreakdownChart: React.FC = () => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-lg text-xs font-sans">
          <p className="font-bold text-slate-900 mb-1">{data.name}</p>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-500">Share:</span>
            <span className="font-bold text-teal-800 font-mono">{data.value}%</span>
          </div>
          <div className="flex items-center justify-between gap-4 mt-0.5">
            <span className="text-slate-500">Total Spend:</span>
            <span className="font-bold text-slate-800 font-mono">{formatINR(data.amount)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
      <div className="md:col-span-5 h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={EXPENSE_CATEGORIES}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {EXPENSE_CATEGORIES.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="md:col-span-7 space-y-2">
        {EXPENSE_CATEGORIES.map((item) => (
          <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/80 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className="font-medium text-slate-700 truncate max-w-[150px]">{item.name}</span>
            </div>
            <div className="flex items-center gap-3 font-mono">
              <span className="font-bold text-slate-900">{item.value}%</span>
              <span className="text-slate-500">{formatINR(item.amount)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
