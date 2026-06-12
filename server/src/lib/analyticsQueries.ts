import { sqlite } from '../db/database';

export function getMonthlyRevenue(months = 12) {
  const rows = sqlite.prepare(`
    SELECT
      strftime('%Y-%m', payment_date) as month,
      SUM(gross_amount) as gross_revenue,
      SUM(malachi_total_payout) as malachi_payout,
      SUM(daniel_total_payout) as daniel_payout,
      SUM(business_total_retained) as business_retained
    FROM transactions
    WHERE payment_date >= date('now', '-' || ? || ' months')
    GROUP BY strftime('%Y-%m', payment_date)
    ORDER BY month ASC
  `).all(months) as any[];
  return rows;
}

export function getPartnerEquity() {
  const row = sqlite.prepare(`
    SELECT
      SUM(malachi_total_payout) as malachi_total,
      SUM(daniel_total_payout) as daniel_total,
      SUM(malachi_work_payout) as malachi_work_pay,
      SUM(daniel_work_payout) as daniel_work_pay,
      SUM(sales_commission_to_malachi) as malachi_sales_commission,
      SUM(sales_commission_to_daniel) as daniel_sales_commission,
      SUM(client_management_to_malachi) as malachi_client_management,
      SUM(client_management_to_daniel) as daniel_client_management
    FROM transactions
  `).get() as any;
  return row || {
    malachi_total: 0, daniel_total: 0,
    malachi_work_pay: 0, daniel_work_pay: 0,
    malachi_sales_commission: 0, daniel_sales_commission: 0,
    malachi_client_management: 0, daniel_client_management: 0,
  };
}

export function getCategoryBreakdown() {
  const row = sqlite.prepare(`
    SELECT
      SUM(business_profit_reserve) as business_profit_reserve,
      SUM(client_management_fee) as client_management_fee,
      SUM(sales_commission) as sales_commission,
      SUM(malachi_work_payout) as malachi_work_pay,
      SUM(daniel_work_payout) as daniel_work_pay
    FROM transactions
  `).get() as any;
  return row;
}

export function getClientSummaries() {
  const rows = sqlite.prepare(`
    SELECT
      client_name,
      COUNT(*) as transaction_count,
      SUM(gross_amount) as total_revenue,
      AVG(gross_amount) as avg_transaction_value,
      MAX(payment_date) as last_payment_date
    FROM transactions
    GROUP BY client_name
    ORDER BY total_revenue DESC
  `).all() as any[];
  return rows;
}

export function getGoalProgress(goalId: string): number {
  const goal = sqlite.prepare(`SELECT * FROM goals WHERE id = ?`).get(goalId) as any;
  if (!goal) return 0;

  let field: string;
  switch (goal.type) {
    case 'monthly_revenue':
    case 'quarterly_revenue':
      field = 'gross_amount';
      break;
    case 'malachi_earnings':
      field = 'malachi_total_payout';
      break;
    case 'daniel_earnings':
      field = 'daniel_total_payout';
      break;
    default:
      return goal.current_amount ?? 0;
  }

  const row = sqlite.prepare(`
    SELECT SUM(${field}) as total
    FROM transactions
    WHERE payment_date >= ? AND payment_date <= ?
  `).get(goal.period_start, goal.period_end) as any;

  return row?.total ?? 0;
}

export function getCumulativeEarningsByMonth() {
  const rows = sqlite.prepare(`
    SELECT
      strftime('%Y-%m', payment_date) as month,
      SUM(malachi_total_payout) as malachi_month,
      SUM(daniel_total_payout) as daniel_month
    FROM transactions
    GROUP BY strftime('%Y-%m', payment_date)
    ORDER BY month ASC
  `).all() as any[];

  let mCumul = 0, dCumul = 0;
  return rows.map(r => {
    mCumul += r.malachi_month ?? 0;
    dCumul += r.daniel_month ?? 0;
    return { month: r.month, malachiCumulative: Math.round(mCumul * 100) / 100, danielCumulative: Math.round(dCumul * 100) / 100 };
  });
}

export function getMonthlyDelta() {
  const rows = sqlite.prepare(`
    SELECT
      strftime('%Y-%m', payment_date) as month,
      SUM(malachi_total_payout) - SUM(daniel_total_payout) as delta
    FROM transactions
    GROUP BY strftime('%Y-%m', payment_date)
    ORDER BY month ASC
  `).all() as any[];
  return rows;
}

export function getDashboardStats() {
  const row = sqlite.prepare(`
    SELECT
      SUM(gross_amount) as total_revenue,
      SUM(business_total_retained) as total_business_retained
    FROM transactions
  `).get() as any;

  const currentMonth = new Date().toISOString().slice(0, 7);
  const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);

  const thisMonthRow = sqlite.prepare(`
    SELECT SUM(gross_amount) as revenue FROM transactions
    WHERE strftime('%Y-%m', payment_date) = ?
  `).get(currentMonth) as any;

  const lastMonthRow = sqlite.prepare(`
    SELECT SUM(gross_amount) as revenue FROM transactions
    WHERE strftime('%Y-%m', payment_date) = ?
  `).get(lastMonth) as any;

  const thisMonthRevenue = thisMonthRow?.revenue ?? 0;
  const lastMonthRevenue = lastMonthRow?.revenue ?? 0;
  const monthChange = lastMonthRevenue === 0 ? 0
    : ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

  return {
    totalRevenue: row?.total_revenue ?? 0,
    totalBusinessRetained: row?.total_business_retained ?? 0,
    thisMonthRevenue,
    lastMonthRevenue,
    monthChangePercent: Math.round(monthChange * 10) / 10,
  };
}
