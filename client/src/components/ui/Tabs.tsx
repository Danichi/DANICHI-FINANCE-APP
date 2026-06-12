import React from 'react';
import { cn } from '../../lib/utils';

interface TabItem {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: TabItem[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, active, onChange, className }) => (
  <div className={cn('flex gap-2 p-1.5 bg-[var(--bg-surface)] rounded-xl border-[2px] border-[#18130e] w-fit', className)}>
    {tabs.map(tab => (
      <button
        key={tab.id}
        type="button"
        onClick={() => onChange(tab.id)}
        className={cn(
          'px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-150',
          active === tab.id
            ? 'bg-[var(--accent-orange)] text-white border-[2px] border-[#18130e] shadow-[2px_2px_0_#18130e]'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white',
        )}
      >
        {tab.label}
      </button>
    ))}
  </div>
);
