import React from 'react';
import type { Assignment } from '../../types';

interface PartnerBadgeProps {
  assignment: Assignment;
  size?: 'sm' | 'md';
}

const labels: Record<Assignment, string> = {
  malachi: 'Malachi',
  daniel: 'Daniel',
  split: '50/50',
};

const styles: Record<Assignment, string> = {
  malachi: 'bg-[var(--accent-orange-dim)] text-[var(--accent-orange)] border-[2px] border-[var(--accent-orange)]',
  daniel: 'bg-[rgba(37,99,235,0.1)] text-[var(--blue)] border-[2px] border-[var(--blue)]',
  split: 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[2px] border-[#18130e]',
};

export const PartnerBadge: React.FC<PartnerBadgeProps> = ({ assignment, size = 'sm' }) => (
  <span
    className={`inline-flex items-center rounded-pill font-bold ${size === 'sm' ? 'text-[11px] px-2.5 py-0.5' : 'text-xs px-3 py-1'} ${styles[assignment]}`}
  >
    {labels[assignment]}
  </span>
);
