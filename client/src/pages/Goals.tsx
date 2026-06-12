import React, { useState } from 'react';
import { Target, Plus } from 'lucide-react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { useGoals, useGoalProgress, useCreateGoal, useDeleteGoal } from '../lib/api';
import { formatCAD, formatDate } from '../lib/formatters';
import { useToast } from '../components/ui/Toast';
import type { GoalType } from '../types';

const GoalCard: React.FC<{ goalId: string }> = ({ goalId }) => {
  const { data: goals } = useGoals();
  const goal = goals?.find(g => g.id === goalId);
  const { data: progress } = useGoalProgress(goalId);
  const { mutateAsync: deleteGoal } = useDeleteGoal();
  const { toast } = useToast();

  if (!goal) return null;
  const pct = progress?.percentage ?? 0;
  const isAutoCalc = ['monthly_revenue', 'malachi_earnings', 'daniel_earnings', 'quarterly_revenue'].includes(goal.type);
  const current = isAutoCalc ? (progress?.currentAmount ?? 0) : goal.currentAmount;

  const statusColors: Record<string, any> = { active: 'orange', completed: 'green', missed: 'red', archived: 'default' };
  const now = new Date();
  const end = new Date(goal.periodEnd);
  const daysLeft = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge color={statusColors[goal.status]}>{goal.status}</Badge>
            <Badge color="default">{goal.type.replace(/_/g, ' ')}</Badge>
          </div>
          <h3 className="text-base font-medium text-[var(--text-primary)] mt-1">{goal.name}</h3>
          {goal.description && <p className="text-xs text-[var(--text-secondary)] mt-0.5">{goal.description}</p>}
        </div>
        <div className="text-right ml-4 flex-shrink-0">
          <p className="font-mono text-2xl font-bold text-[var(--text-primary)]">{pct.toFixed(0)}%</p>
          {daysLeft > 0 && goal.status === 'active' && (
            <p className="text-xs text-[var(--text-tertiary)]">{daysLeft}d left</p>
          )}
        </div>
      </div>
      <ProgressBar value={current} max={goal.targetAmount} size="md" color={pct >= 100 ? 'green' : 'orange'} className="mb-2" />
      <div className="flex justify-between text-xs">
        <span className="font-mono text-[var(--text-secondary)]">{formatCAD(current)}</span>
        <span className="font-mono text-[var(--text-tertiary)]">target: {formatCAD(goal.targetAmount)}</span>
      </div>
      <div className="flex justify-between mt-3 text-xs text-[var(--text-tertiary)]">
        <span>{formatDate(goal.periodStart)} — {formatDate(goal.periodEnd)}</span>
        <button onClick={() => deleteGoal(goalId).catch(() => toast('Error', 'error'))} className="text-[var(--text-tertiary)] hover:text-[var(--red)] transition-colors">Delete</button>
      </div>
    </Card>
  );
};

export const Goals: React.FC = () => {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'monthly_revenue' as GoalType, targetAmount: '', periodStart: new Date().toISOString().slice(0, 10), periodEnd: '', description: '' });
  const { data: goals } = useGoals();
  const { mutateAsync: createGoal, isPending } = useCreateGoal();
  const { toast } = useToast();

  const handleAdd = async () => {
    try {
      await createGoal({ ...form, targetAmount: parseFloat(form.targetAmount) });
      setShowAdd(false);
      toast('Goal created');
    } catch { toast('Failed to create goal', 'error'); }
  };

  return (
    <PageWrapper
      title="Goals"
      action={<Button size="sm" onClick={() => setShowAdd(true)}><Plus size={14} /> New Goal</Button>}
    >
      {goals?.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16">
          <Target size={48} className="text-[var(--text-tertiary)]" />
          <div className="text-center">
            <p className="text-sm font-medium text-[var(--text-secondary)]">No goals set</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Set a revenue or earnings goal to track your progress</p>
          </div>
          <Button onClick={() => setShowAdd(true)}>Set First Goal</Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {goals?.map(g => <GoalCard key={g.id} goalId={g.id} />)}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="New Goal" width="md">
        <div className="p-6 flex flex-col gap-4">
          <Input label="Goal Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Monthly Revenue Goal — July" />
          <div className="flex flex-col gap-1.5">
            <label className="label-caps">Type</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as GoalType }))}
              className="bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-md text-sm text-[var(--text-primary)] px-3 py-2.5 focus:border-[var(--accent-orange)] focus:outline-none">
              <option value="monthly_revenue">Monthly Revenue</option>
              <option value="quarterly_revenue">Quarterly Revenue</option>
              <option value="malachi_earnings">Malachi Earnings</option>
              <option value="daniel_earnings">Daniel Earnings</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <Input label="Target Amount" type="number" prefix="CA$" value={form.targetAmount} onChange={e => setForm(f => ({ ...f, targetAmount: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start Date" type="date" value={form.periodStart} onChange={e => setForm(f => ({ ...f, periodStart: e.target.value }))} />
            <Input label="End Date" type="date" value={form.periodEnd} onChange={e => setForm(f => ({ ...f, periodEnd: e.target.value }))} />
          </div>
          <Input label="Description (optional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional notes" />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button className="flex-1" loading={isPending} onClick={handleAdd} disabled={!form.name || !form.targetAmount || !form.periodEnd}>Create Goal</Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
};
