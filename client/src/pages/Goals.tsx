import React, { useState } from 'react';
import { Target, Plus, Check, Clock, Archive } from 'lucide-react';
import { useSettings } from '../lib/api';
import { motion } from 'framer-motion';
import { PageWrapper } from '../components/layout/PageWrapper';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { useGoals, useGoalProgress, useCreateGoal, useDeleteGoal } from '../lib/api';
import { formatCAD, formatDate } from '../lib/formatters';
import { useToast } from '../components/ui/Toast';
import type { GoalType } from '../types';

const STATUS_ICONS: Record<string, React.ReactNode> = {
  active: <Clock size={14} />,
  completed: <Check size={14} />,
  archived: <Archive size={14} />,
};

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  active: { bg: 'rgba(240,120,48,0.12)', text: '#F07830', border: '#F07830' },
  completed: { bg: 'rgba(22,163,74,0.1)', text: '#16a34a', border: '#16a34a' },
  missed: { bg: 'rgba(220,38,38,0.1)', text: '#dc2626', border: '#dc2626' },
  archived: { bg: 'rgba(107,94,84,0.1)', text: '#6b5e54', border: '#6b5e54' },
};

const GOAL_TYPE_LABELS: Record<string, string> = {
  monthly_revenue: 'Monthly Revenue',
  quarterly_revenue: 'Quarterly Revenue',
  malachi_earnings: 'Malachi Earnings',
  daniel_earnings: 'Daniel Earnings',
  custom: 'Custom',
};

const GoalCard: React.FC<{ goalId: string }> = ({ goalId }) => {
  const { data: goals } = useGoals();
  const goal = goals?.find(g => g.id === goalId);
  const { data: progress } = useGoalProgress(goalId);
  const { mutateAsync: deleteGoal } = useDeleteGoal();
  const { toast } = useToast();

  if (!goal) return null;

  const pct = Math.min(100, progress?.percentage ?? 0);
  const isAutoCalc = ['monthly_revenue', 'malachi_earnings', 'daniel_earnings', 'quarterly_revenue'].includes(goal.type);
  const current = isAutoCalc ? (progress?.currentAmount ?? 0) : goal.currentAmount;

  const now = new Date();
  const end = new Date(goal.periodEnd);
  const daysLeft = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const statusStyle = STATUS_COLORS[goal.status] ?? STATUS_COLORS.archived;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-card border-[3px] border-[#18130e] bg-white shadow-card p-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-pill"
              style={{ background: statusStyle.bg, color: statusStyle.text, border: `1.5px solid ${statusStyle.border}` }}
            >
              {STATUS_ICONS[goal.status]}
              {goal.status}
            </span>
            <span className="text-xs font-semibold text-[var(--text-tertiary)] bg-[var(--bg-surface)] border-[1.5px] border-[var(--border-default)] px-2.5 py-1 rounded-pill">
              {GOAL_TYPE_LABELS[goal.type] ?? goal.type}
            </span>
          </div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] leading-tight">{goal.name}</h3>
          {goal.description && (
            <p className="text-sm text-[var(--text-secondary)] mt-1">{goal.description}</p>
          )}
        </div>
        <div className="text-right ml-6 flex-shrink-0">
          <p className="font-mono text-4xl font-bold text-[var(--accent-orange)] leading-none">{pct.toFixed(0)}%</p>
          <p className="text-xs text-[var(--text-tertiary)] font-medium mt-1">complete</p>
        </div>
      </div>

      {/* Progress bar */}
      <ProgressBar value={current} max={goal.targetAmount} size="lg" color={pct >= 100 ? 'green' : 'orange'} />

      {/* Numbers */}
      <div className="flex justify-between mt-3 mb-5">
        <span className="font-mono font-semibold text-[var(--text-primary)]">{formatCAD(current)}</span>
        <span className="font-mono text-[var(--text-secondary)]">Target: {formatCAD(goal.targetAmount)}</span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t-[2px] border-[var(--border-default)]">
        <div>
          <p className="text-xs text-[var(--text-tertiary)] font-medium">
            {formatDate(goal.periodStart)} — {formatDate(goal.periodEnd)}
          </p>
          {goal.status === 'active' && daysLeft > 0 && (
            <p className="text-xs font-bold text-[var(--accent-orange)] mt-0.5">{daysLeft} days remaining</p>
          )}
        </div>
        <button
          onClick={() => deleteGoal(goalId).catch(() => toast('Error deleting goal', 'error'))}
          className="text-xs font-semibold text-[var(--text-tertiary)] hover:text-red-600 transition-colors"
        >
          Remove
        </button>
      </div>
    </motion.div>
  );
};

