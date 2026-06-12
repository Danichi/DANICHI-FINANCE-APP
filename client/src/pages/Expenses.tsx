import React, { useState } from 'react';
import { Plus, Trash2, Receipt, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageWrapper } from '../components/layout/PageWrapper';
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

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  software: { bg: 'rgba(37,99,235,0.1)', text: '#2563eb', border: '#2563eb' },
  ads: { bg: 'rgba(240,120,48,0.12)', text: '#F07830', border: '#F07830' },
  tools: { bg: 'rgba(202,138,4,0.1)', text: '#ca8a04', border: '#ca8a04' },
  office: { bg: 'rgba(107,94,84,0.1)', text: '#6b5e54', border: '#6b5e54' },
  other: { bg: 'rgba(107,94,84,0.1)', text: '#6b5e54', border: '#6b5e54' },
};

const PAID_BY_STYLES: Record<string, { bg: string; text: string }> = {
  malachi: { bg: 'rgba(240,120,48,0.12)', text: '#F07830' },
  daniel: { bg: 'rgba(37,99,235,0.1)', text: '#2563eb' },
  business: { bg: 'rgba(107,94,84,0.1)', text: '#6b5e54' },
};

export const Expenses: React.FC = () => {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    description: '', amount: '',
    category: 'software' as ExpenseCategory,
    type: 'standalone', paidBy: 'business' as PaidBy,
  });
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
    <PageWrapper>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="section-label mb-1">Business Costs</p>
          <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">Expenses</h1>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-pill transition-all hover:-translate-x-px hover:-translate-y-px"
          style={{ background: 'var(--accent-orange)', border: '2px solid #18130e', boxShadow: '3px 3px 0 #18130e' }}
        >
          <Plus size={14} /> Add Expense
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        <div className="rounded-card border-[3px] border-[#18130e] bg-white shadow-card p-6">
          <p className="section-label mb-2">This Month</p>
          <p className="font-mono font-bold text-3xl" style={{ color: '#dc2626' }}>{formatCAD(totalThisMonth)}</p>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-[var(--text-tertiary)]">
            <TrendingDown size={12} /> spent so far
          </div>
        </div>
        <div className="rounded-card border-[3px] border-[#18130e] bg-white shadow-card p-6">
          <p className="section-label mb-2">All-Time</p>
          <p className="font-mono font-bold text-3xl text-[var(--text-primary)]">{formatCAD(totalAllTime)}</p>
          <p className="text-xs text-[var(--text-tertiary)] font-medium mt-2">total expenses logged</p>
        </div>
        <div className="rounded-card border-[3px] border-[#18130e] bg-white shadow-card p-6">
          <p className="section-label mb-2">Entries</p>
          <p className="font-mono font-bold text-3xl text-[var(--text-primary)]">{data?.total ?? 0}</p>
          <p className="text-xs text-[var(--text-tertiary)] font-medium mt-2">expense records</p>
        </div>
      </div>

      {/* Expense list */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-card border-[3px] border-[var(--border-default)] bg-[var(--bg-surface)] h-20 animate-pulse" />
          ))}
        </div>
      ) : data?.data.length === 0 ? (
        <div className="rounded-card border-[3px] border-[#18130e] bg-white shadow-card p-16 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--bg-elevated)', border: '2px solid #18130e' }}>
            <Receipt size={24} className="text-[var(--accent-orange)]" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">No expenses yet</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-sm mx-auto">
            Track what you spend on software, ads, tools and other business costs.
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white rounded-pill hover:-translate-x-px hover:-translate-y-px transition-all"
            style={{ background: 'var(--accent-orange)', border: '2px solid #18130e', boxShadow: '3px 3px 0 #18130e' }}
          >
            <Plus size={14} /> Add First Expense
          </button>
        </div>
      ) : (
        <div className="rounded-card border-[3px] border-[#18130e] bg-white shadow-card overflow-hidden">
          {data?.data.map((e, i) => {
            const catStyle = CATEGORY_STYLES[e.category] ?? CATEGORY_STYLES.other;
            const paidStyle = PAID_BY_STYLES[e.paidBy] ?? PAID_BY_STYLES.business;
            const last = i === (data.data.length - 1);
            return (
              <motion.div
                key={e.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`flex items-center justify-between px-6 py-4 ${last ? '' : 'border-b-[2px] border-[var(--border-default)]'} hover:bg-[var(--bg-elevated)] transition-colors`}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div>
                    <p className="font-semibold text-[var(--text-primary)]">{e.description}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-pill capitalize" style={{ background: catStyle.bg, color: catStyle.text, border: `1.5px solid ${catStyle.border}` }}>
                        {e.category}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-pill capitalize" style={{ background: paidStyle.bg, color: paidStyle.text }}>
                        {e.paidBy}
                      </span>
                      <span className="text-xs text-[var(--text-tertiary)]">{formatDate(e.date)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <p className="font-mono font-bold text-lg" style={{ color: '#dc2626' }}>{formatCAD(e.amount)}</p>
                  <button
                    onClick={() => deleteExpense(e.id).then(() => toast('Expense deleted')).catch(() => toast('Error', 'error'))}
                    className="text-[var(--text-tertiary)] hover:text-red-600 transition-colors p-1"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add an Expense" width="md">
        <div className="p-6 flex flex-col gap-4">
          <Input
            label="What did you spend on?"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="e.g. Google Workspace subscription"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Amount" type="number" prefix="CA$" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            <Input label="Date" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Category</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value as ExpenseCategory }))}
                className="bg-white border-[2px] border-[#18130e] rounded-xl text-sm font-medium text-[var(--text-primary)] px-3 py-2.5 focus:border-[var(--accent-orange)] focus:outline-none capitalize"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Paid By</label>
              <select
                value={form.paidBy}
                onChange={e => setForm(f => ({ ...f, paidBy: e.target.value as PaidBy }))}
                className="bg-white border-[2px] border-[#18130e] rounded-xl text-sm font-medium text-[var(--text-primary)] px-3 py-2.5 focus:border-[var(--accent-orange)] focus:outline-none"
              >
                {PAID_BY.map(p => <option key={p.v} value={p.v}>{p.l}</option>)}
              </select>
            </div>
          </div>
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
              disabled={isPending || !form.description || !form.amount}
              className="flex-1 py-2.5 text-sm font-bold text-white rounded-pill transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-x-px hover:-translate-y-px"
              style={{ background: 'var(--accent-orange)', border: '2px solid #18130e', boxShadow: '3px 3px 0 #18130e' }}
            >
              {isPending ? 'Adding…' : 'Add Expense'}
            </button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
};
