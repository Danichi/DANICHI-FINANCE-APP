import React from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { AllocationBar } from '../../ui/AllocationBar';
import type { FormState } from './index';
import type { SplitResult } from '../../../types';
import { formatCAD } from '../../../lib/formatters';

interface Props {
  state: FormState;
  splitResult: SplitResult | null;
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
}

const LineItem: React.FC<{ label: string; sub?: string; amount: number; amountColor?: string; indent?: boolean; bold?: boolean }> = ({
  label, sub, amount, amountColor, indent, bold,
}) => (
  <div className={`flex items-baseline justify-between py-2 ${indent ? 'pl-4' : ''}`}>
    <div>
      <span className={`text-sm ${bold ? 'font-semibold text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>{label}</span>
      {sub && <span className="ml-2 text-xs text-[var(--text-tertiary)]">{sub}</span>}
    </div>
    <span
      className={`font-mono text-sm ${bold ? 'font-bold' : 'font-medium'}`}
      style={{ color: amountColor || 'var(--text-primary)' }}
    >
      {formatCAD(amount)}
    </span>
  </div>
);

export const Step4Review: React.FC<Props> = ({ state, splitResult: r, onBack, onSubmit, loading }) => {
  if (!r) return null;

  const allocBar = [
    { label: 'Business', value: r.businessTotalRetained, color: 'var(--accent-amber)' },
    { label: 'Malachi', value: r.malachiTotalPayout, color: 'var(--malachi-color)' },
    { label: 'Daniel', value: r.danielTotalPayout, color: 'var(--daniel-color)' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-display text-xl">Payment Breakdown</h2>
          <span className="font-mono text-2xl font-bold text-[var(--text-primary)]">{formatCAD(r.grossAmount)}</span>
        </div>

        <div className="text-xs label-caps mb-1">From: {state.clientName}</div>
        {state.projectDescription && <p className="text-sm text-[var(--text-secondary)] mb-4">{state.projectDescription}</p>}

        <div className="border-t border-[var(--border-default)]">
          {r.expenseDeduction > 0 && (
            <LineItem label="Expense Deduction" amount={-r.expenseDeduction} amountColor="var(--red)" />
          )}
          <LineItem label="Business Profit Reserve" sub="10%" amount={r.businessProfitReserve} amountColor="var(--accent-amber)" />

          {r.clientManagementToMalachi > 0 && (
            <LineItem label="Client Management (Malachi)" sub="10%" amount={r.clientManagementToMalachi} amountColor="var(--malachi-color)" />
          )}
          {r.clientManagementToDaniel > 0 && (
            <LineItem label="Client Management (Daniel)" sub="10%" amount={r.clientManagementToDaniel} amountColor="var(--daniel-color)" />
          )}

          {r.salesCommissionToMalachi > 0 && (
            <LineItem label="Sales Commission (Malachi)" sub="20%" amount={r.salesCommissionToMalachi} amountColor="var(--malachi-color)" />
          )}
          {r.salesCommissionToDaniel > 0 && (
            <LineItem label="Sales Commission (Daniel)" sub="20%" amount={r.salesCommissionToDaniel} amountColor="var(--daniel-color)" />
          )}

          <div className="border-t border-dashed border-[var(--border-strong)] my-2" />

          <LineItem
            label="Work Pool"
            sub="60%"
            amount={r.workPool}
            bold
          />
          <LineItem
            label="Malachi"
            sub={state.workSplitMode === 'hourly'
              ? `${r.malachiWorkPercentage.toFixed(0)}% / ${state.malachiHours}hrs`
              : `${r.malachiWorkPercentage.toFixed(0)}%`
            }
            amount={r.malachiWorkPayout}
            amountColor="var(--malachi-color)"
            indent
          />
          <LineItem
            label="Daniel"
            sub={state.workSplitMode === 'hourly'
              ? `${r.danielWorkPercentage.toFixed(0)}% / ${state.danielHours}hrs`
              : `${r.danielWorkPercentage.toFixed(0)}%`
            }
            amount={r.danielWorkPayout}
            amountColor="var(--daniel-color)"
            indent
          />
        </div>

        <div className="border-t-2 border-[var(--border-strong)] mt-3 pt-4 grid grid-cols-3 gap-3">
          {[
            { label: 'MALACHI TOTAL', amount: r.malachiTotalPayout, color: 'var(--malachi-color)' },
            { label: 'DANIEL TOTAL', amount: r.danielTotalPayout, color: 'var(--daniel-color)' },
            { label: 'BUSINESS TOTAL', amount: r.businessTotalRetained, color: 'var(--accent-amber)' },
          ].map(item => (
            <div key={item.label} className="text-center">
              <p className="label-caps mb-1">{item.label}</p>
              <p className="font-mono text-lg font-bold" style={{ color: item.color }}>{formatCAD(item.amount)}</p>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <AllocationBar segments={allocBar} height={10} showLabels />
        </div>
      </Card>

      {r.explanation && (
        <Card padding="sm">
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{r.explanation}</p>
        </Card>
      )}

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack} className="flex-1" disabled={loading}>Back</Button>
        <Button onClick={onSubmit} loading={loading} className="flex-1 text-base" size="lg">Save Transaction</Button>
      </div>
    </div>
  );
};
