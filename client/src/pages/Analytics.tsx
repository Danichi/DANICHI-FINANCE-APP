import React, { useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Card } from '../components/ui/Card';
import { Tabs } from '../components/ui/Tabs';
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
    { name: 'Biz Reserve', value: breakdown.business_profit_reserve ?? 0, color: 'var(--accent-amber)' },
    { name: 'Client Mgmt', value: breakdown.client_management_fee ?? 0, color: '#8B5CF6' },
    { name: 'Sales Comm.', value: breakdown.sales_commission ?? 0, color: '#06B6D4' },
    { name: 'Malachi Work', value: breakdown.malachi_work_pay ?? 0, color: 'var(--malachi-color)' },
    { name: 'Daniel Work', value: breakdown.daniel_work_pay ?? 0, color: 'var(--daniel-color)' },
  ] : [];

  return (
    <PageWrapper title="Analytics">
      <Tabs tabs={TABS} active={tab} onChange={setTab} className="mb-6" />

      {tab === 'revenue' && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-4">
            <Card padding="sm">
              <p className="label-caps mb-1">Avg Transaction Value</p>
              <p className="font-mono text-2xl font-bold text-[var(--text-primary)]">{formatCAD(avgTx)}</p>
            </Card>
            <Card padding="sm">
              <p className="label-caps mb-1">Best Month</p>
              <p className="font-mono text-2xl font-bold text-[var(--green)]">{formatCAD(bestMonth?.gross_revenue ?? 0)}</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-0.5 font-mono">{bestMonth?.month || '—'}</p>
            </Card>
            <Card padding="sm">
              <p className="label-caps mb-1">Worst Month</p>
              <p className="font-mono text-2xl font-bold text-[var(--red)]">{formatCAD(worstMonth?.gross_revenue ?? 0)}</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-0.5 font-mono">{worstMonth?.month || '—'}</p>
            </Card>
          </div>
          <Card>
            <p className="label-caps mb-4">Monthly Revenue — Last 12 Months</p>
            <MonthlyRevenueBar data={monthly ?? []} height={320} />
          </Card>
        </div>
      )}

      {tab === 'partners' && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: 'Malachi', total: equity?.malachi_total ?? 0, color: 'var(--malachi-color)' },
              { name: 'Daniel', total: equity?.daniel_total ?? 0, color: 'var(--daniel-color)' },
            ].map(p => (
              <Card key={p.name} padding="sm" className="border-l-2" style={{ borderLeftColor: p.color }}>
                <p className="label-caps mb-1">{p.name} All-Time</p>
                <p className="font-mono text-3xl font-bold" style={{ color: p.color }}>{formatCAD(p.total)}</p>
              </Card>
            ))}
          </div>
          <Card>
            <p className="label-caps mb-4">Cumulative Earnings</p>
            <PartnerEarningsLine data={cumulative ?? []} height={280} />
          </Card>
          <Card>
            <p className="label-caps mb-4">Monthly Delta</p>
            <MonthlyDeltaBar data={delta ?? []} height={240} />
          </Card>
        </div>
      )}

      {tab === 'breakdown' && (
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <p className="label-caps mb-4">All-Time Allocation</p>
            <AllocationDonut data={donutBreakdown} height={280} />
          </Card>
          <Card>
            <p className="label-caps mb-3">Bucket Totals</p>
            <div className="flex flex-col gap-2">
              {donutBreakdown.map(d => (
                <div key={d.name} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-sm text-[var(--text-secondary)]">{d.name}</span>
                  </div>
                  <span className="font-mono text-sm font-medium text-[var(--text-primary)]">{formatCAD(d.value)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </PageWrapper>
  );
};