export const Goals: React.FC = () => {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: '', type: 'monthly_revenue' as GoalType,
    targetAmount: '',
    periodStart: new Date().toISOString().slice(0, 10),
    periodEnd: '', description: '',
  });
  const { data: goals, isLoading } = useGoals();
  const { data: settings } = useSettings();
  const { mutateAsync: createGoal, isPending } = useCreateGoal();
  const { toast } = useToast();

  const p1 = settings?.malachiName || 'Malachi';
  const p2 = settings?.danielName || 'Daniel';

  const active = goals?.filter(g => g.status === 'active') ?? [];
  const done = goals?.filter(g => g.status !== 'active') ?? [];

  const handleAdd = async () => {
    try {
      await createGoal({ ...form, targetAmount: parseFloat(form.targetAmount) });
      setShowAdd(false);
      setForm({ name: '', type: 'monthly_revenue', targetAmount: '', periodStart: new Date().toISOString().slice(0, 10), periodEnd: '', description: '' });
      toast('Goal created!');
    } catch { toast('Failed to create goal', 'error'); }
  };

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="section-label mb-1">Revenue Goals</p>
          <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">Goals</h1>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-pill transition-all hover:-translate-x-px hover:-translate-y-px"
          style={{ background: 'var(--accent-orange)', border: '2px solid #18130e', boxShadow: '3px 3px 0 #18130e' }}
        >
          <Plus size={14} /> New Goal
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-5">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="rounded-card border-[3px] border-[var(--border-default)] bg-[var(--bg-surface)] h-48 animate-pulse" />
          ))}
        </div>
      ) : goals?.length === 0 ? (
        <div className="rounded-card border-[3px] border-[#18130e] bg-[var(--bg-base)] shadow-card p-16 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--bg-elevated)', border: '2px solid var(--border-strong)' }}>
            <Target size={24} className="text-[var(--accent-orange)]" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Set your first goal</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-sm mx-auto">
            Goals help you and {p1} stay motivated and track your progress toward revenue milestones.
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white rounded-pill hover:-translate-x-px hover:-translate-y-px transition-all"
            style={{ background: 'var(--accent-orange)', border: '2px solid var(--border-strong)', boxShadow: '3px 3px 0 var(--border-strong)' }}
          >
            <Plus size={14} /> Create First Goal
          </button>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div className="mb-10">
              <h2 className="font-display text-xl font-bold text-[var(--text-primary)] mb-5">Active Goals</h2>
              <div className="flex flex-col gap-5">
                {active.map(g => <GoalCard key={g.id} goalId={g.id} />)}
              </div>
            </div>
          )}
          {done.length > 0 && (
            <div>
              <h2 className="font-display text-xl font-bold text-[var(--text-primary)] mb-5">Past Goals</h2>
              <div className="flex flex-col gap-4">
                {done.map(g => <GoalCard key={g.id} goalId={g.id} />)}
              </div>
            </div>
          )}
        </>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Create a Goal" width="md">
        <div className="p-6 flex flex-col gap-4">
          <Input
            label="Goal Name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Hit $20k in July"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Type</label>
            <select
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value as GoalType }))}
              className="bg-white border-[2px] border-[#18130e] rounded-xl text-sm font-medium text-[var(--text-primary)] px-3 py-2.5 focus:border-[var(--accent-orange)] focus:outline-none"
            >
              <option value="monthly_revenue">Monthly Revenue</option>
              <option value="quarterly_revenue">Quarterly Revenue</option>
              <option value="malachi_earnings">{p1} Earnings</option>
              <option value="daniel_earnings">{p2} Earnings</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <Input
            label="Target Amount"
            type="number"
            prefix="CA$"
            value={form.targetAmount}
            onChange={e => setForm(f => ({ ...f, targetAmount: e.target.value }))}
            placeholder="20000"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start Date" type="date" value={form.periodStart} onChange={e => setForm(f => ({ ...f, periodStart: e.target.value }))} />
            <Input label="End Date" type="date" value={form.periodEnd} onChange={e => setForm(f => ({ ...f, periodEnd: e.target.value }))} />
          </div>
          <Input
            label="Notes (optional)"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Any extra context…"
          />
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowAdd(false)}
              className="flex-1 py-2.5 text-sm font-semibold rounded-pill transition-all"
              style={{ border: '2px solid #18130e', boxShadow: '3px 3px 0 #18130e', background: '#fff' }}
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={isPending || !form.name || !form.targetAmount || !form.periodEnd}
              className="flex-1 py-2.5 text-sm font-bold text-white rounded-pill transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-x-px hover:-translate-y-px"
              style={{ background: 'var(--accent-orange)', border: '2px solid #18130e', boxShadow: '3px 3px 0 #18130e' }}
            >
              {isPending ? 'Creating…' : 'Create Goal'}
            </button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
};
