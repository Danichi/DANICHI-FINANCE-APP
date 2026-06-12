import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';

export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  clientName: text('client_name').notNull(),
  projectDescription: text('project_description'),
  grossAmount: real('gross_amount').notNull(),
  paymentDate: text('payment_date').notNull(),
  expenseDeduction: real('expense_deduction').default(0).notNull(),
  netAmount: real('net_amount').notNull(),
  clientManagerAssignment: text('client_manager_assignment').notNull(),
  salesCommissionAssignment: text('sales_commission_assignment').notNull(),
  workSplitMode: text('work_split_mode').notNull(),
  malachiWorkPercentage: real('malachi_work_percentage'),
  danielWorkPercentage: real('daniel_work_percentage'),
  malachiHours: real('malachi_hours'),
  danielHours: real('daniel_hours'),
  businessProfitReserve: real('business_profit_reserve').notNull(),
  clientManagementFee: real('client_management_fee').notNull(),
  clientManagementToMalachi: real('client_management_to_malachi').notNull(),
  clientManagementToDaniel: real('client_management_to_daniel').notNull(),
  salesCommission: real('sales_commission').notNull(),
  salesCommissionToMalachi: real('sales_commission_to_malachi').notNull(),
  salesCommissionToDaniel: real('sales_commission_to_daniel').notNull(),
  workPool: real('work_pool').notNull(),
  malachiWorkPayout: real('malachi_work_payout').notNull(),
  danielWorkPayout: real('daniel_work_payout').notNull(),
  malachiTotalPayout: real('malachi_total_payout').notNull(),
  danielTotalPayout: real('daniel_total_payout').notNull(),
  businessTotalRetained: real('business_total_retained').notNull(),
  explanation: text('explanation').notNull(),
});

export const expenses = sqliteTable('expenses', {
  id: text('id').primaryKey(),
  createdAt: text('created_at').notNull(),
  date: text('date').notNull(),
  description: text('description').notNull(),
  amount: real('amount').notNull(),
  category: text('category').notNull(),
  type: text('type').notNull(),
  transactionId: text('transaction_id').references(() => transactions.id),
  paidBy: text('paid_by').notNull(),
});

export const goals = sqliteTable('goals', {
  id: text('id').primaryKey(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  targetAmount: real('target_amount').notNull(),
  periodStart: text('period_start').notNull(),
  periodEnd: text('period_end').notNull(),
  description: text('description'),
  status: text('status').default('active').notNull(),
  completedAt: text('completed_at'),
});

export const clients = sqliteTable('clients', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  createdAt: text('created_at').notNull(),
  notes: text('notes'),
});

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

export const rolePresets = sqliteTable('role_presets', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  clientManager: text('client_manager').notNull(),
  salesCommission: text('sales_commission').notNull(),
  workSplitMode: text('work_split_mode').notNull(),
  malachiPercentage: real('malachi_percentage'),
  danielPercentage: real('daniel_percentage'),
});
