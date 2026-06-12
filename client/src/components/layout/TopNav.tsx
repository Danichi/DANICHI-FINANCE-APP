import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Plus, Settings, Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Home', exact: true },
  { to: '/transactions', label: 'Payments' },
  { to: '/equity', label: 'Equity' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/expenses', label: 'Expenses' },
  { to: '/goals', label: 'Goals' },
  { to: '/clients', label: 'Clients' },
];

export const TopNav: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white" style={{ borderBottom: '3px solid #18130e', boxShadow: '0 3px 0 #18130e' }}>
      <div className="max-w-6xl mx-auto px-6 flex items-center gap-4 h-[66px]">

        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2.5 flex-shrink-0 mr-4">
          <div className="w-9 h-9 rounded-xl bg-[var(--accent-orange)] flex items-center justify-center flex-shrink-0"
            style={{ border: '2px solid #18130e', boxShadow: '2px 2px 0 #18130e' }}>
            <span className="font-display text-white font-bold text-base leading-none">D</span>
          </div>
          <div className="hidden sm:block">
            <p className="font-display font-bold text-[var(--text-primary)] leading-tight text-sm">Danichi</p>
            <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider leading-tight">Finance</p>
          </div>
        </NavLink>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1 flex-1">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 whitespace-nowrap ${
                  isActive
                    ? 'bg-[var(--accent-orange)] text-white'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                }`
              }
              style={({ isActive }) => isActive ? { border: '2px solid #18130e', boxShadow: '2px 2px 0 #18130e' } : { border: '2px solid transparent' }}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 ml-auto">
          <NavLink
            to="/settings"
            className="hidden md:flex w-9 h-9 rounded-xl items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors flex-shrink-0"
            style={{ border: '2px solid #18130e', boxShadow: '2px 2px 0 #18130e' }}
          >
            <Settings size={16} />
          </NavLink>
          <button
            onClick={() => navigate('/transactions/new')}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white rounded-pill transition-all duration-150 hover:-translate-x-px hover:-translate-y-px flex-shrink-0"
            style={{ background: 'var(--accent-orange)', border: '2px solid #18130e', boxShadow: '3px 3px 0 #18130e' }}
          >
            <Plus size={14} />
            Log Payment
          </button>
          {/* Mobile menu toggle */}
          <button
            className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-primary)]"
            style={{ border: '2px solid #18130e' }}
            onClick={() => setOpen(o => !o)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t-[3px] border-[#18130e] bg-white px-6 py-4 flex flex-col gap-2">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  isActive ? 'bg-[var(--accent-orange)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <button
            onClick={() => { navigate('/transactions/new'); setOpen(false); }}
            className="mt-2 py-3 text-sm font-bold text-white rounded-pill text-center"
            style={{ background: 'var(--accent-orange)', border: '2px solid #18130e' }}
          >
            + Log Payment
          </button>
        </div>
      )}
    </header>
  );
};
