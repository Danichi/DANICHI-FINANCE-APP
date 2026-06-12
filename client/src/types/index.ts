// ─── Partner Types ────────────────────────────────────────────────────────
export type Partner = 'malachi' | 'daniel';
export type Assignment = 'malachi' | 'daniel' | 'split';
export type WorkSplitMode = 'percentage' | 'hourly';

// ─── Split Calculator ─────────────────────────────────────────────────────
export interface SplitInput {
  grossAmount: number;
  expenseDeduction?: number;
  clientManagerAssignment: Assignment;
  salesCommissionAssignment: Assignment;
  workSplitMode: WorkSplitMode;
  malachiWorkPercentage?: number;
  danielWorkPercentage?: number;
  malachiHours?: number;
  danielHours?: number;
}

export interface SplitResult {
  grossAmount: number;
  netAmount: number;
  expenseDeduction: number;
  businessProfitReserve: number;
  clientManagementFee: number;
  clientManagementToMalachi: number;
  clientManagementToDaniel: number;
  salesCommission: number;
  salesCommissionToMalachi: number;
  salesCommissionToDaniel: number;
  workPool: number;
  malachiWorkPercentage: number;
  danielWorkPercentage: number;
  malachiWorkPayout: number;
  danielWorkPayout: number;
  malachiTotalPayout: number;
  danielTotalPayout: number;
  businessTotalRetained: number;
  remainder: number;
  explanation: string;
}

// ─── Transaction ──────────────────────────────────────────────────────────
export interface Transaction {
  id: string;
  createdAt: string;
  updatedAt: string;
  clientName: string;
  projectDescription: string | null;
  grossAmount: number;
  paymentDate: string;
  expenseDeduction: number;
  netAmount: number;
  clientManagerAssignment: Assignment;
  salesCommissionAssignment: Assignment;
  workSplitMode: WorkSplitMode;
  malachiWorkPercentage: number | null;
  danielWorkPercentage: number | null;
  malachiHours: number | null;
  danielHours: number | null;
  businessProfitReserve: number;
  clientManagementFee: number;
  clientManagementToMalachi: number;
  clientManagementToDaniel: number;
  salesCommission: number;
  salesCommissionToMalachi: number;
  salesCommissionToDaniel: number;
  workPool: number;
  malachiWorkPayout: number;
  danielWorkPayout: number;
  malachiTotalPayout: number;
  danielTotalPayout: number;
  businessTotalRetained: number;
  explanation: string;
}

export interface TransactionFilters {
  dateFrom?: string;
  dateTo?: string;
  client?: string;
  sort?: 'newest' | 'oldest' | 'largest' | 'smallest';
  page?: number;
  limit?: number;
}

// ─── Expense ──────────────────────────────────────────────────────────────
export type ExpenseCategory = 'software' | 'ads' | 'tools' | 'office' | 'other';
export type ExpenseType = 'project' | 'standalone';
export type PaidBy = 'malachi' | 'daniel' | 'business';

export interface Expense {
  id: string;
  createdAt: string;
  date: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  type: ExpenseType;
  transactionId: string | null;
  paidBy: PaidBy;
}

// ─── Goal ─────────────────────────────────────────────────────────────────
export type GoalType =
  | 'monthly_revenue'
  | 'malachi_earnings'
  | 'daniel_earnings'
  | 'quarterly_revenue'
  | 'custom';

export type GoalStatus = 'active' | 'completed' | 'missed' | 'archived';

export interface Goal {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  type: GoalType;
  targetAmount: number;
  currentAmount: number;
  periodStart: string;
  periodEnd: string;
  description: string | null;
  status: GoalStatus;
  completedAt: string | null;
}

// ─── Client ───────────────────────────────────────────────────────────────
export interface Client {
  id: string;
  name: string;
  createdAt: string;
  notes: string | null;
  totalRevenue?: number;
  transactionCount?: number;
  avgTransactionValue?: number;
  lastPaymentDate?: string | null;
}

// ─── Role Preset ──────────────────────────────────────────────────────────
export interface RolePreset {
  id: string;
  name: string;
  clientManager: Assignment;
  salesCommission: Assignment;
  workSplitMode: WorkSplitMode;
  malachiPercentage: number | null;
  danielPercentage: number | null;
}

// ─── Settings ─────────────────────────────────────────────────────────────
export interface AppSettings {
  malachiName: string;
  danielName: string;
  currency: 'CAD' | 'USD';
  defaultClientManager: Assignment;
  defaultSalesCommission: Assignment;
  defaultWorkSplitMode: WorkSplitMode;
  defaultMalachiPercentage: number;
  defaultDanielPercentage: number;
  tableDensity: 'compact' | 'comfortable';
}

// ─── Analytics ────────────────────────────────────────────────────────────
export interface MonthlyRevenueData {
  month: string;
  gross_revenue: number;
  malachi_payout: number;
  daniel_payout: number;
  business_retained: number;
}

export interface EquityData {
  malachi_total: number;
  daniel_total: number;
  malachi_work_pay: number;
  daniel_work_pay: number;
  malachi_sales_commission: number;
  daniel_sales_commission: number;
  malachi_client_management: number;
  daniel_client_management: number;
}

export interface CategoryBreakdown {
  business_profit_reserve: number;
  client_management_fee: number;
  sales_commission: number;
  malachi_work_pay: number;
  daniel_work_pay: number;
}

// ─── API Response Wrappers ────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  error: string;
  message?: string;
}
