import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../index';

const router = new Hono<{ Bindings: Env }>();

const createSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: z.string().min(1).max(500),
  amount: z.number().positive().max(10_000_000),
  category: z.enum(['software', 'ads', 'tools', 'office', 'other']),
  type: z.enum(['project', 'standalone']),
  paidBy: z.enum(['malachi', 'daniel', 'business']),
  transactionId: z.string().uuid().nullable().optional(),
});

function mapExpense(row: Record<string, unknown>) {
  return {
    id: row.id, createdAt: row.created_at, date: row.date,
    description: row.description, amount: row.amount, category: row.category,
    type: row.type, transactionId: row.transaction_id, paidBy: row.paid_by,
  };
}

router.get('/', async (c) => {
  const { type, category, dateFrom, dateTo, page = '1', limit = '50' } = c.req.query();
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(200, parseInt(limit));
  const offset = (pageNum - 1) * limitNum;

  let where = 'WHERE 1=1';
  const params: unknown[] = [];
  if (type) { where += ' AND type = ?'; params.push(type); }
  if (category) { where += ' AND category = ?'; params.push(category); }
  if (dateFrom) { where += ' AND date >= ?'; params.push(dateFrom); }
  if (dateTo) { where += ' AND date <= ?'; params.push(dateTo); }

  const countRow = await c.env.DB.prepare(`SELECT COUNT(*) as count FROM expenses ${where}`)
    .bind(...params).first<{ count: number }>();
  const total = countRow?.count ?? 0;

  const { results } = await c.env.DB.prepare(
    `SELECT * FROM expenses ${where} ORDER BY date DESC LIMIT ? OFFSET ?`
  ).bind(...params, limitNum, offset).all<Record<string, unknown>>();

  return c.json({ data: results.map(mapExpense), total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) });
});

router.get('/:id', async (c) => {
  const row = await c.env.DB.prepare(`SELECT * FROM expenses WHERE id = ?`)
    .bind(c.req.param('id')).first<Record<string, unknown>>();
  if (!row) return c.json({ error: 'Expense not found' }, 404);
  return c.json(mapExpense(row));
});

router.post('/', async (c) => {
  const body = await c.req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, 400);

  const { date, description, amount, category, type, transactionId, paidBy } = parsed.data;
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await c.env.DB.prepare(
    `INSERT INTO expenses (id, created_at, date, description, amount, category, type, transaction_id, paid_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, now, date, description, amount, category, type, transactionId ?? null, paidBy).run();

  const saved = await c.env.DB.prepare(`SELECT * FROM expenses WHERE id = ?`)
    .bind(id).first<Record<string, unknown>>();
  return c.json(mapExpense(saved!), 201);
});

router.put('/:id', async (c) => {
  const id = c.req.param('id');
  const row = await c.env.DB.prepare(`SELECT * FROM expenses WHERE id = ?`)
    .bind(id).first<Record<string, unknown>>();
  if (!row) return c.json({ error: 'Expense not found' }, 404);

  const body = await c.req.json();
  const parsed = createSchema.partial().safeParse(body);
  if (!parsed.success) return c.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, 400);

  const { date, description, amount, category, type, transactionId, paidBy } = parsed.data;
  await c.env.DB.prepare(
    `UPDATE expenses SET date=?, description=?, amount=?, category=?, type=?, transaction_id=?, paid_by=? WHERE id=?`
  ).bind(
    date ?? row.date, description ?? row.description, amount ?? row.amount,
    category ?? row.category, type ?? row.type,
    transactionId !== undefined ? transactionId : row.transaction_id,
    paidBy ?? row.paid_by, id
  ).run();

  const updated = await c.env.DB.prepare(`SELECT * FROM expenses WHERE id = ?`)
    .bind(id).first<Record<string, unknown>>();
  return c.json(mapExpense(updated!));
});

router.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const row = await c.env.DB.prepare(`SELECT * FROM expenses WHERE id = ?`).bind(id).first();
  if (!row) return c.json({ error: 'Expense not found' }, 404);
  await c.env.DB.prepare(`DELETE FROM expenses WHERE id = ?`).bind(id).run();
  return new Response(null, { status: 204 });
});

export default router;
