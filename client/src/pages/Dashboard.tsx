import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, TrendingUp, TrendingDown, Plus, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageWrapper } from '../components/layout/PageWrapper';
import { ProgressBar } from '../components/ui/ProgressBar';
import { MonthlyRevenueBar } from '../components/charts/MonthlyRevenueBar';
import { useDashboardStats, useMonthlyRevenue, useEquityData, useTransactions, useGoals, useGoalProgress } from '../lib/api';
import { useCountUp } from '../lib/countUp';
import { formatCAD, formatDate } from '../lib/formatters';

/* Animated dollar figure */
const BigMoney: React.FC<{ value: number; white?: boolean; orange?: boolean; className?: string }> = ({
  value, white, orange, className = '',
}) => {
  const n = useCountUp(value, 1200);
  return (
    <span className={`font-mono tabular-nums font-bold ${white ? 'text-white' : orange ? 'text-[var(--accent-orange)]' : 'text-[var(--text-primary)]'} ${className}`}>
      {formatCAD(n)}
    </span>
  );
};

/* Goal progress strip */
const GoalStrip: React.FC<{ goalId: string }> = ({ goalId }) => {
  const { data: goals } = useGoals('active');
  const goal = goals?.find(g => g.id === goalId);
  const { data: progress } = useGoalProgress(goalId);
  const navigate = useNavigate();
  if (!goal || !progress) return null;

  const pct = Math.min(100, progress.percentage);
  return (
    <div
      className="rounded-card border-[3px] border-[#18130e] bg-white shadow-card p-6 cursor-pointer hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-card-hover transition-all"
      onClick={() => navigate('/goals')}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="section-label mb-1">Active Goal</p>
          <p className="text-lg font-bold text-[var(--text-primary)]">{goal.name}</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-3xl font-bold text-[var(--accent-orange)]">{pct.toFixed(0)}%</p>
          <p className="text-xs text-[var(--text-tertiary)] font-medium">complete</p>
        </div>
      </div>
      <ProgressBar value={progress.currentAmount} max={goal.targetAmount} size="lg" color={pct >= 100 ? 'green' : 'orange'} />
      <div className="flex justify-between mt-3 text-sm font-medium">
        <span className="font-mono text-[var(--text-secondary)]">{formatCAD(progress.currentAmount)} earned</span>
        <span className="font-mono text-[var(--text-tertiary)]">Goal: {formatCAD(goal.targetAmount)}</span>
      </div>
    </div>
  );
};

