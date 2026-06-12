import React from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { PartnerEarningsLine } from '../components/charts/PartnerEarningsLine';
import { MonthlyDeltaBar } from '../components/charts/MonthlyDeltaBar';
import { useEquityData, useCumulativeEarnings, useMonthlyDelta } from '../lib/api';
import { formatCAD } from '../lib/formatters';
import { useCountUp } from '../lib/countUp';

export const EquityTracker: React.FC = () => {
  const { data: equity } = useEquityData();
  const { data: cumulative } = useCumulativeEarnings();
  const { data: delta } = useMonthlyDelta();

  const mTotal = equity?.malachi_total ?? 0;
  const dTotal = equity?.daniel_total ?? 0;
  const combined = mTotal + dTotal;
  const mPct = combined > 0 ? (mTotal / combined) * 100 : 50;
  const dPct = 100 - mPct;

  const mAnimated = useCountUp(mTotal, 1200);
  const dAnimated = useCountUp(dTotal, 1200);

  const diff = Math.abs(mTotal - dTotal);
  const leader = mTotal >= dTotal ? 'Malachi' : 'Daniel';
  const leaderColor = mTotal >= dTotal ? '#F07830' : '#2563eb';
  const balanced = diff / Math.max(combined, 1) < 0.05;

  const categories = [
    { label: 'Work Pay', m: equity?.malachi_work_pay ?? 0, d: equity?.daniel_work_pay ?? 0 },
    { label: 'Sales Commission', m: equity?.malachi_sales_commission ?? 0, d: equity?.daniel_sales_commission ?? 0 },
    { label: 'Client Management', m: equity?.malachi_client_management ?? 0, d: equity?.daniel_client_management ?? 0 },
  ];

  return (
    <PageWrapper>
      {/* Header */}
      <div className="mb-10">
        <p className="section-label mb-1">Partner Earnings</p>
        <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">Equity Tracker</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-xl">
          A real-time view of how earnings have been split between Malachi and Daniel across all payments ever logged.
        </p>
      </div>

      {/* Big hero partner cards */}
      <div className="grid grid-cols-2 gap-5 mb-8">
        {[
          { name: 'Malachi', total: mAnimated, pct: mPct, color: '#F07830',
            work: equity?.malachi_work_pay ?? 0, sales: equity?.malachi_sales_commission ?? 0, mgmt: equity?.malachi_client_management ?? 0 },
          { name: 'Daniel', total: dAnimated, pct: dPct, color: '#2563eb',
            work: equity?.daniel_work_pay ?? 0, sales: equity?.daniel_sales_commission ?? 0, mgmt: equity?.daniel_client_management ?? 0 },
        ].map(p => (
          <div key={p.name} className="rounded-card border-[3px] border-[#18130e] bg-white shadow-card p-6 overflow-hidden relative">
            <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: p.color }} />
            <div className="flex items-center gap-2.5 mb-4 mt-1">
              <div className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
              <p className="font-bold text-[var(--text-primary)] text-xl">{p.name}</p>
            </div>
            <p className="font-mono font-bold tabular-nums leading-none mb-1" style={{ color: p.color, fontSize: '2.75rem' }}>
              {formatCAD(p.total)}
            </p>
            <p className="text-sm text-[var(--text-secondary)] mb-6">earned in total</p>

            <div className="space-y-2.5">
              {[
                { label: 'Work pay (60% pool)', val: p.work },
                { label: 'Sales commission', val: p.sales },
                { label: 'Client management', val: p.mgmt },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center">
                  <span className="text-sm text-[var(--text-secondary)]">{row.label}</span>
                  <span className="font-mono font-bold text-sm text-[var(--text-primary)]">{formatCAD(row.val)}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t-[2px] border-[var(--border-default)] flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-secondary)]">Share of all partner payouts</span>
              <span className="font-mono font-bold text-lg" style={{ color: p.color }}>{p.pct.toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Ratio bar */}
      <div className="rounded-card border-[3px] border-[#18130e] bg-white shadow-card p-6 mb-6">
        <p className="section-label mb-4">Earnings Ratio</p>
        <div className="flex rounded-full overflow-hidden h-5" style={{ border: '2px solid #18130e' }}>
          <div style={{ width: `${mPct}%`, background: '#F07830', transition: 'width 0.8s ease' }} />
          <div style={{ width: `${dPct}%`, background: '#2563eb', transition: 'width 0.8s ease' }} />
        </div>
        <div className="flex justify-between mt-3">
          <span className="font-mono text-sm font-bold" style={{ color: '#F07830' }}>Malachi — {mPct.toFixed(1)}%</span>
          <span className="font-mono text-sm font-bold" style={{ color: '#2563eb' }}>Daniel — {dPct.toFixed(1)}%</span>
        </div>
      </div>

      {/* Balance note */}
      <div className="rounded-card border-[3px] border-[#18130e] bg-[var(--bg-surface)] shadow-card p-5 mb-8">
        {balanced ? (
          <p className="text-sm font-medium text-[var(--text-secondary)]">
            Earnings are within 5% of each other — <span className="font-bold text-[var(--text-primary)]">pretty well balanced.</span>
          </p>
        ) : (
          <p className="text-sm font-medium text-[var(--text-secondary)]">
            Based on all payments logged, <span className="font-bold" style={{ color: leaderColor }}>{leader}</span> has earned{' '}
            <span className="font-mono font-bold text-[var(--text-primary)]">{formatCAD(diff)}</span> more than their partner so far.
          </p>
        )}
      </div>

      {/* Category breakdown */}
      <div className="rounded-card border-[3px] border-[#18130e] bg-white shadow-card overflow-hidden mb-8">
        <div className="px-6 py-4 border-b-[2px] border-[#18130e] bg-[var(--bg-surface)]">
          <p className="section-label">Earnings by Category</p>
        </div>
        <div className="divide-y-[2px] divide-[var(--border-default)]">
          {categories.map(row => {
            const total = row.m + row.d;
            const mShare = total > 0 ? (row.m / total) * 100 : 50;
            const dShare = 100 - mShare;
            return (
              <div key={row.label} className="px-6 py-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-[var(--text-primary)]">{row.label}</p>
                  <p className="text-xs text-[var(--text-tertiary)] font-mono">{mShare.toFixed(0)} / {dShare.toFixed(0)} split</p>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)] mb-1">Malachi</p>
                    <p className="font-mono font-bold text-lg" style={{ color: '#F07830' }}>{formatCAD(row.m)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[var(--text-tertiary)] mb-1">Daniel</p>
                    <p className="font-mono font-bold text-lg" style={{ color: '#2563eb' }}>{formatCAD(row.d)}</p>
                  </div>
                </div>
                <div className="h-2 rounded-full overflow-hidden flex" style={{ border: '1.5px solid #18130e' }}>
                  <div style={{ width: `${mShare}%`, background: '#F07830', transition: 'width 0.6s ease' }} />
                  <div style={{ width: `${dShare}%`, background: '#2563eb', transition: 'width 0.6s ease' }} />
                </div>
              </div>
            );
          })}
          {/* Totals */}
          <div className="px-6 py-5 bg-[var(--bg-surface)]">
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-[var(--text-primary)] text-lg">Total Partner Payouts</p>
              <p className="text-xs text-[var(--text-tertiary)] font-mono">{mPct.toFixed(0)} / {dPct.toFixed(0)} split</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[var(--text-tertiary)] mb-1">Malachi</p>
                <p className="font-mono font-bold text-2xl" style={{ color: '#F07830' }}>{formatCAD(mTotal)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[var(--text-tertiary)] mb-1">Daniel</p>
                <p className="font-mono font-bold text-2xl" style={{ color: '#2563eb' }}>{formatCAD(dTotal)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-5">
        <div className="rounded-card border-[3px] border-[#18130e] bg-white shadow-card p-6">
          <h3 className="font-bold text-[var(--text-primary)] mb-1">Cumulative Earnings</h3>
          <p className="text-xs text-[var(--text-secondary)] mb-4">Running total over time for each partner</p>
          <PartnerEarningsLine data={cumulative ?? []} height={240} />
        </div>
        <div className="rounded-card border-[3px] border-[#18130e] bg-white shadow-card p-6">
          <h3 className="font-bold text-[var(--text-primary)] mb-1">Monthly Delta</h3>
          <p className="text-xs text-[var(--text-secondary)] mb-4">Who earned more each month (positive = Malachi ahead)</p>
          <MonthlyDeltaBar data={delta ?? []} height={240} />
        </div>
      </div>
    </PageWrapper>
  );
};
