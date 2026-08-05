import React from 'react';
import { getStatusBadgeColor } from '../../utils/formatters';

interface BadgeProps {
  label: string;
  variant?: 'status' | 'risk' | 'custom';
  customClass?: string;
  showDot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  showDot = true,
  customClass
}) => {
  const styles = getStatusBadgeColor(label);

  if (customClass) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${customClass}`}>
        {showDot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
        {label}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles.bg} ${styles.text} ${styles.border}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />}
      {label}
    </span>
  );
};
