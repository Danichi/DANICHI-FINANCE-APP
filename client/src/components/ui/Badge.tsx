import React from 'react';
import { cn } from '../../lib/utils';

type BadgeColor = 'orange' | 'blue' | 'amber' | 'green' | 'red' | 'default';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: BadgeColor;
}

const colors: Record<BadgeColor, string> = {
  orange: 'bg-[var(--accent-orange-dim)] text-[var(--accent-orange)] border-[2px] border-[var(--accent-orange)]',
  blue: 'bg-[rgba(37,99,235,0.1)] text-[var(--blue)] border-[2px] border-[var(--blue)]',
  amber: 'bg-[var(--bg-elevated)] text-[var(--accent-orange)] border-[2px] border-[var(--accent-orange)]',
  green: 'bg-[var(--green-dim)] text-[var(--green)] border-[2px] border-[var(--green)]',
  red: 'bg-[var(--red-dim)] text-[var(--red)] border-[2px] border-[var(--red)]',
  default: 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[2px] border-[var(--border-default)]',
};

export const Badge: React.FC<BadgeProps> = ({ color = 'default', className, children, ...props }) => (
  <span
    className={cn(
      'inline-flex items-center rounded-pill px-2.5 py-0.5',
      'text-[11px] font-bold leading-tight',
      colors[color],
      className,
    )}
    {...props}
  >
    {children}
  </span>
);
