import React from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Card } from '../components/ui/Card';
import { PartnerEarningsLine } from '../components/charts/PartnerEarningsLine';
import { MonthlyDeltaBar } from '../components/charts/MonthlyDeltaBar';
import { useEquityData, useCumulativeEarnings, useMonthlyDelta } from '../lib/api';
import { formatCAD } from '../lib/formatters';

export const EquityTracker: React.FC = () => {
  const { data: equity } = useEquityData();
  const { data: cumulative } = useCumulativeEarnings();
  const { data: delta } = useMonthlyDelta();

  const mTotal = equity?.malachi_total ?? 0;
  const dTotal = equity?.daniel_total ?? 0;
  const combined = mTotal + dTotal;
  const mPct = combined > 0 ? (mTotal / combined) * 100 : 50;
  const dPct = 100 - mPct;

  const diff = Math.abs(mTotal - dTotal);
  const leader = mTotal >= dTotal ? 'Malachi' : 'Daniel';
  const leaderColor = mTotal >= dTotal ? 'var(--malachi-color)' : 'var(--daniel-color)';
  const balanced = diff / Math.max(combined, 1) < 0.05;

  return (
    <PageWrapper title="Equity Tracker">
      {/* Hero */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {[
          { name: 'Malachi', total: mTotal, pct: mPct, color: 'var(--malachi-color)', workPay: equity?.malachi_work_pay ?? 0, sales: equity?.malachi_sales_commission ?? 0, mgmt: equity?.malachi_client_management ?? 0 },
          { name: 'Daniel', total: dTotal, pct: dPct, color: 'var(--daniel-color)', workPay: equity?.daniel_work_pay ?? 0, sales: equity?.daniel_sales_commission ?? 0, mgmt: equity?.daniel_client_management ?? 0 },
        ].map(p => (
          <Card key={p.name} className="border-t-2" style={{ borderTopColor: p.color }}>
            <p className="label-caps mb-2">{p.name}</p>
            <p className="font-mono text-4xl font-bold mb-1" style={{ color: p.color }}>{formatCAD(p.total)}</p>
            <p className="text-sm text-[var(--text-secondary)]">total earned</p>
            <p className="font-mono text-xl font-bold text-[var(--text-primary)] mt-3">{p.pct.toFixed(1)}%</p>
            <p className="text-xs text-[var(--text-secondary)]">of all partner payouts</p>
          </Card>
        ))}
      </div>

      {/* Ratio bar */}
      <Card className="mb-6">
        <p className="label-caps mb-3">Earnings Ratio</p>
        <div className="h-5 flex rounded-full overflow-hidden">
          <div style={{ width: `${mPct}%`, backgroundColor: 'var(--malachi-color)', transition: 'width 0.6s ease' }} />
          <div style={{ width: `${dPct}%`, backgroundColor: 'var(--daniel-color)', transition: 'width 0.6s ease' }} />
        </div>
        <div className="flex justify-between mt-2 text-xs font-mono">
          <span style={{ color: 'var(--malachi-color)' }}>Malachi {mPct.toFixed(1)}%</span>
          <span style={{ color: 'var(--daniel-color)' }}>Daniel {dPct.toFixed(1)}%</span>
        </div>
      </Card>

      {/* Balance indicator */}
      <Card className="mb-6">
        {balanced ? (
          <p className="text-sm text-[var(--green)]">Earnings are within 5% of each other. <span className="font-medium">Balanced.</span></p>
        ) : (
          <p className="text-sm text-[var(--text-secondary)]">
            Based on total earnings, <span className="font-medium" style={{ color: leaderColor }}>{leader}</span> has earned{' '}
            <span className="font-mono font-bold text-[var(--text-primary)]">{formatCAD(diff)}</span> more than their partner since you started.
          </p>
        )}
      </Card>

      {/* Category breakdown table */}
      <Card className="mb-6">
        <p className="label-caps mb-4">Earnings by Category</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border-strong)]">
              <th className="label-caps py-2 text-left">Category</th>
              <th className="label-caps py-2 text-right" style={{ color: 'var(--malachi-color)' }}>Malachi</th>
              <th className="label-caps py-2 text-right" style={{ color: 'var(--daniel-color)' }}>Daniel</th>
              <th className="label-caps py-2 text-right">Split</th>
            </tr>
          </thead>
          <tbody>
            {[
              { label: 'Work Pay', m: equity?.malachi_work_pay ?? 0, d: equity?.daniel_work_pay ?? 0 },
              { label: 'Sales Commission', m: equity?.malachi_sales_commission ?? 0, d: equity?.daniel_sales_commission ?? 0 },
              { label: 'Client Management', m: equity?.malachi_client_management ?? 0, d: equity?.daniel_client_management ?? 0 },
            ].map(row => {
              const total = row.m + row.d;
              const mSplit = total > 0 ? Math.round((row.m / total) * 100) : 50;
              return (
                <tr key={row.label} className="border-b border-[var(--border-default)] hover:bg-[var(--bg-subtle)]">
                  <td className="py-2.5 text-[var(--text-secondary)]">{row.label}</td>
                  <td className="py-2.5 text-right font-mono font-medium" style={{ color: 'var(--malachi-color)' }}>{formatCAD(row.m)}</td>
                  <td className="py-2.5 text-right font-mono font-medium" style={{ color: 'var(--daniel-color)' }}>{formatCAD(row.d)}</td>
                  <td className="py-2.5 text-right font-mono text-xs text-[var(--text-secondary)]">{mSplit}/{100 - mSplit}</td>
                </tr>
              );
            })}
            <tr className="border-t-2 border-[var(--border-strong)]">
              <td className="py-2.5 font-semibold text-[var(--text-primary)]">TOTAL</td>
              <td className="py-2.5 text-right font-mono font-bold" style={{ color: 'var(--malachi-color)' }}>{formatCAD(mTotal)}</td>
              <td className="py-2.5 text-right font-mono font-bold" style={{ color: 'var(--daniel-color)' }}>{formatCAD(dTotal)}</td>
              <td className="py-2.5 text-right font-mono text-xs text-[var(--text-secondary)]">{mPct.toFixed(0)}/{dPct.toFixed(0)}</td>
            </tr>
          </tbody>
        </table>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <p className="label-caps mb-4">Cumulative Earnings</p>
          <PartnerEarningsLine data={cumulative ?? []} height={240} />
        </Card>
        <Card>
          <p className="label-caps mb-4">Monthly Delta (who earned more)</p>
          <MonthlyDeltaBar data={delta ?? []} height={240} />
        </Card>
      </div>
    </PageWrapper>
  );
};
