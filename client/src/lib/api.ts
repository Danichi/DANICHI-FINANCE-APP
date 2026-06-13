import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  Transaction, TransactionFilters, PaginatedResponse,
  Expense, Goal, Client, AppSettings, RolePreset,
  MonthlyRevenueData, EquityData, CategoryBreakdown,
} from '../types';

const BASE = (import.meta.env.VITE_API_URL ?? '') + '/api';

async function apiFetch<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(BASE + url, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'API error');
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ─── Transactions ─────────────────────────────────────────────────────────
export function useTransactions(filters: TransactionFilters = {}) {
  const params = new URLSearchParams();
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.set('dateTo', filters.dateTo);
  if (filters.client) params.set('client', filters.client);
  if (filters.sort) params.set('sort', filters.sort);
  params.set('page', String(filters.page ?? 1));
  params.set('limit', String(filters.limit ?? 20));
  return useQuery<PaginatedResponse<Transaction>>({
    queryKey: ['transactions', filters],
    queryFn: () => apiFetch(`/transactions?${params}`),
  });
}

export function useTransaction(id: string) {
  return useQuery<Transaction>({
    queryKey: ['transactions', id],
    queryFn: () => apiFetch(`/transactions/${id}`),
    enabled: !!id,
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Transaction> & Record<string, any>) =>
      apiFetch<Transaction>('/transactions', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
      qc.invalidateQueries({ queryKey: ['goals'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/transactions/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Transaction> & { id: string }) =>
      apiFetch<Transaction>(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['transactions', vars.id] });
      qc.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

// ─── Expenses ─────────────────────────────────────────────────────────────
export function useExpenses(filters: { type?: string; category?: string; dateFrom?: string; dateTo?: string; page?: number } = {}) {
  const params = new URLSearchParams();
  if (filters.type) params.set('type', filters.type);
  if (filters.category) params.set('category', filters.category);
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.set('dateTo', filters.dateTo);
  params.set('page', String(filters.page ?? 1));
  return useQuery({
    queryKey: ['expenses', filters],
    queryFn: () => apiFetch<PaginatedResponse<Expense>>(`/expenses?${params}`),
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Expense>) =>
      apiFetch<Expense>('/expenses', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/expenses/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  });
}

// ─── Goals ────────────────────────────────────────────────────────────────
export function useGoals(status?: string) {
  const params = status ? `?status=${status}` : '';
  return useQuery<Goal[]>({
    queryKey: ['goals', status],
    queryFn: () => apiFetch(`/goals${params}`),
  });
}

export function useGoalProgress(id: string) {
  return useQuery<{ currentAmount: number; targetAmount: number; percentage: number }>({
    queryKey: ['goals', id, 'progress'],
    queryFn: () => apiFetch(`/goals/${id}/progress`),
    enabled: !!id,
    refetchInterval: 30000,
  });
}

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Goal>) =>
      apiFetch<Goal>('/goals', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  });
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Goal> & { id: string }) =>
      apiFetch<Goal>(`/goals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/goals/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  });
}

// ─── Clients ──────────────────────────────────────────────────────────────
export function useClients() {
  return useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: () => apiFetch('/clients'),
  });
}

export function useClient(id: string) {
  return useQuery<Client>({
    queryKey: ['clients', id],
    queryFn: () => apiFetch(`/clients/${id}`),
    enabled: !!id,
  });
}

// ─── Analytics ────────────────────────────────────────────────────────────
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => apiFetch<{
      totalRevenue: number;
      totalBusinessRetained: number;
      thisMonthRevenue: number;
      lastMonthRevenue: number;
      monthChangePercent: number;
    }>('/analytics/dashboard'),
    staleTime: 30000,
  });
}

export function useMonthlyRevenue(months = 12) {
  return useQuery<MonthlyRevenueData[]>({
    queryKey: ['analytics', 'monthly-revenue', months],
    queryFn: () => apiFetch(`/analytics/monthly-revenue?months=${months}`),
    staleTime: 60000,
  });
}

export function useEquityData() {
  return useQuery({
    queryKey: ['analytics', 'equity'],
    queryFn: () => apiFetch<EquityData>('/analytics/equity'),
    staleTime: 60000,
  });
}

export function useCategoryBreakdown() {
  return useQuery({
    queryKey: ['analytics', 'category-breakdown'],
    queryFn: () => apiFetch<CategoryBreakdown>('/analytics/category-breakdown'),
    staleTime: 60000,
  });
}

export function useCumulativeEarnings() {
  return useQuery({
    queryKey: ['analytics', 'cumulative-earnings'],
    queryFn: () => apiFetch<Array<{ month: string; malachiCumulative: number; danielCumulative: number }>>('/analytics/cumulative-earnings'),
    staleTime: 60000,
  });
}

export function useMonthlyDelta() {
  return useQuery({
    queryKey: ['analytics', 'monthly-delta'],
    queryFn: () => apiFetch<Array<{ month: string; delta: number }>>('/analytics/monthly-delta'),
    staleTime: 60000,
  });
}

// ─── Settings ─────────────────────────────────────────────────────────────
export function useSettings() {
  return useQuery<Record<string, string>>({
    queryKey: ['settings'],
    queryFn: () => apiFetch('/settings'),
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AppSettings>) =>
      apiFetch<Record<string, string>>('/settings', { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  });
}

export function useRolePresets() {
  return useQuery<RolePreset[]>({
    queryKey: ['settings', 'presets'],
    queryFn: () => apiFetch('/settings/presets'),
  });
}
