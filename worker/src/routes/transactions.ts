import { Hono } from 'hono';
import { z } from 'zod';
import { calculateSplit } from '../lib/splitEngine';
import type { Env } from '../index';

const router = new Hono<{ Bindings: Env }>();

const createSchema = z.object({
  clientName: z.string().min(1).max(200),
  projectDescription: z.string().max(500).optional(),
  grossAmount: z.number().positive().max(10_000_000),
  paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  expenseDeduction: z.number().min(0).optional().default(0),
  clientManagerAssignment: z.enum(['malachi', 'daniel', 'split']),
  salesCommissionAssignment: z.enum(['malachi', 'daniel', 'split']),
  workSplitMode: z.enum(['percentage', 'hourly']),
  malachiWorkPercentage: z.number().min(0).max(100).optional(),
  danielWorkPercentage: z.number().min(0).max(100).optional(),
  malachiHours: z.number().min(0).optional(),
  danielHours: z.number().min(0).optional(),
});

const updateSchema = z.object({
  clientName: z.string().min(1).max(200).optional(),
  projectDescription: z.string().max(500).nullable().optional(),
  paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

async function getSplitRatios(db: D1Database) {
  const { results } = await db.prepare(
    `SELECT key, value FROM settings WHERE key IN ('businessReservePct','clientMgmtPct','salesCommissionPct')`
  ).all<{ key: string; value: string }>();
  const map: Record<string, string> = {};
  results.forEach(r => { map[r.key] = r.value; });
  return {
    businessReservePct: map.businessReservePct ? parseFloat(map.businessReservePct) : 10,
    clientMgmtPct: map.clientMgmtPct ? parseFloat(map.clientMgmtPct) : 10,
    salesCommissionPct: map.salesCommissionPct ? parseFloat(map.salesCommissionPct) : 20,
  };
}

function mapTx(row: Record<string, unknown>) {
  return {
    id: row.id, createdAt: row.created_at, updatedAt: row.updated_at,
    clientName: row.client_name, projectDescription: row.project_description,
    grossAmount: row.gross_amount, paymentDate: row.payment_date,
    expenseDeduction: row.expense_deduction, netAmount: row.net_amount,
    clientManagerAssignment: row.client_manager_assignment,
    salesCommissionAssignment: row.sales_commission_assignment,
    workSplitMode: row.work_split_mode,
    malachiWorkPercentage: row.malachi_work_percentage,
    danielWorkPercentage: row.daniel_work_percentage,
    malachiHours: row.malachi_hours, danielHours: row.daniel_hours,
    businessProfitReserve: row.business_profit_reserve,
    clientManagementFee: row.client_management_fee,
    clientManagementToMalachi: row.client_management_to_malachi,
    clientManagementToDaniel: row.client_management_to_daniel,
    salesCommission: row.sales_commission,
    salesCommissionToMalachi: row.sales_commission_to_malachi,
    salesCommissionToDaniel: row.sales_commission_to_daniel,
    workPool: row.work_pool,
    malachiWorkPayout: row.malachi_work_payout, danielWorkPayout: row.daniel_work_payout,
    malachiTotalPayout: row.malachi_total_payout, danielTotalPayout: row.daniel_total_payout,
    businessTotalRetained: row.business_total_retained, explanation: row.explanation,
  };
}

router.get('/', async (c) => {
  const { dateFrom, dateTo, client, sort = 'newest', page = '1', limit = '20' } = c.req.query();
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const offset = (pageNum - 1) * limitNum;

  const orderMap: Record<string, string> = {
    newest: 'payment_date DESC, created_at DESC',
    oldest: 'payment_date ASC, created_at ASC',
    largest: 'gross_amount DESC',
    smallest: 'gross_amount ASC',
  };

  let where = 'WHERE 1=1';
  const params: unknown[] = [];
  if (dateFrom) { where += ' AND payment_date >= ?'; params.push(dateFrom); }
  if (dateTo) { where += ' AND payment_date <= ?'; params.push(dateTo); }
  if (client) { where += ' AND client_name LIKE ?'; params.push(`%${client}%`); }

  const orderClause = `ORDER BY ${orderMap[sort] ?? orderMap.newest}`;

  const countRow = await c.env.DB.prepare(`SELECT COUNT(*) as count FROM transactions ${where}`)
    .bind(...params).first<{ count: number }>();
  const total = countRow?.count ?? 0;

  const { results } = await c.env.DB.prepare(
    `SELECT * FROM transactions ${where} ${orderClause} LIMIT ? OFFSET ?`
  ).bind(...params, limitNum, offset).all<Record<string, unknown>>();

  return c.json({
    data: results.map(mapTx),
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  });
});

router.get('/:id', async (c) => {
  const row = await c.env.DB.prepare(`SELECT * FROM transactions WHERE id = ?`)
    .bind(c.req.param('id')).first<Record<string, unknown>>();
  if (!row) return c.json({ error: 'Transaction not found' }, 404);
  return c.json(mapTx(row));
});

router.post('/', async (c) => {
  const body = await c.req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, 400);

  const { clientName, projectDescription, grossAmount, paymentDate, expenseDeduction,
    clientManagerAssignment, salesCommissionAssignment, workSplitMode,
    malachiWorkPercentage, danielWorkPercentage, malachiHours, danielHours } = parsed.data;

  const ratios = await getSplitRatios(c.env.DB);
  const result = calculateSplit({
    grossAmount, expenseDeduction, clientManagerAssignment, salesCommissionAssignment,
    workSplitMode, malachiWorkPercentage, danielWorkPercentage, malachiHours, danielHours, ratios,
  });

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await c.env.DB.prepare(`
    INSERT INTO transactions (id, created_at, updated_at, client_name, project_description, gross_amount,
      payment_date, expense_deduction, net_amount, client_manager_assignment, sales_commission_assignment,
      work_split_mode, malachi_work_percentage, daniel_work_percentage, malachi_hours, daniel_hours,
      business_profit_reserve, client_management_fee, client_management_to_malachi, client_management_to_daniel,
      sales_commission, sales_commission_to_malachi, sales_commission_to_daniel, work_pool,
      malachi_work_payout, daniel_work_payout, malachi_total_payout, daniel_total_payout,
      business_total_retained, explanation)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id, now, now, clientName, projectDescription ?? null, result.grossAmount, paymentDate,
    result.expenseDeduction, result.netAmount, clientManagerAssignment, salesCommissionAssignment,
    workSplitMode, result.malachiWorkPercentage, result.danielWorkPercentage,
    malachiHours ?? null, danielHours ?? null,
    result.businessProfitReserve, result.clientManagementFee, result.clientManagementToMalachi,
    result.clientManagementToDaniel, result.salesCommission, result.salesCommissionToMalachi,
    result.salesCommissionToDaniel, result.workPool, result.malachiWorkPayout, result.danielWorkPayout,
    result.malachiTotalPayout, result.danielTotalPayout, result.businessTotalRetained, result.explanation
  ).run();

  await c.env.DB.prepare(`INSERT OR IGNORE INTO clients (id, name, created_at) VALUES (?, ?, ?)`)
    .bind(crypto.randomUUID(), clientName, now).run();

  const saved = await c.env.DB.prepare(`SELECT * FROM transactions WHERE id = ?`)
    .bind(id).first<Record<string, unknown>>();
  return c.json(mapTx(saved!), 201);
});

router.put('/:id', async (c) => {
  const id = c.req.param('id');
  const row = await c.env.DB.prepare(`SELECT * FROM transactions WHERE id = ?`)
    .bind(id).first<Record<string, unknown>>();
  if (!row) return c.json({ error: 'Transaction not found' }, 404);

  const body = await c.req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, 400);

  const { clientName, projectDescription, paymentDate } = parsed.data;
  const now = new Date().toISOString();

  await c.env.DB.prepare(
    `UPDATE transactions SET client_name=?, project_description=?, payment_date=?, updated_at=? WHERE id=?`
  ).bind(
    clientName ?? row.client_name,
    projectDescription !== undefined ? projectDescription : row.project_description,
    paymentDate ?? row.payment_date,
    now, id
  ).run();

  const updated = await c.env.DB.prepare(`SELECT * FROM transactions WHERE id = ?`)
    .bind(id).first<Record<string, unknown>>();
  return c.json(mapTx(updated!));
});

router.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const row = await c.env.DB.prepare(`SELECT * FROM transactions WHERE id = ?`).bind(id).first();
  if (!row) return c.json({ error: 'Transaction not found' }, 404);
  await c.env.DB.prepare(`DELETE FROM transactions WHERE id = ?`).bind(id).run();
  return new Response(null, { status: 204 });
});

export default router;
