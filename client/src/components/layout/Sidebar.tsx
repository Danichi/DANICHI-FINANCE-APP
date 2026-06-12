import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, ArrowLeftRight, BarChart3, Scale,
  Receipt, Target, Users, Settings,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  group: 'main' | 'finance' | 'manage';
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', icon: <LayoutDashboard size={18} />, label: 'Dashboard', group: 'main' },
  { to: '/transactions', icon: <ArrowLeftRight size={18} />, label: 'Transactions', group: 'main' },
  { to: '/analytics', icon: <BarChart3 size={18} />, label: 'Analytics', group: 'main' },
  { to: '/equity', icon: <Scale size={18} />, label: 'Equity', group: 'main' },
  { to: '/expenses', icon: <Receipt size={18} />, label: 'Expenses', group: 'finance' },
  { to: '/goals', icon: <Target size={18} />, label: 'Goals', group: 'finance' },
  { to: '/clients', icon: <Users size={18} />, label: 'Clients', group: 'finance' },
  { to: '/settings', icon: <Settings size={18} />, label: 'Settings', group: 'manage' },
];

const GROUP_LABELS: Record<string, string> = {
  main: 'Overview',
  finance: 'Finance',
  manage: 'Manage',
};

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const groups = [
    { key: 'main', items: NAV_ITEMS.filter(n => n.group === 'main') },
    { key: 'finance', items: NAV_ITEMS.filter(n => n.group === 'finance') },
    { key: 'manage', items: NAV_ITEMS.filter(n => n.group === 'manage') },
  ];

  return (
    <aside
      className="fixed left-0 top-0 h-full w-[220px] bg-white border-r-[3px] border-[#18130e] z-30 flex flex-col"
      style={{ boxShadow: '3px 0 0 #18130e' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b-[2px] border-[#18130e]">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: 'var(--accent-orange)',
            border: '2px solid #18130e',
            boxShadow: '2px 2px 0 #18130e',
          }}
        >
          <span className="font-display text-white text-base font-bold leading-none">D</span>
        </div>
        <div className="flex flex-col">
          <span className="font-display text-sm font-bold text-[var(--text-primary)] leading-tight">Danichi</span>
          <span className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-widest">Finance</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto flex flex-col gap-5">
        {groups.map(({ key, items }) => (
          <div key={key}>
            <p className="px-2 mb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">
              {GROUP_LABELS[key]}
            </p>
            <div className="flex flex-col gap-1">
              {items.map(item => {
                const isActive = item.to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.to);

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all duration-150 relative',
                      isActive
                        ? 'bg-[var(--accent-orange)] text-white border-[2px] border-[#18130e] shadow-[2px_2px_0_#18130e]'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]',
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute inset-0 bg-[var(--accent-orange)] rounded-xl -z-10"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="flex-shrink-0">{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t-[2px] border-[#18130e]">
        <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-widest">Danichi Media</p>
        <p className="text-[10px] text-[var(--text-tertiary)]">Internal Finance Tool</p>
      </div>
    </aside>
  );
};