/* Single payment row */
const PaymentRow: React.FC<{ tx: any; last?: boolean }> = ({ tx, last }) => {
  const navigate = useNavigate();
  return (
    <div
      className={`flex items-center justify-between px-6 py-5 cursor-pointer hover:bg-[var(--bg-elevated)] transition-colors ${last ? '' : 'border-b-[2px] border-[var(--border-default)]'}`}
      onClick={() => navigate(`/transactions/${tx.id}`)}
    >
      <div className="flex-1 min-w-0 mr-6">
        <p className="font-bold text-[var(--text-primary)] text-base truncate">{tx.clientName}</p>
        {tx.projectDescription && (
          <p className="text-sm text-[var(--text-secondary)] truncate mt-0.5">{tx.projectDescription}</p>
        )}
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-pill" style={{ background: 'rgba(240,120,48,0.12)', color: 'var(--accent-orange)', border: '1.5px solid var(--accent-orange)' }}>
            M {formatCAD(tx.malachiTotalPayout)}
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-pill" style={{ background: 'rgba(37,99,235,0.1)', color: 'var(--daniel-color)', border: '1.5px solid var(--daniel-color)' }}>
            D {formatCAD(tx.danielTotalPayout)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="text-right">
          <p className="font-mono font-bold text-lg text-[var(--text-primary)]">{formatCAD(tx.grossAmount)}</p>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{formatDate(tx.paymentDate)}</p>
        </div>
        <ArrowRight size={16} className="text-[var(--text-tertiary)]" />
      </div>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: stats } = useDashboardStats();
  const { data: monthly } = useMonthlyRevenue(12);
  const { data: equity } = useEquityData();
  const { data: txData } = useTransactions({ limit: 5, sort: 'newest' });
  const { data: goals } = useGoals('active');

  const activeGoal = goals?.find(g => g.type === 'monthly_revenue');

  const totalRevenue = stats?.totalRevenue ?? 0;
  const thisMonth = stats?.thisMonthRevenue ?? 0;
  const retained = stats?.totalBusinessRetained ?? 0;
  const mTotal = useCountUp(equity?.malachi_total ?? 0, 1200);
  const dTotal = useCountUp(equity?.daniel_total ?? 0, 1200);
  const mSum = (equity?.malachi_total ?? 0) + (equity?.daniel_total ?? 0);
  const mPct = mSum > 0 ? (equity?.malachi_total ?? 0) / mSum * 100 : 50;
  const dPct = 100 - mPct;
  const up = (stats?.monthChangePercent ?? 0) >= 0;

  return (
    <PageWrapper>
      {/* ── Hero ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-card border-[3px] border-[#18130e] bg-[var(--accent-orange)] shadow-card p-8 mb-8 relative overflow-hidden"
      >
        <div className="hero-card-orb" />
        <div className="relative z-10">
          <p className="text-white/70 font-semibold text-sm uppercase tracking-widest mb-1">All-Time Revenue</p>
          <BigMoney value={totalRevenue} white className="text-5xl lg:text-6xl" />
          <p className="text-white/70 text-sm mt-2 font-medium">generated by Danichi Media</p>
        </div>
      </motion.div>

      {/* ── This Month + Retained ─────────────── */}
      <div className="grid grid-cols-2 gap-5 mb-12">
        <div className="rounded-card border-[3px] border-[#18130e] bg-white shadow-card p-6">
          <p className="section-label mb-3">This Month</p>
          <BigMoney value={thisMonth} className="text-4xl" />
          <div className={`flex items-center gap-1.5 mt-3 text-sm font-semibold ${up ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
            {up ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
            {up ? '+' : ''}{stats?.monthChangePercent?.toFixed(1) ?? 0}% compared to last month
          </div>
        </div>
        <div className="rounded-card border-[3px] border-[#18130e] bg-white shadow-card p-6">
          <p className="section-label mb-3">Business Retained</p>
          <BigMoney value={retained} className="text-4xl" />
          <p className="text-sm text-[var(--text-secondary)] font-medium mt-3">sitting in the profit reserve</p>
        </div>
      </div>

      {/* ── Partner Earnings ──────────────────── */}
      <div className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-6">Partner Earnings</h2>
        <div className="grid grid-cols-2 gap-5">
          {[
            {
              name: 'Malachi', total: mTotal, pct: mPct, color: '#F07830',
              work: equity?.malachi_work_pay ?? 0,
              sales: equity?.malachi_sales_commission ?? 0,
              mgmt: equity?.malachi_client_management ?? 0,
            },
            {
              name: 'Daniel', total: dTotal, pct: dPct, color: '#2563eb',
              work: equity?.daniel_work_pay ?? 0,
              sales: equity?.daniel_sales_commission ?? 0,
              mgmt: equity?.daniel_client_management ?? 0,
            },
          ].map(p => (
            <div key={p.name} className="rounded-card border-[3px] border-[#18130e] bg-white shadow-card p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-3 h-3 rounded-full" style={{ background: p.color }} />
                <p className="font-bold text-[var(--text-primary)] text-lg">{p.name}</p>
                <span className="ml-auto text-xs font-bold px-2.5 py-1 rounded-pill" style={{ background: p.color + '18', color: p.color, border: `2px solid ${p.color}` }}>
                  {p.pct.toFixed(1)}% equity
                </span>
              </div>
              <p className="font-mono font-bold tabular-nums" style={{ color: p.color, fontSize: '2.25rem', lineHeight: 1 }}>
                {formatCAD(p.total)}
              </p>
              <div className="mt-5 flex flex-col gap-2">
                {[
                  { label: 'Work pay', val: p.work },
                  { label: 'Sales commission', val: p.sales },
                  { label: 'Client management', val: p.mgmt },
                ].map(row => (
                  <div key={row.label} className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">{row.label}</span>
                    <span className="font-mono font-semibold text-[var(--text-primary)]">{formatCAD(row.val)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Active Goal ───────────────────────── */}
      {activeGoal ? (
        <div className="mb-12">
          <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-6">Monthly Goal</h2>
          <GoalStrip goalId={activeGoal.id} />
        </div>
      ) : (
        <button
          onClick={() => navigate('/goals')}
          className="w-full mb-12 rounded-card p-6 flex items-center justify-between hover:bg-[var(--bg-elevated)] transition-colors"
          style={{ border: '3px dashed var(--border-default)', borderRadius: '20px', background: 'var(--bg-surface)' }}
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--bg-elevated)', border: '2px solid #18130e' }}>
              <Target size={18} className="text-[var(--accent-orange)]" />
            </div>
            <div className="text-left">
              <p className="font-bold text-[var(--text-primary)]">Set a monthly revenue goal</p>
              <p className="text-sm text-[var(--text-secondary)] mt-0.5">Track your progress toward a revenue target</p>
            </div>
          </div>
          <ArrowRight size={18} className="text-[var(--accent-orange)]" />
        </button>
      )}

      {/* ── Revenue Chart ─────────────────────── */}
      <div className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-6">Revenue Over Time</h2>
        <div className="rounded-card border-[3px] border-[#18130e] bg-white shadow-card p-6">
          <MonthlyRevenueBar data={monthly ?? []} height={280} />
        </div>
      </div>

      {/* ── Recent Payments ───────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold text-[var(--text-primary)]">Recent Payments</h2>
          <button
            onClick={() => navigate('/transactions')}
            className="flex items-center gap-1.5 text-sm font-bold text-[var(--accent-orange)] hover:underline"
          >
            View all <ArrowRight size={14} />
          </button>
        </div>

        {txData?.data.length === 0 ? (
          <div className="rounded-card border-[3px] border-[#18130e] bg-white shadow-card p-12 text-center">
            <p className="text-lg font-bold text-[var(--text-secondary)]">No payments logged yet</p>
            <p className="text-sm text-[var(--text-tertiary)] mt-1 mb-6">Log your first payment to start tracking your revenue</p>
            <button
              onClick={() => navigate('/transactions/new')}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white rounded-pill hover:-translate-x-px hover:-translate-y-px transition-all"
              style={{ background: 'var(--accent-orange)', border: '2px solid #18130e', boxShadow: '3px 3px 0 #18130e' }}
            >
              <Plus size={14} /> Log First Payment
            </button>
          </div>
        ) : (
          <div className="rounded-card border-[3px] border-[#18130e] bg-white shadow-card overflow-hidden">
            {txData?.data.map((tx, i) => (
              <PaymentRow key={tx.id} tx={tx} last={i === (txData.data.length - 1)} />
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};
