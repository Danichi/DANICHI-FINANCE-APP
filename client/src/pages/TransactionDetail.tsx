import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { AllocationBar } from '../components/ui/AllocationBar';
import { AllocationDonut } from '../components/charts/AllocationDonut';
import { PartnerBadge } from '../components/ui/PartnerBadge';
import { useTransaction, useDeleteTransaction } from '../lib/api';
import { formatCAD, formatDate } from '../lib/formatters';
import { useToast } from '../components/ui/Toast';

const LineItem: React.FC<{ label: string; sub?: string; amount: number; color?: string }> = ({ label, sub, amount, color }) => (
  <div className="flex items-baseline justify-between py-2 border-b border-[var(--border-default)] last:border-0">
    <div>
      <span className="text-sm text-[var(--text-secondary)]">{label}</span>
      {sub && <span className="ml-2 text-xs text-[var(--text-tertiary)]">{sub}</span>}
    </div>
    <span className="font-mono text-sm font-medium" style={{ color: color || 'var(--text-primary)' }}>{formatCAD(amount)}</span>
  </div>
);

export const TransactionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: tx, isLoading } = useTransaction(id!);
  const { mutateAsync: deleteTx } = useDeleteTransaction();
  const { toast } = useToast();
  const [showHowCalc, setShowHowCalc] = useState(false);

  if (isLoading) return <div className="text-[var(--text-tertiary)] text-sm p-8">Loading…</div>;
  if (!tx) return <div className="text-[var(--red)] text-sm p-8">Transaction not found.</div>;

  const donutData = [
    { name: 'Biz Reserve', value: tx.businessTotalRetained, color: 'var(--accent-amber)' },
    { name: 'Malachi', value: tx.malachiTotalPayout, color: 'var(--malachi-color)' },
    { name: 'Daniel', value: tx.danielTotalPayout, color: 'var(--daniel-color)' },
  ];

  const handleDelete = async () => {
    if (!confirm('Delete this transaction? This cannot be undone.')) return;
    try {
      await deleteTx(tx.id);
      toast('Transaction deleted');
      navigate('/transactions');
    } catch {
      toast('Failed to delete transaction', 'error');
    }
  };

  return (
    <PageWrapper>
      <div className="grid grid-cols-12 gap-6">
        {/* Left column */}
        <div className="col-span-7">
          <button onClick={() => navigate('/transactions')} className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 transition-colors">
            <ArrowLeft size={14} /> Back to Transactions
          </button>

          <div className="mb-6">
            <h1 className="font-display text-2xl text-[var(--text-primary)]">{tx.clientName}</h1>
            {tx.projectDescription && <p className="text-[var(--text-secondary)] mt-1">{tx.projectDescription}</p>}
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <Card padding="sm">
              <p className="label-caps mb-1">Date</p>
              <p className="text-sm text-[var(--text-primary)]">{formatDate(tx.paymentDate)}</p>
            </Card>
            <Card padding="sm">
              <p className="label-caps mb-1">Client Manager</p>
              <PartnerBadge assignment={tx.clientManagerAssignment} />
            </Card>
            <Card padding="sm">
              <p className="label-caps mb-1">Sales Commission</p>
              <PartnerBadge assignment={tx.salesCommissionAssignment} />
            </Card>
          </div>

          {/* Breakdown */}
          <Card className="mb-4">
            <div className="flex items-baseline justify-between mb-4">
              <h3 className="font-display text-lg">Financial Breakdown</h3>
              <span className="font-mono text-xl font-bold text-[var(--text-primary)]">{formatCAD(tx.grossAmount)}</span>
            </div>
            {tx.expenseDeduction > 0 && <LineItem label="Expense Deduction" amount={-tx.expenseDeduction} color="var(--red)" />}
            <LineItem label="Business Profit Reserve" sub="10%" amount={tx.businessProfitReserve} color="var(--accent-amber)" />
            {tx.clientManagementToMalachi > 0 && <LineItem label="Client Management → Malachi" sub="10%" amount={tx.clientManagementToMalachi} color="var(--malachi-color)" />}
            {tx.clientManagementToDaniel > 0 && <LineItem label="Client Management → Daniel" sub="10%" amount={tx.clientManagementToDaniel} color="var(--daniel-color)" />}
            {tx.salesCommissionToMalachi > 0 && <LineItem label="Sales Commission → Malachi" sub="20%" amount={tx.salesCommissionToMalachi} color="var(--malachi-color)" />}
            {tx.salesCommissionToDaniel > 0 && <LineItem label="Sales Commission → Daniel" sub="20%" amount={tx.salesCommissionToDaniel} color="var(--daniel-color)" />}
            <LineItem label="Work Pool" sub="60%" amount={tx.workPool} />
            <LineItem
              label="  Malachi"
              sub={tx.workSplitMode === 'hourly' ? `${tx.malachiWorkPercentage?.toFixed(0)}% / ${tx.malachiHours}hrs` : `${tx.malachiWorkPercentage?.toFixed(0)}%`}
              amount={tx.malachiWorkPayout}
              color="var(--malachi-color)"
            />
            <LineItem
              label="  Daniel"
              sub={tx.workSplitMode === 'hourly' ? `${tx.danielWorkPercentage?.toFixed(0)}% / ${tx.danielHours}hrs` : `${tx.danielWorkPercentage?.toFixed(0)}%`}
              amount={tx.danielWorkPayout}
              color="var(--daniel-color)"
            />
            <div className="pt-3 mt-2 grid grid-cols-3 gap-2">
              {[
                { l: 'Malachi', a: tx.malachiTotalPayout, c: 'var(--malachi-color)' },
                { l: 'Daniel', a: tx.danielTotalPayout, c: 'var(--daniel-color)' },
                { l: 'Business', a: tx.businessTotalRetained, c: 'var(--accent-amber)' },
              ].map(i => (
                <div key={i.l} className="text-center border border-[var(--border-default)] rounded-lg py-2">
                  <p className="label-caps">{i.l}</p>
                  <p className="font-mono text-base font-bold mt-1" style={{ color: i.c }}>{formatCAD(i.a)}</p>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <AllocationBar
                segments={[
                  { label: 'Malachi', value: tx.malachiTotalPayout, color: 'var(--malachi-color)' },
                  { label: 'Daniel', value: tx.danielTotalPayout, color: 'var(--daniel-color)' },
                  { label: 'Business', value: tx.businessTotalRetained, color: 'var(--accent-amber)' },
                ]}
                height={8}
                showLabels
              />
            </div>
          </Card>

          {/* Explanation */}
          {tx.explanation && (
            <Card padding="sm" className="mb-4">
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{tx.explanation}</p>
            </Card>
          )}

          {/* How it was calculated accordion */}
          <Card padding="sm" className="mb-6">
            <button
              className="flex items-center justify-between w-full text-sm font-medium text-[var(--text-secondary)]"
              onClick={() => setShowHowCalc(!showHowCalc)}
            >
              <span>How it was calculated</span>
              {showHowCalc ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {showHowCalc && (
              <div className="mt-3 text-xs text-[var(--text-secondary)] space-y-1.5">
                <p>1. Gross amount: <span className="font-mono">{formatCAD(tx.grossAmount)}</span></p>
                {tx.expenseDeduction > 0 && <p>2. Less expenses: <span className="font-mono text-[var(--red)]">-{formatCAD(tx.expenseDeduction)}</span> → Net: <span className="font-mono">{formatCAD(tx.netAmount)}</span></p>}
                <p>{tx.expenseDeduction > 0 ? '3' : '2'}. Business Profit Reserve = 10% × {formatCAD(tx.netAmount)} = <span className="font-mono">{formatCAD(tx.businessProfitReserve)}</span></p>
                <p>{tx.expenseDeduction > 0 ? '4' : '3'}. Client Management = 10% × {formatCAD(tx.netAmount)} = <span className="font-mono">{formatCAD(tx.clientManagementFee)}</span> → {tx.clientManagerAssignment}</p>
                <p>{tx.expenseDeduction > 0 ? '5' : '4'}. Sales Commission = 20% × {formatCAD(tx.netAmount)} = <span className="font-mono">{formatCAD(tx.salesCommission)}</span> → {tx.salesCommissionAssignment}</p>
                <p>{tx.expenseDeduction > 0 ? '6' : '5'}. Work Pool = 60% = <span className="font-mono">{formatCAD(tx.workPool)}</span></p>
                <p>{tx.expenseDeduction > 0 ? '7' : '6'}. Malachi work = {tx.malachiWorkPercentage?.toFixed(0)}% × {formatCAD(tx.workPool)} = <span className="font-mono">{formatCAD(tx.malachiWorkPayout)}</span></p>
                <p>{tx.expenseDeduction > 0 ? '8' : '7'}. Daniel work = {tx.danielWorkPercentage?.toFixed(0)}% × {formatCAD(tx.workPool)} = <span className="font-mono">{formatCAD(tx.danielWorkPayout)}</span></p>
              </div>
            )}
          </Card>

          <div className="flex gap-3">
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 size={14} /> Delete
            </Button>
          </div>
        </div>

        {/* Right column */}
        <div className="col-span-5">
          <Card className="mb-4">
            <p className="label-caps mb-4">Allocation Breakdown</p>
            <AllocationDonut data={donutData} height={200} />
          </Card>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Malachi Total', amount: tx.malachiTotalPayout, color: 'var(--malachi-color)' },
              { label: 'Daniel Total', amount: tx.danielTotalPayout, color: 'var(--daniel-color)' },
            ].map(item => (
              <Card key={item.label} padding="sm" className="text-center border-t-2" style={{ borderTopColor: item.color }}>
                <p className="label-caps mb-1">{item.label}</p>
                <p className="font-mono text-xl font-bold" style={{ color: item.color }}>{formatCAD(item.amount)}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};
