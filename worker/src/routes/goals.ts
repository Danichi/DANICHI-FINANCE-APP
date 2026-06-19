import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../index';

const router = new Hono<{ Bindings: Env }>();

const createSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(['monthly_revenue', 'quarterly_revenue', 'malachi_earnings', 'daniel_earnings', 'custom']),
  targetAmount: z.number().positive(),
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: z.string().max(500).nullable().optional(),
});

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  type: z.enum(['monthly_revenue', 'quarterly_revenue', 'malachi_earnings', 'daniel_earnings', 'custom']).optional(),
  targetAmount: z.number().positive().optional(),
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  description: z.string().max(500).nullable().optional(),
  status: z.enum(['active', 'completed', 'missed', 'archived']).optional(),
});

function mapGoal(row: Record<string, unknown>) {
  return {
    id: row.id, createdAt: row.created_at, updatedAt: row.updated_at,
    name: row.name, type: row.type, targetAmount: row.target_amount,
    currentAmount: (row.current_amount as number) ?? 0,
    periodStart: row.period_start, periodEnd: row.period_end,
    description: row.description, status: row.status, completedAt: row.completed_at,
  };
}

async function getGoalProgress(db: D1Database, goalId: string): Promise<number> {
  const goal = await db.prepare(`SELECT * FROM goals WHERE id = ?`)
    .bind(goalId).first<Record<string, unknown>>();
  if (!goal) return 0;

  const AUTO_FIELDS: Record<string, string> = {
    monthly_revenue: 'gross_amount',
    quarterly_revenue: 'gross_amount',
    malachi_earnings: 'malachi_total_payout',
    daniel_earnings: 'daniel_total_payout',
  };

  const field = AUTO_FIELDS[goal.type as string];
  if (!field) return (goal.current_amount as number) ?? 0;

  const row = await db.prepare(
    `SELECT SUM(${field}) as total FROM transactions WHERE payment_date >= ? AND payment_date <= ?`
  ).bind(goal.period_start, goal.period_end).first<{ total: number | null }>();

  return row?.total ?? 0;
}

router.get('/', async (c) => {
  const { status } = c.req.query();
  let where = 'WHERE 1=1';
  const params: unknown[] = [];
  if (status) { where += ' AND status = ?'; params.push(status); }
  const { results } = await c.env.DB.prepare(
    `SELECT * FROM goals ${where} ORDER BY created_at DESC`
  ).bind(...params).all<Record<string, unknown>>();
  return c.json(results.map(mapGoal));
});

router.get('/:id', async (c) => {
  const row = await c.env.DB.prepare(`SELECT * FROM goals WHERE id = ?`)
    .bind(c.req.param('id')).first<Record<string, unknown>>();
  if (!row) return c.json({ error: 'Goal not found' }, 404);
  return c.json(mapGoal(row));
});

router.get('/:id/progress', async (c) => {
  const id = c.req.param('id');
  const row = await c.env.DB.prepare(`SELECT * FROM goals WHERE id = ?`)
    .bind(id).first<Record<string, unknown>>();
  if (!row) return c.json({ error: 'Goal not found' }, 404);

  const currentAmount = await getGoalProgress(c.env.DB, id);
  const target = row.target_amount as number;
  const pct = target > 0 ? Math.min(100, (currentAmount / target) * 100) : 0;
  return c.json({ currentAmount, targetAmount: target, percentage: Math.round(pct * 10) / 10 });
});

router.post('/', async (c) => {
  const body = await c.req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, 400);

  const { name, type, targetAmount, periodStart, periodEnd, description } = parsed.data;
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await c.env.DB.prepare(
    `INSERT INTO goals (id, created_at, updated_at, name, type, target_amount, period_start, period_end, description, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`
  ).bind(id, now, now, name, type, targetAmount, periodStart, periodEnd, description ?? null).run();

  const saved = await c.env.DB.prepare(`SELECT * FROM goals WHERE id = ?`)
    .bind(id).first<Record<string, unknown>>();
  return c.json(mapGoal(saved!), 201);
});

router.put('/:id', async (c) => {
  const id = c.req.param('id');
  const row = await c.env.DB.prepare(`SELECT * FROM goals WHERE id = ?`)
    .bind(id).first<Record<string, unknown>>();
  if (!row) return c.json({ error: 'Goal not found' }, 404);

  const body = await c.req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, 400);

  const { name, type, targetAmount, periodStart, periodEnd, description, status } = parsed.data;
  const now = new Date().toISOString();
  const completedAt = status === 'completed' && row.status !== 'completed' ? now : row.completed_at;

  await c.env.DB.prepare(
    `UPDATE goals SET name=?, type=?, target_amount=?, period_start=?, period_end=?, description=?, status=?, completed_at=?, updated_at=? WHERE id=?`
  ).bind(
    name ?? row.name, type ?? row.type, targetAmount ?? row.target_amount,
    periodStart ?? row.period_start, periodEnd ?? row.period_end,
    description !== undefined ? description : row.description,
    status ?? row.status, completedAt, now, id
  ).run();

  const updated = await c.env.DB.prepare(`SELECT * FROM goals WHERE id = ?`)
    .bind(id).first<Record<string, unknown>>();
  return c.json(mapGoal(updated!));
});

router.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const row = await c.env.DB.prepare(`SELECT * FROM goals WHERE id = ?`).bind(id).first();
  if (!row) return c.json({ error: 'Goal not found' }, 404);
  await c.env.DB.prepare(`DELETE FROM goals WHERE id = ?`).bind(id).run();
  return new Response(null, { status: 204 });
});

export default router;
