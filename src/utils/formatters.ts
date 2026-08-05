/**
 * Utility functions for Indian currency, number, and date formatting
 * Light-theme status color helpers
 */

export function formatINR(amount: number, compact: boolean = true): string {
  if (isNaN(amount)) return '₹0';
  
  if (compact) {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)} L`;
    }
    if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(0)}k`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  }
  
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export function formatNumber(num: number): string {
  if (isNaN(num)) return '0';
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toLocaleString('en-IN');
}

export function formatPercent(value: number, includeSign: boolean = true): string {
  if (isNaN(value)) return '0%';
  const prefix = includeSign && value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(1)}%`;
}

export function getStatusBadgeColor(status: string): { bg: string; text: string; border: string; dot: string } {
  switch (status) {
    case 'On Track':
    case 'Completed':
    case 'Active':
    case 'Compliant':
    case 'Optimal':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-600'
      };
    case 'At Risk':
    case 'Pending':
    case 'Lapsed':
    case 'Needs Attention':
    case 'Medium':
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-600'
      };
    case 'Delayed':
    case 'High':
    case 'Critical':
    case 'Inactive':
    case 'Urgent':
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        text: 'text-rose-700',
        border: 'border-rose-200',
        dot: 'bg-rose-600'
      };
    case 'Processing':
    case 'Informational':
    case 'Safe Horizon':
      return {
        bg: 'bg-sky-50 text-sky-700 border-sky-200',
        text: 'text-sky-700',
        border: 'border-sky-200',
        dot: 'bg-sky-600'
      };
    default:
      return {
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
        text: 'text-slate-700',
        border: 'border-slate-200',
        dot: 'bg-slate-500'
      };
  }
}
