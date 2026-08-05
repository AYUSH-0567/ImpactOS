import React from 'react';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';
import { formatPercent } from '../../utils/formatters';

interface KpiCardProps {
  title: string;
  value: string;
  change?: number;
  comparisonText?: string;
  icon?: LucideIcon;
  iconColor?: string;
  badgeText?: string;
  badgeVariant?: 'neutral' | 'success' | 'warning' | 'danger';
  subtext?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  change,
  comparisonText = 'vs last period',
  icon: Icon,
  iconColor = 'text-indigo-400',
  badgeText,
  badgeVariant = 'neutral',
  subtext
}) => {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <div className="relative group bg-slate-900/70 backdrop-blur-sm border border-slate-800/80 rounded-xl p-5 hover:border-slate-700/80 transition-all duration-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-lg bg-slate-800/60 border border-slate-700/40 ${iconColor}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
          {value}
        </div>

        {change !== undefined && (
          <div
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${
              isPositive
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : isNegative
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : isNegative ? (
              <TrendingDown className="w-3 h-3" />
            ) : (
              <Minus className="w-3 h-3" />
            )}
            <span>{formatPercent(change)}</span>
          </div>
        )}

        {badgeText && (
          <span
            className={`px-2 py-0.5 rounded-md text-xs font-medium border ${
              badgeVariant === 'success'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : badgeVariant === 'warning'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                : badgeVariant === 'danger'
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {badgeText}
          </span>
        )}
      </div>

      {(comparisonText || subtext) && (
        <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
          <span>{subtext || comparisonText}</span>
        </div>
      )}
    </div>
  );
};
