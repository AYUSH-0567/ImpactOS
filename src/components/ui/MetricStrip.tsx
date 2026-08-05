import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatPercent } from '../../utils/formatters';

export interface MetricItem {
  id: string;
  label: string;
  value: string;
  change?: number;
  subtext?: string;
  badge?: string;
  badgeVariant?: 'success' | 'warning' | 'danger' | 'info';
}

interface MetricStripProps {
  metrics: MetricItem[];
}

export const MetricStrip: React.FC<MetricStripProps> = ({ metrics }) => {
  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl divide-y md:divide-y-0 md:divide-x divide-slate-200 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 shadow-2xs">
      {metrics.map((m) => {
        const isPositive = m.change !== undefined && m.change > 0;
        const isNegative = m.change !== undefined && m.change < 0;

        return (
          <div key={m.id} className="p-3.5 flex flex-col justify-between hover:bg-slate-50/60 transition">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              {m.label}
            </span>

            <div className="flex items-baseline justify-between gap-1.5">
              <span className="text-xl font-extrabold text-slate-900 tracking-tight font-sans">
                {m.value}
              </span>

              {m.change !== undefined && (
                <span
                  className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold border ${
                    isPositive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : isNegative
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="w-2.5 h-2.5" />
                  ) : isNegative ? (
                    <TrendingDown className="w-2.5 h-2.5" />
                  ) : (
                    <Minus className="w-2.5 h-2.5" />
                  )}
                  {formatPercent(m.change)}
                </span>
              )}
            </div>

            {m.subtext && (
              <span className="text-[10px] text-slate-400 font-medium mt-1 truncate">
                {m.subtext}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
