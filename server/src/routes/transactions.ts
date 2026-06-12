import { Router } from 'express';
import { db, sqlite } from '../db/database';
import { transactions, clients } from '../db/schema';
import { calculateSplit } from '../lib/splitEngine';
import { eq, desc, asc, and, gte, lte, like } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const router = Router();

router.get('/', (req, res) => {
  const { dateFrom, dateTo, client, sort = 'newest', page = '1', limit = '20' } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const offset = (pageNum - 1) * limitNum;

  let query = `SELECT * FROM transactions WHERE 1=1`;
  const params: any[] = [];
  if (dateFrom) { query += ` AND payment_date >= ?`; params.push(dateFrom); }
  if (dateTo) { query += ` AND payment_date <= ?`; params.push(dateTo); }
  if (client) { query += ` AND client_name LIKE ?`; params.push(`%${client}%`); }

  const orderMap: Record<string, string> = {
    newest: 'payment_date DESC, created_at DESC',
    oldest: 'payment_date ASC, created_at ASC',
    largest: 'gross_amount DESC',
    smallest: 'gross_amount ASC',
  };
  query += ` ORDER BY ${orderMap[sort] || orderMap.newest}`;

  const total = (sqlite.prepare(query.replace('SELECT *', 'SELECT COUNT(*) as count')).get(...params) as any)?.count ?? 0;
  const data = sqlite.prepare(query + ` LIMIT ? OFFSET ?`).all(...params, limitNum, offset);

  res.json({
    data: data.map(mapTx),
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  });
});

router.get('/:id', (req, res) => {
  const tx = sqlite.prepare(`SELECT * FROM transactions WHERE id = ?`).get(req.params.id) as any;
  if (!tx) return res.status(404).json({ error: 'Transaction not found' });
  res.json(mapTx(tx));
});

router.post('/', (req, res) => {
  const { clientName, projectDescription, grossAmount, paymentDate, expenseDeduction = 0,
    clientManagerAssignment, salesCommissionAssignment, workSplitMode,
    malachiWorkPercentage, danielWorkPercentage, malachiHours, danielHours } = req.body;

  if (!clientName || !grossAmount || !paymentDate || !clientManagerAssignment || !salesCommissionAssignment || !workSplitMode) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const result = calculateSplit({
    grossAmount: parseFloat(grossAmount),
    expenseDeduction: parseFloat(expenseDeduction) || 0,
    clientManagerAssignment,
    salesCommissionAssignment,
    workSplitMode,
    malachiWorkPercentage: malachiWorkPercentage !== undefined ? parseFloat(malachiWorkPercentage) : undefined,
    danielWorkPercentage: danielWorkPercentage !== undefined ? parseFloat(danielWorkPercentage) : undefined,
    malachiHours: malachiHours !== undefined ? parseFloat(malachiHours) : undefined,
    danielHours: danielHours !== undefined ? parseFloat(danielHours) : undefined,
  });

  const id = randomUUID();
  const now = new Date().toISOString();

  sqlite.prepare(`
    INSERT INTO transactions (id, created_at, updated_at, client_name, project_description, gross_amount,
      payment_date, expense_deduction, net_amount, client_manager_assignment, sales_commission_assignment,
      work_split_mode, malachi_work_percentage, daniel_work_percentage, malachi_hours, daniel_hours,
      business_profit_reserve, client_management_fee, client_management_to_malachi, client_management_to_daniel,
      sales_commission, sales_commission_to_malachi, sales_commission_to_daniel, work_pool,
      malachi_work_payout, daniel_work_payout, malachi_total_payout, daniel_total_payout,
      business_total_retained, explanation)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, now, now, clientName, projectDescription || null, result.grossAmount, paymentDate,
    result.expenseDeduction, result.netAmount, clientManagerAssignment, salesCommissionAssignment, workSplitMode,
    result.malachiWorkPercentage, result.danielWorkPercentage,
    malachiHours !== undefined ? parseFloat(malachiHours) : null,
    danielHours !== undefined ? parseFloat(danielHours) : null,
    result.businessProfitReserve, result.clientManagementFee, result.clientManagementToMalachi,
    result.clientManagementToDaniel, result.salesCommission, result.salesCommissionToMalachi,
    result.salesCommissionToDaniel, result.workPool, result.malachiWorkPayout, result.danielWorkPayout,
    result.malachiTotalPayout, result.danielTotalPayout, result.businessTotalRetained, result.explanation);

  // Upsert client
  sqlite.prepare(`INSERT OR IGNORE INTO clients (id, name, created_at) VALUES (?, ?, ?)`).run(randomUUID(), clientName, now);

  const saved = sqlite.prepare(`SELECT * FROM transactions WHERE id = ?`).get(id) as any;
  res.status(201).json(mapTx(saved));
});

router.put('/:id', (req, res) => {
  const tx = sqlite.prepare(`SELECT * FROM transactions WHERE id = ?`).get(req.params.id) as any;
  if (!tx) return res.status(404).json({ error: 'Transaction not found' });

  const { clientName, projectDescription, paymentDate } = req.body;
  const now = new Date().toISOString();
  sqlite.prepare(`UPDATE transactions SET client_name = ?, project_description = ?, payment_date = ?, updated_at = ? WHERE id = ?`)
    .run(clientName ?? tx.client_name, projectDescription ?? tx.project_description, paymentDate ?? tx.payment_date, now, req.params.id);

  res.json(mapTx(sqlite.prepare(`SELECT * FROM transactions WHERE id = ?`).get(req.params.id) as any));
});

router.delete('/:id', (req, res) => {
  const tx = sqlite.prepare(`SELECT * FROM transactions WHERE id = ?`).get(req.params.id) as any;
  if (!tx) return res.status(404).json({ error: 'Transaction not found' });
  sqlite.prepare(`DELETE FROM transactions WHERE id = ?`).run(req.params.id);
  res.status(204).send();
});

function mapTx(row: any) {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    clientName: row.client_name,
    projectDescription: row.project_description,
    grossAmount: row.gross_amount,
    paymentDate: row.payment_date,
    expenseDeduction: row.expense_deduction,
    netAmount: row.net_amount,
    clientManagerAssignment: row.client_manager_assignment,
    salesCommissionAssignment: row.sales_commission_assignment,
    workSplitMode: row.work_split_mode,
    malachiWorkPercentage: row.malachi_work_percentage,
    danielWorkPercentage: row.daniel_work_percentage,
    malachiHours: row.malachi_hours,
    danielHours: row.daniel_hours,
    businessProfitReserve: row.business_profit_reserve,
    clientManagementFee: row.client_management_fee,
    clientManagementToMalachi: row.client_management_to_malachi,
    clientManagementToDaniel: row.client_management_to_daniel,
    salesCommission: row.sales_commission,
    salesCommissionToMalachi: row.sales_commission_to_malachi,
    salesCommissionToDaniel: row.sales_commission_to_daniel,
    workPool: row.work_pool,
    malachiWorkPayout: row.malachi_work_payout,
    danielWorkPayout: row.daniel_work_payout,
    malachiTotalPayout: row.malachi_total_payout,
    danielTotalPayout: row.daniel_total_payout,
    businessTotalRetained: row.business_total_retained,
    explanation: row.explanation,
  };
}

export default router;
