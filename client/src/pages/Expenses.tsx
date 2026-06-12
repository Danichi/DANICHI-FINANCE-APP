import React, { useState } from 'react';
import { Plus, Trash2, Receipt } from 'lucide-react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { useExpenses, useCreateExpense, useDeleteExpense } from '../lib/api';
import { formatCAD, formatDate } from '../lib/formatters';
import { useToast } from '../components/ui/Toast';
import type { ExpenseCategory, PaidBy } from '../types';

const CATEGORIES: ExpenseCategory[] = ['software', 'ads', 'tools', 'office', 'other'];
const PAID_BY: { v: PaidBy; l: string }[] = [
  { v: 'malachi', l: 'Malachi' }, { v: 'daniel', l: 'Daniel' }, { v: 'business', l: 'Business' },
];

const categoryColor: Record<string, any> = {
  software: 'blue', ads: 'orange', tools: 'amber', office: 'default', other: 'default',
};

export const Expenses: React.FC = () => {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), description: '', amount: '', category: 'software' as ExpenseCategory, type: 'standalone', paidBy: 'business' as PaidBy });
  const { data, isLoading } = useExpenses();
  const { mutateAsync: createExpense, isPending } = useCreateExpense();
  const { mutateAsync: deleteExpense } = useDeleteExpense();
  const { toast } = useToast();

  const handleAdd = async () => {
    try {
      await createExpense({ ...form, amount: parseFloat(form.amount), type: form.type as any });
      setShowAdd(false);
      setForm({ date: new Date().toISOString().slice(0, 10), description: '', amount: '', category: 'software', type: 'standalone', paidBy: 'business' });
      toast('Expense added');
    } catch { toast('Failed to add expense', 'error'); }
  };

  const totalThisMonth = data?.data
    .filter(e => e.date.startsWith(new Date().toISOString().slice(0, 7)))
    .reduce((s, e) => s + e.amount, 0) ?? 0;

  const totalAllTime = data?.data.reduce((s, e) => s + e.amount, 0) ?? 0;

  return (
    <PageWrapper
      title="Expenses"
      action={<Button size="sm" onClick={() => setShowAdd(true)}><Plus size={14} /> Add Expense</Button>}
    >
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card padding="sm">
          <p className="label-caps mb-1">This Month</p>
          <p className="font-mono text-2xl font-bold text-[var(--red)]">{formatCAD(totalThisMonth)}</p>
        </Card>
        <Card padding="sm">
          <p className="label-caps mb-1">All-Time</p>
          <p className="font-mono text-2xl font-bold text-[var(--text-primary)]">{formatCAD(totalAllTime)}</p>
        </Card>
        <Card padding="sm">
          <p className="label-caps mb-1">Total Entries</p>
          <p className="font-mono text-2xl font-bold text-[var(--text-primary)]">{data?.total ?? 0}</p>
        </Card>
      </div>

      <Card padding="none">
        <table className="w-full">
          <thead>
            <tr className="bg-[var(--bg-elevated)] border-b border-[var(--border-strong)]">
              {['Date', 'Description', 'Category', 'Type', 'Paid By', 'Amount', ''].map(h => (
                <th key={h} className="label-caps px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-[var(--text-tertiary)] text-sm">Loading…</td></tr>
            ) : data?.data.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Receipt size={32} className="text-[var(--text-tertiary)]" />
                    <div>
                      <p className="text-sm font-medium text-[var(--text-secondary)]">No expenses yet</p>
                      <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Track business expenses here</p>
                    </div>
                    <Button size="sm" onClick={() => setShowAdd(true)}>Add Expense</Button>
                  </div>
                </td>
              </tr>
            ) : data?.data.map(e => (
              <tr key={e.id} className="border-b border-[var(--border-default)] hover:bg-[var(--bg-subtle)]">
                <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">{formatDate(e.date)}</td>
                <td className="px-4 py-3 text-sm text-[var(--text-primary)]">{e.description}</td>
                <td className="px-4 py-3"><Badge color={categoryColor[e.category]}>{e.category}</Badge></td>
                <td className="px-4 py-3"><Badge color={e.type === 'project' ? 'orange' : 'default'}>{e.type}</Badge></td>
                <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">{e.paidBy}</td>
                <td className="px-4 py-3 text-right font-mono text-sm font-bold text-[var(--red)]">{formatCAD(e.amount)}</td>
                <td className="px-4 py-3">
                  <button onClick={() => deleteExpense(e.id).then(() => toast('Deleted')).catch(() => toast('Error', 'error'))}>
                    <Trash2 size={14} className="text-[var(--text-tertiary)] hover:text-[var(--red)]" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Expense" width="md">
        <div className="p-6 flex flex-col gap-4">
          <Input label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Google Workspace" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Amount" type="number" prefix="CA$" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            <Input label="Date" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="label-caps">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as ExpenseCategory }))}
                className="bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-md text-sm text-[var(--text-primary)] px-3 py-2.5 focus:border-[var(--accent-orange)] focus:outline-none capitalize">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="label-caps">Paid By</label>
              <select value={form.paidBy} onChange={e => setForm(f => ({ ...f, paidBy: e.target.value as PaidBy }))}
                className="bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-md text-sm text-[var(--text-primary)] px-3 py-2.5 focus:border-[var(--accent-orange)] focus:outline-none">
                {PAID_BY.map(p => <option key={p.v} value={p.v}>{p.l}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button className="flex-1" loading={isPending} onClick={handleAdd} disabled={!form.description || !form.amount}>Add Expense</Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
};
