import React from 'react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  label: string;
  value: string | React.ReactNode;
  sub?: string | React.ReactNode;
  variant?: 'default' | 'orange' | 'surface';
  orb?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
  label, value, sub, variant = 'default', orb, className, icon,
}) => {
  const isOrange = variant === 'orange';

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-card border-[3px] border-[#18130e] shadow-card p-6',
        isOrange ? 'bg-[var(--accent-orange)]' : 'bg-white',
        className,
      )}
    >
      {orb && <div className="hero-card-orb" />}
      <div className="relative z-10">
        {icon && (
          <div className={cn(
            'w-10 h-10 rounded-xl border-[2px] border-[#18130e] flex items-center justify-center mb-4',
            isOrange ? 'bg-white/20 text-white' : 'bg-[var(--bg-elevated)] text-[var(--accent-orange)]',
          )}>
            {icon}
          </div>
        )}
        <p className={cn('label-caps mb-2', isOrange && 'text-white/70')}>{label}</p>
        <div className={cn(
          'font-mono text-3xl font-bold tabular-nums leading-none',
          isOrange ? 'text-white' : 'text-[var(--text-primary)]',
        )}>
          {value}
        </div>
        {sub && (
          <div className={cn('mt-2 text-sm', isOrange ? 'text-white/80' : 'text-[var(--text-secondary)]')}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );
};
