import React from 'react';
import { cn } from '../../lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'orange' | 'green' | 'blue' | 'amber';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

const colors = {
  orange: 'bg-[var(--accent-orange)]',
  green: 'bg-[var(--green)]',
  blue: 'bg-[var(--blue)]',
  amber: 'bg-[var(--accent-amber)]',
};

const sizes = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value, max = 100, color = 'orange', size = 'md', animated = true, className,
}) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const isComplete = pct >= 100;

  return (
    <div className={cn(
      'w-full bg-[var(--border-default)] rounded-pill overflow-hidden border border-[#18130e]',
      sizes[size],
      className,
    )}>
      <div
        className={cn(
          'h-full rounded-pill transition-[width] duration-700 ease-out',
          isComplete ? 'bg-[var(--green)]' : colors[color],
          animated && 'transition-[width]',
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};
