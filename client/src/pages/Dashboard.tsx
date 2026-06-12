import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, TrendingUp, TrendingDown, ArrowRight,
  ArrowLeftRight, BarChart3, Scale, Receipt, Target, Users,
} from 'lucide-react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { Button } from '../components/ui/Button';
import { AllocationBar } from '../components/ui/AllocationBar';
import { ProgressBar } from '../components/ui/ProgressBar';
import { MonthlyRevenueBar } from '../components/charts/MonthlyRevenueBar';
import { AllocationDonut } from '../components/charts/AllocationDonut';
import {
  useDashboardStats, useMonthlyRevenue, useEquityData,
  useCategoryBreakdown, useTransactions, useGoals, useGoalProgress,
} from '../lib/api';
import { useCountUp } from '../lib/countUp';
import { formatCAD, formatDate } from '../lib/formatters';

const AnimatedMoney: React.FC<{ target: number; white?: boolean }> = ({ target, white }) => {
  const val = useCountUp(target, 1200);
  return (
    <span className={`font-mono text-3xl font-bold tabular-nums leading-none ${white ? 'text-white' : 'text-[var(--text-primary)]'}`}>
      {formatCAD(val)}
    </span>
  );
};

const ActiveGoalCard: React.FC<{ goalId: string }> = ({ goalId }) => {
  const { data: goals } = useGoals('active');
  const goal = goals?.find(g => g.id === goalId);
  const { data: progress } = useGoalProgress(goalId);
  if (!goal || !progress) return null;
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="section-label mb-1">Active Goal</p>
          <p className="text-base font-bold text-[var(--text-primary)]">{goal.name}</p>
        </div>
        <div className="text-right">
          <span className="font-mono text-3xl font-bold text-[var(--accent-orange)]">
            {progress.percentage.toFixed(0)}%
          </span>
          <p className="text-xs text-[var(--text-tertiary)] font-semibold mt-0.5">complete</p>
        </div>
      </div>
      <ProgressBar value={progress.currentAmount} max={goal.targetAmount} size="lg" color={progress.percentage >= 100 ? 'green' : 'orange'} />
      <div className="flex justify-between mt-3 text-sm text-[var(--text-secondary)]">
        <span className="font-mono font-semibold">{formatCAD(progress.currentAmount)}</span>
        <span className="font-mono">Target: {formatCAD(goal.targetAmount)}</span>
      </div>
    </Card>
  );
};

interface NavCardProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  desc: string;
  badge?: string;
  accent?: boolean;
}

