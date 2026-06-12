import React from 'react';
import { cn } from '../../lib/utils';
import { formatCAD, formatUSD } from '../../lib/formatters';

interface MoneyProps {
  amount: number;
  currency?: 'CAD' | 'USD';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  color?: 'default' | 'green' | 'red' | 'orange' | 'blue' | 'amber' | 'secondary';
  className?: string;
  bold?: boolean;
}

const sizes = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-xl',
  '2xl': 'text-3xl',
};

const colors = {
  default: 'text-[var(--text-primary)]',
  green: 'text-[var(--green)]',
  red: 'text-[var(--red)]',
  orange: 'text-[var(--accent-orange)]',
  blue: 'text-[var(--blue)]',
  amber: 'text-[var(--accent-amber)]',
  secondary: 'text-[var(--text-secondary)]',
};

export const Money: React.FC<MoneyProps> = ({
  amount, currency = 'CAD', size = 'md', color = 'default', className, bold = false,
}) => (
  <span
    className={cn(
      'font-mono tabular-nums',
      sizes[size],
      colors[color],
      bold && 'font-bold',
      className,
    )}
  >
    {currency === 'USD' ? formatUSD(amount) : formatCAD(amount)}
  </span>
);
