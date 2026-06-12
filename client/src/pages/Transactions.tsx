import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Download, Eye, ArrowLeftRight } from 'lucide-react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AllocationBar } from '../components/ui/AllocationBar';
import { useTransactions } from '../lib/api';
import { formatCAD, formatDate } from '../lib/formatters';
import type { TransactionFilters } from '../types';

export const Transactions: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<TransactionFilters>({ page: 1, limit: 20, sort: 'newest' });
  const { data, isLoading } = useTransactions(filters);

  const updateFilter = (k: keyof TransactionFilters, v: any) =>
    setFilters(prev => ({ ...prev, [k]: v, page: 1 }));

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
    a.href = url; a.download = 'danichi-transactions.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageWrapper
      title="Transactions"
      action={
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handleExportCSV}>
            <Download size={14} /> Export CSV
          </Button>
          <Button size="sm" onClick={() => navigate('/transactions/new')}>
            <Plus size={14} /> New Transaction
          </Button>
        </div>
      }
    >
      {/* Filters */}
      <Card className="mb-4" padding="sm">
        <div className="flex gap-3 items-end">
          <Input label="From" type="date" value={filters.dateFrom || ''} onChange={e => updateFilter('dateFrom', e.target.value)} className="text-sm" />
          <Input label="To" type="date" value={filters.dateTo || ''} onChange={e => updateFilter('dateTo', e.target.value)} className="text-sm" />
          <Input label="Client" placeholder="Search client…" value={filters.client || ''} onChange={e => updateFilter('client', e.target.value)} className="text-sm" />
          <div className="flex flex-col gap-1.5">
            <label className="label-caps">Sort</label>
            <select
              value={filters.sort}
              onChange={e => updateFilter('sort', e.target.value)}
              className="bg-white border-[2px] border-[#18130e] rounded-xl text-sm font-medium text-[var(--text-primary)] px-3 py-3 focus:border-[var(--accent-orange)] focus:outline-none"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="largest">Largest first</option>
              <option value="smallest">Smallest first</option>
            </select>
          </div>
          <Button variant="secondary" size="sm" className="self-end" onClick={() => setFilters({ page: 1, limit: 20, sort: 'newest' })}>
            Clear
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card padding="none">
        <table className="w-full">
          <thead>
            <tr className="bg-[var(--bg-surface)] border-b-[2px] border-[#18130e]">
              {['Date', 'Client', 'Description', 'Gross', 'Malachi', 'Daniel', 'Business', 'Split', ''].map(h => (
                <th key={h} className="label-caps px-4 py-3.5 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-[var(--text-tertiary)] text-sm">Loading…</td></tr>
            ) : data?.data.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <ArrowLeftRight size={32} className="text-[var(--text-tertiary)]" />
                    <div>
                      <p className="text-sm font-medium text-[var(--text-secondary)]">No transactions yet</p>
                      <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Log your first payment to start tracking how Danichi's money flows.</p>
                    </div>
                    <Button size="sm" onClick={() => navigate('/transactions/new')}>Log a Payment</Button>
                  </div>
                </td>
              </tr>
            ) : (
              data?.data.map((tx) => (
                <tr
                  key={tx.id}
                  className="border-b-[2px] border-[var(--border-default)] hover:bg-[var(--bg-elevated)] cursor-pointer transition-colors"
                  onClick={() => navigate(`/transactions/${tx.id}`)}
                >
                  <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">{formatDate(tx.paymentDate)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-[var(--text-primary)] max-w-[140px] truncate">{tx.clientName}</td>
                  <td className="px-4 py-3 text-xs text-[var(--text-secondary)] max-w-[160px] truncate">{tx.projectDescription || '—'}</td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-bold text-[var(--text-primary)]">{formatCAD(tx.grossAmount)}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-[var(--malachi-color)]">{formatCAD(tx.malachiTotalPayout)}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-[var(--daniel-color)]">{formatCAD(tx.danielTotalPayout)}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-[var(--accent-amber)]">{formatCAD(tx.businessTotalRetained)}</td>
                  <td className="px-4 py-3 w-20">
                    <AllocationBar
                      segments={[
                        { label: 'M', value: tx.malachiTotalPayout, color: 'var(--malachi-color)' },
                        { label: 'D', value: tx.danielTotalPayout, color: 'var(--daniel-color)' },
                        { label: 'B', value: tx.businessTotalRetained, color: 'var(--accent-amber)' },
                      ]}
                      height={6}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Eye size={14} className="text-[var(--text-tertiary)]" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-[var(--text-secondary)]">
          <span>Showing {((filters.page! - 1) * 20) + 1}–{Math.min(filters.page! * 20, data.total)} of {data.total}</span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={(filters.page ?? 1) <= 1} onClick={() => updateFilter('page', (filters.page ?? 1) - 1)}>Previous</Button>
            <Button variant="secondary" size="sm" disabled={(filters.page ?? 1) >= data.totalPages} onClick={() => updateFilter('page', (filters.page ?? 1) + 1)}>Next</Button>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};