const NavCard: React.FC<NavCardProps> = ({ to, icon, label, desc, badge, accent }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className={`text-left w-full rounded-card border-[3px] border-[#18130e] shadow-card p-5 transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-card-hover ${accent ? 'bg-[var(--accent-orange)]' : 'bg-white'}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl border-[2px] border-[#18130e] flex items-center justify-center flex-shrink-0 ${accent ? 'bg-white/20 text-white' : 'bg-[var(--bg-elevated)] text-[var(--accent-orange)]'}`}>
          {icon}
        </div>
        {badge && (
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-pill border-[2px] ${accent ? 'bg-white/20 text-white border-white/40' : 'bg-[var(--accent-orange-dim)] text-[var(--accent-orange)] border-[var(--accent-orange)]'}`}>
            {badge}
          </span>
        )}
      </div>
      <p className={`font-bold text-base mb-0.5 ${accent ? 'text-white' : 'text-[var(--text-primary)]'}`}>{label}</p>
      <p className={`text-xs font-medium ${accent ? 'text-white/75' : 'text-[var(--text-secondary)]'}`}>{desc}</p>
      <div className={`flex items-center gap-1 mt-3 text-xs font-semibold ${accent ? 'text-white/80' : 'text-[var(--accent-orange)]'}`}>
        Open <ArrowRight size={12} />
      </div>
    </button>
  );
};

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: stats } = useDashboardStats();
  const { data: monthlyData } = useMonthlyRevenue(12);
  const { data: equity } = useEquityData();
  const { data: breakdown } = useCategoryBreakdown();
  const { data: txData } = useTransactions({ limit: 5, sort: 'newest' });
  const { data: goals } = useGoals('active');

  const activeMonthlyGoal = goals?.find(g => g.type === 'monthly_revenue');

  const totalRevenue = stats?.totalRevenue ?? 0;
  const thisMonth = stats?.thisMonthRevenue ?? 0;
  const businessRetained = stats?.totalBusinessRetained ?? 0;
  const mTotal = useCountUp(equity?.malachi_total ?? 0, 1200);
  const dTotal = useCountUp(equity?.daniel_total ?? 0, 1200);

  const donutData = breakdown ? [
    { name: 'Biz Reserve', value: breakdown.business_profit_reserve ?? 0, color: '#F5A070' },
    { name: 'Client Mgmt', value: breakdown.client_management_fee ?? 0, color: '#8B5CF6' },
    { name: 'Sales Comm.', value: breakdown.sales_commission ?? 0, color: '#06B6D4' },
    { name: 'Malachi', value: breakdown.malachi_work_pay ?? 0, color: 'var(--malachi-color)' },
    { name: 'Daniel', value: breakdown.daniel_work_pay ?? 0, color: 'var(--daniel-color)' },
  ] : [];

  const mTotalSum = (equity?.malachi_total ?? 0) + (equity?.daniel_total ?? 0);
  const mEquityPct = mTotalSum > 0 ? ((equity?.malachi_total ?? 0) / mTotalSum * 100) : 50;
  const dEquityPct = 100 - mEquityPct;
  const changePositive = (stats?.monthChangePercent ?? 0) >= 0;

  return (
    <PageWrapper
      action={
        <Button onClick={() => navigate('/transactions/new')} size="lg">
          <Plus size={16} />
          Log Payment
        </Button>
      }
    >
      {/* Welcome */}
      <div className="mb-8">
        <p className="section-label mb-2">Danichi Media</p>
        <h1 className="font-display text-4xl font-bold text-[var(--text-primary)]">
          Finance <em className="font-serif not-italic text-[var(--accent-orange)]">Dashboard</em>
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">Your business at a glance</p>
      </div>

      {/* Hero Stats Row */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        <StatCard
          label="Total Business Revenue"
          value={<AnimatedMoney target={totalRevenue} />}
          sub={<span className="font-mono text-xs">all-time gross</span>}
          variant="orange"
          orb
        />
        <StatCard
          label="This Month"
          value={<AnimatedMoney target={thisMonth} />}
          sub={
            <span className={`text-xs font-semibold font-mono flex items-center gap-1 ${changePositive ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
              {changePositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {changePositive ? '+' : ''}{stats?.monthChangePercent?.toFixed(1) ?? 0}% vs last month
            </span>
          }
        />
        <StatCard
          label="Business Retained"
          value={<AnimatedMoney target={businessRetained} />}
          sub={<span className="font-mono text-xs">profit reserve</span>}
        />
      </div>

      {/* Navigation Cards Grid */}
      <div className="mb-8">
        <p className="section-label mb-4">Quick Access</p>
        <div className="grid grid-cols-3 gap-4">
          <NavCard
            to="/transactions"
            icon={<ArrowLeftRight size={18} />}
            label="Transactions"
            desc="Log and review all payments"
            accent
          />
          <NavCard
            to="/analytics"
            icon={<BarChart3 size={18} />}
            label="Analytics"
            desc="Revenue trends & breakdowns"
          />
          <NavCard
            to="/equity"
            icon={<Scale size={18} />}
            label="Equity Tracker"
            desc="Partner split balances"
            badge={`${mEquityPct.toFixed(0)}/${dEquityPct.toFixed(0)}`}
          />
          <NavCard
            to="/expenses"
            icon={<Receipt size={18} />}
            label="Expenses"
            desc="Track business spending"
          />
          <NavCard
            to="/goals"
            icon={<Target size={18} />}
            label="Goals"
            desc="Revenue & earnings targets"
          />
          <NavCard
            to="/clients"
            icon={<Users size={18} />}
            label="Clients"
            desc="Client history & revenue"
          />
        </div>
      </div>

      {/* Partner Equity */}
      <div className="grid grid-cols-2 gap-5 mb-8">
        {[
          {
            name: 'Malachi', total: mTotal, color: 'var(--malachi-color)', borderColor: '#F07830',
            workPay: equity?.malachi_work_pay ?? 0,
            salesComm: equity?.malachi_sales_commission ?? 0,
            clientMgmt: equity?.malachi_client_management ?? 0,
            equityPct: mEquityPct,
          },
          {
            name: 'Daniel', total: dTotal, color: 'var(--daniel-color)', borderColor: '#2563eb',
            workPay: equity?.daniel_work_pay ?? 0,
            salesComm: equity?.daniel_sales_commission ?? 0,
            clientMgmt: equity?.daniel_client_management ?? 0,
            equityPct: dEquityPct,
          },
        ].map(partner => (
          <Card key={partner.name}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div
                  className="inline-flex items-center gap-2 rounded-pill px-3 py-1 text-xs font-bold border-[2px] mb-2"
                  style={{ background: partner.borderColor + '18', color: partner.borderColor, borderColor: partner.borderColor }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: partner.borderColor }} />
                  {partner.name}
                </div>
                <div className="font-mono text-3xl font-bold tabular-nums" style={{ color: partner.borderColor }}>
                  {formatCAD(partner.total)}
                </div>
              </div>
              <div className="text-right">
                <p className="label-caps mb-1">Equity</p>
                <p className="font-mono text-2xl font-bold text-[var(--text-primary)]">{partner.equityPct.toFixed(1)}%</p>
              </div>
            </div>
            <AllocationBar
              segments={[
                { label: 'Work Pay', value: partner.workPay, color: partner.borderColor },
                { label: 'Sales', value: partner.salesComm, color: partner.borderColor + '99' },
                { label: 'Client Mgmt', value: partner.clientMgmt, color: partner.borderColor + '44' },
              ]}
              height={8}
              showLabels
            />
          </Card>
        ))}
      </div>

      {/* Active Goal */}
      {activeMonthlyGoal ? (
        <div className="mb-8">
          <ActiveGoalCard goalId={activeMonthlyGoal.id} />
        </div>
      ) : (
        <button
          onClick={() => navigate('/goals/new')}
          className="w-full mb-8 rounded-card border-[3px] border-dashed border-[var(--border-default)] p-5 text-left flex items-center justify-between hover:border-[var(--accent-orange)] hover:bg-[var(--bg-elevated)] transition-colors duration-150 bg-[var(--bg-surface)]"
          style={{ borderRadius: '20px' }}
        >
          <div>
            <p className="font-semibold text-[var(--text-secondary)]">Set a monthly revenue goal</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Track progress toward a revenue target</p>
          </div>
          <ArrowRight size={16} className="text-[var(--accent-orange)]" />
        </button>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-12 gap-5 mb-8">
        <Card className="col-span-8" padding="md">
          <p className="section-label mb-4">Monthly Revenue — Last 12 Months</p>
          <MonthlyRevenueBar data={monthlyData ?? []} height={260} />
        </Card>
        <Card className="col-span-4" padding="md">
          <p className="section-label mb-4">All-Time Allocation</p>
          <AllocationDonut data={donutData} height={200} />
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card padding="none">
        <div className="flex items-center justify-between px-6 py-4 border-b-[2px] border-[var(--border-default)]">
          <p className="section-label">Recent Transactions</p>
          <button
            onClick={() => navigate('/transactions')}
            className="text-xs font-bold text-[var(--accent-orange)] hover:underline flex items-center gap-1"
          >
            View all <ArrowRight size={12} />
          </button>
        </div>
        {txData?.data.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-[var(--text-tertiary)] font-semibold">No transactions yet</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">Log your first payment to see it here</p>
          </div>
        ) : (
          <div>
            {txData?.data.map((tx, i) => (
              <div
                key={tx.id}
                className={`flex items-center px-6 py-4 cursor-pointer transition-colors hover:bg-[var(--bg-elevated)] ${i < (txData.data.length - 1) ? 'border-b-[2px] border-[var(--border-default)]' : ''}`}
                onClick={() => navigate(`/transactions/${tx.id}`)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[var(--text-primary)] truncate">{tx.clientName}</p>
                  <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">{tx.projectDescription || '—'}</p>
                </div>
                <div className="flex items-center gap-6 ml-4">
                  <AllocationBar
                    segments={[
                      { label: 'Malachi', value: tx.malachiTotalPayout, color: 'var(--malachi-color)' },
                      { label: 'Daniel', value: tx.danielTotalPayout, color: 'var(--daniel-color)' },
                      { label: 'Business', value: tx.businessTotalRetained, color: 'var(--accent-amber)' },
                    ]}
                    height={8}
                    className="w-24"
                  />
                  <span className="font-mono text-sm font-bold text-[var(--text-primary)] w-28 text-right">
                    {formatCAD(tx.grossAmount)}
                  </span>
                  <span className="text-xs font-medium text-[var(--text-tertiary)] w-24 text-right">
                    {formatDate(tx.paymentDate)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </PageWrapper>
  );
};
