import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Download, ArrowRight, Search, SlidersHorizontal, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageWrapper } from '../components/layout/PageWrapper';
import { useTransactions } from '../lib/api';
import { formatCAD, formatDate } from '../lib/formatters';
import type { TransactionFilters } from '../types';

const PaymentCard: React.FC<{ tx: any }> = ({ tx }) => {
  const navigate = useNavigate();
  const mPct = tx.grossAmount > 0 ? (tx.malachiTotalPayout / tx.grossAmount) * 100 : 0;
  const dPct = tx.grossAmount > 0 ? (tx.danielTotalPayout / tx.grossAmount) * 100 : 0;
  const bPct = 100 - mPct - dPct;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-card border-[3px] border-[#18130e] bg-white shadow-card p-6 cursor-pointer hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-card-hover transition-all"
      onClick={() => navigate(`/transactions/${tx.id}`)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0 mr-4">
          <p className="font-bold text-[var(--text-primary)] text-lg leading-tight">{tx.clientName}</p>
          {tx.projectDescription && (
            <p className="text-sm text-[var(--text-secondary)] mt-1 truncate">{tx.projectDescription}</p>
          )}
          <p className="text-xs text-[var(--text-tertiary)] font-medium mt-2">{formatDate(tx.paymentDate)}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <p className="font-mono font-bold text-xl text-[var(--text-primary)]">{formatCAD(tx.grossAmount)}</p>
          <ArrowRight size={16} className="text-[var(--text-tertiary)]" />
        </div>
      </div>

      {/* Allocation bar */}
      <div className="w-full h-2 rounded-full overflow-hidden flex" style={{ border: '1.5px solid #18130e' }}>
        <div style={{ width: `${mPct}%`, background: '#F07830' }} />
        <div style={{ width: `${dPct}%`, background: '#2563eb' }} />
        <div style={{ width: `${bPct}%`, background: '#e5e7eb' }} />
      </div>

      <div className="flex items-center gap-4 mt-3">
        <span className="text-xs font-semibold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#F07830' }} />
          <span style={{ color: '#F07830' }}>M {formatCAD(tx.malachiTotalPayout)}</span>
        </span>
        <span className="text-xs font-semibold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#2563eb' }} />
          <span style={{ color: '#2563eb' }}>D {formatCAD(tx.danielTotalPayout)}</span>
        </span>
        <span className="text-xs font-semibold flex items-center gap-1.5 ml-auto">
          <span className="w-2 h-2 rounded-full inline-block bg-[var(--border-default)]" />
          <span className="text-[var(--text-tertiary)]">Biz {formatCAD(tx.businessTotalRetained)}</span>
        </span>
      </div>
    </motion.div>
  );
};

export const Transactions: React.FC = () => {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<TransactionFilters>({ page: 1, limit: 20, sort: 'newest' });
  const { data, isLoading } = useTransactions(filters);

  const updateFilter = (k: keyof TransactionFilters, v: any) =>
    setFilters(prev => ({ ...prev, [k]: v, page: 1 }));

  const hasFilters = !!(filters.dateFrom || filters.dateTo || filters.client);

  const handleExportCSV = () => {
    if (!data?.data) return;
    const headers = ['Date', 'Client', 'Description', 'Gross', 'Malachi', 'Daniel', 'Business'];
    const rows = data.data.map(tx => [
      tx.paymentDate, tx.clientName, tx.projectDescription || '',
      tx.grossAmount, tx.malachiTotalPayout, tx.danielTotalPayout, tx.businessTotalRetained,
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'danichi-payments.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="section-label mb-1">All Payments</p>
          <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">
            {data ? `${data.total} payments` : 'Payments'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-[var(--text-primary)] rounded-pill transition-all hover:-translate-x-px hover:-translate-y-px"
            style={{ border: '2px solid #18130e', boxShadow: '3px 3px 0 #18130e', background: '#fff' }}
          >
            <Download size={14} /> Export
          </button>
          <button
            onClick={() => navigate('/transactions/new')}
            className="flex items-center gap-1.5 px-5 py-2 text-sm font-bold text-white rounded-pill transition-all hover:-translate-x-px hover:-translate-y-px"
            style={{ background: 'var(--accent-orange)', border: '2px solid #18130e', boxShadow: '3px 3px 0 #18130e' }}
          >
            <Plus size={14} /> Log Payment
          </button>
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="rounded-card border-[3px] border-[#18130e] bg-white shadow-card p-4 mb-6 flex items-center gap-3">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Search by client name…"
            value={filters.client || ''}
            onChange={e => updateFilter('client', e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm font-medium bg-[var(--bg-surface)] rounded-xl border-[2px] border-[var(--border-default)] focus:border-[var(--accent-orange)] focus:outline-none transition-colors"
          />
        </div>
        <select
          value={filters.sort}
          onChange={e => updateFilter('sort', e.target.value)}
          className="px-3 py-2 text-sm font-medium bg-[var(--bg-surface)] rounded-xl border-[2px] border-[var(--border-default)] focus:border-[var(--accent-orange)] focus:outline-none"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="largest">Largest first</option>
          <option value="smallest">Smallest first</option>
        </select>
        <button
          onClick={() => setShowFilters(v => !v)}
          className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-xl transition-colors ${
            showFilters || hasFilters
              ? 'bg-[var(--accent-orange)] text-white border-[2px] border-[#18130e]'
              : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[2px] border-[var(--border-default)]'
          }`}
        >
          <SlidersHorizontal size={14} />
          Filters {hasFilters ? '•' : ''}
        </button>
      </div>

      {/* Expandable date filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-card border-[3px] border-[#18130e] bg-[var(--bg-surface)] shadow-card p-4 mb-6 flex items-center gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">From</label>
                <input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={e => updateFilter('dateFrom', e.target.value)}
                  className="px-3 py-2 text-sm font-medium bg-white rounded-xl border-[2px] border-[#18130e] focus:border-[var(--accent-orange)] focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">To</label>
                <input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={e => updateFilter('dateTo', e.target.value)}
                  className="px-3 py-2 text-sm font-medium bg-white rounded-xl border-[2px] border-[#18130e] focus:border-[var(--accent-orange)] focus:outline-none"
                />
              </div>
              {hasFilters && (
                <button
                  onClick={() => setFilters({ page: 1, limit: 20, sort: 'newest' })}
                  className="mt-5 px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] rounded-xl border-[2px] border-[var(--border-default)] hover:border-[#18130e] transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment cards */}
      {isLoading ? (
        <div className="flex flex-col gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-card border-[3px] border-[var(--border-default)] bg-[var(--bg-surface)] h-36 animate-pulse" />
          ))}
        </div>
      ) : data?.data.length === 0 ? (
        <div className="rounded-card border-[3px] border-[#18130e] bg-white shadow-card p-16 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--bg-elevated)', border: '2px solid #18130e' }}>
            <CreditCard size={24} className="text-[var(--accent-orange)]" />
          </div>
          <p className="text-xl font-bold text-[var(--text-primary)] mb-2">No payments found</p>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            {hasFilters ? 'Try adjusting your filters.' : 'Log your first payment to start tracking how Danichi\'s money flows.'}
          </p>
          {!hasFilters && (
            <button
              onClick={() => navigate('/transactions/new')}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white rounded-pill hover:-translate-x-px hover:-translate-y-px transition-all"
              style={{ background: 'var(--accent-orange)', border: '2px solid #18130e', boxShadow: '3px 3px 0 #18130e' }}
            >
              <Plus size={14} /> Log First Payment
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {data?.data.map(tx => <PaymentCard key={tx.id} tx={tx} />)}
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between mt-8">
          <p className="text-sm text-[var(--text-secondary)] font-medium">
            {((filters.page! - 1) * 20) + 1}–{Math.min(filters.page! * 20, data.total)} of {data.total} payments
          </p>
          <div className="flex gap-2">
            <button
              disabled={(filters.page ?? 1) <= 1}
              onClick={() => updateFilter('page', (filters.page ?? 1) - 1)}
              className="px-4 py-2 text-sm font-semibold rounded-pill disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:-translate-x-px hover:-translate-y-px"
              style={{ border: '2px solid #18130e', boxShadow: '3px 3px 0 #18130e', background: '#fff' }}
            >
              Previous
            </button>
            <button
              disabled={(filters.page ?? 1) >= data.totalPages}
              onClick={() => updateFilter('page', (filters.page ?? 1) + 1)}
              className="px-4 py-2 text-sm font-bold text-white rounded-pill disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:-translate-x-px hover:-translate-y-px"
              style={{ background: 'var(--accent-orange)', border: '2px solid #18130e', boxShadow: '3px 3px 0 #18130e' }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};
