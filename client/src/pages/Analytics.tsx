import React, { useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { MonthlyRevenueBar } from '../components/charts/MonthlyRevenueBar';
import { AllocationDonut } from '../components/charts/AllocationDonut';
import { PartnerEarningsLine } from '../components/charts/PartnerEarningsLine';
import { MonthlyDeltaBar } from '../components/charts/MonthlyDeltaBar';
import { useMonthlyRevenue, useEquityData, useCategoryBreakdown, useCumulativeEarnings, useMonthlyDelta } from '../lib/api';
import { formatCAD } from '../lib/formatters';

const TABS = [
  { id: 'revenue', label: 'Revenue' },
  { id: 'partners', label: 'Partners' },
  { id: 'breakdown', label: 'Breakdown' },
];

const ChartCard: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
  <div className="rounded-card border-[3px] border-[#18130e] bg-white shadow-card p-6">
    <h3 className="font-bold text-[var(--text-primary)] text-lg mb-1">{title}</h3>
    {subtitle && <p className="text-xs text-[var(--text-secondary)] mb-4">{subtitle}</p>}
    {!subtitle && <div className="mb-4" />}
    {children}
  </div>
);

export const Analytics: React.FC = () => {
  const [tab, setTab] = useState('revenue');
  const { data: monthly } = useMonthlyRevenue(12);
  const { data: equity } = useEquityData();
  const { data: breakdown } = useCategoryBreakdown();
  const { data: cumulative } = useCumulativeEarnings();
  const { data: delta } = useMonthlyDelta();

  const avgTx = monthly && monthly.length > 0
    ? monthly.reduce((s, m) => s + (m.gross_revenue ?? 0), 0) / monthly.length
    : 0;
  const bestMonth = monthly?.reduce((best, m) => (m.gross_revenue ?? 0) > (best.gross_revenue ?? 0) ? m : best, monthly[0]);
  const worstMonth = monthly?.reduce((worst, m) => (m.gross_revenue ?? 0) < (worst.gross_revenue ?? 0) ? m : worst, monthly[0]);

  const donutBreakdown = breakdown ? [
    { name: 'Business Reserve', value: breakdown.business_profit_reserve ?? 0, color: '#e5a020' },
    { name: 'Client Management', value: breakdown.client_management_fee ?? 0, color: '#8B5CF6' },
    { name: 'Sales Commission', value: breakdown.sales_commission ?? 0, color: '#06B6D4' },
    { name: 'Malachi Work Pay', value: breakdown.malachi_work_pay ?? 0, color: '#F07830' },
    { name: 'Daniel Work Pay', value: breakdown.daniel_work_pay ?? 0, color: '#2563eb' },
  ] : [];

  return (
    <PageWrapper>
      {/* Header */}
      <div className="mb-8">
        <p className="section-label mb-1">Data & Insights</p>
        <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">Analytics</h1>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-8 p-1.5 rounded-2xl" style={{ background: 'var(--bg-surface)', border: '2px solid #18130e', display: 'inline-flex' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="px-5 py-2 text-sm font-bold rounded-xl transition-all"
            style={tab === t.id
              ? { background: 'var(--accent-orange)', color: '#fff', border: '2px solid #18130e', boxShadow: '2px 2px 0 #18130e' }
              : { color: 'var(--text-secondary)', border: '2px solid transparent' }
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'revenue' && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-3 gap-5">
            <div className="rounded-card border-[3px] border-[#18130e] bg-white shadow-card p-6">
              <p className="section-label mb-2">Avg Monthly Revenue</p>
              <p className="font-mono font-bold text-3xl text-[var(--text-primary)]">{formatCAD(avgTx)}</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-2 font-medium">over the last 12 months</p>
            </div>
            <div className="rounded-card border-[3px] border-[#18130e] bg-white shadow-card p-6">
              <p className="section-label mb-2">Best Month</p>
              <p className="font-mono font-bold text-3xl" style={{ color: '#16a34a' }}>{formatCAD(bestMonth?.gross_revenue ?? 0)}</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-2 font-mono">{bestMonth?.month ?? '—'}</p>
            </div>
            <div className="rounded-card border-[3px] border-[#18130e] bg-white shadow-card p-6">
              <p className="section-label mb-2">Slowest Month</p>
              <p className="font-mono font-bold text-3xl" style={{ color: '#dc2626' }}>{formatCAD(worstMonth?.gross_revenue ?? 0)}</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-2 font-mono">{worstMonth?.month ?? '—'}</p>
            </div>
          </div>
          <ChartCard title="Monthly Revenue" subtitle="Gross revenue for each of the last 12 months">
            <MonthlyRevenueBar data={monthly ?? []} height={320} />
          </ChartCard>
        </div>
      )}

      {tab === 'partners' && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-5">
            {[
              { name: 'Malachi', total: equity?.malachi_total ?? 0, color: '#F07830' },
              { name: 'Daniel', total: equity?.daniel_total ?? 0, color: '#2563eb' },
            ].map(p => (
              <div key={p.name} className="rounded-card border-[3px] border-[#18130e] bg-white shadow-card p-6 overflow-hidden relative">
                <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: p.color }} />
                <p className="section-label mb-2 mt-1">{p.name}</p>
                <p className="font-mono font-bold text-4xl" style={{ color: p.color }}>{formatCAD(p.total)}</p>
                <p className="text-sm text-[var(--text-secondary)] mt-2">all-time earnings</p>
              </div>
            ))}
          </div>
          <ChartCard title="Cumulative Earnings" subtitle="Running total for each partner over time">
            <PartnerEarningsLine data={cumulative ?? []} height={280} />
          </ChartCard>
          <ChartCard title="Monthly Delta" subtitle="Positive = Malachi earned more that month, negative = Daniel earned more">
            <MonthlyDeltaBar data={delta ?? []} height={240} />
          </ChartCard>
        </div>
      )}

      {tab === 'breakdown' && (
        <div className="grid grid-cols-2 gap-6">
          <ChartCard title="All-Time Allocation" subtitle="Where every dollar has gone since you started">
            <AllocationDonut data={donutBreakdown} height={280} />
          </ChartCard>
          <div className="rounded-card border-[3px] border-[#18130e] bg-white shadow-card p-6">
            <h3 className="font-bold text-[var(--text-primary)] text-lg mb-5">Bucket Totals</h3>
            <div className="space-y-3">
              {donutBreakdown.map(d => (
                <div key={d.name} className="flex items-center justify-between py-2 border-b-[2px] border-[var(--border-default)] last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                    <span className="text-sm font-semibold text-[var(--text-secondary)]">{d.name}</span>
                  </div>
                  <span className="font-mono font-bold text-[var(--text-primary)]">{formatCAD(d.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};
