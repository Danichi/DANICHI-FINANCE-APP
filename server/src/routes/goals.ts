import { Router } from 'express';
import { z } from 'zod';
import { sqlite } from '../db/database';
import { getGoalProgress } from '../lib/analyticsQueries';
import { randomUUID } from 'crypto';

const router = Router();

const createGoalSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  type: z.enum(['monthly_revenue', 'quarterly_revenue', 'malachi_earnings', 'daniel_earnings', 'custom']),
  targetAmount: z.number().positive('Target amount must be positive'),
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD'),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be YYYY-MM-DD'),
  description: z.string().max(500).optional().nullable(),
});

const updateGoalSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  type: z.enum(['monthly_revenue', 'quarterly_revenue', 'malachi_earnings', 'daniel_earnings', 'custom']).optional(),
  targetAmount: z.number().positive().optional(),
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  description: z.string().max(500).optional().nullable(),
  status: z.enum(['active', 'completed', 'missed', 'archived']).optional(),
});

router.get('/', (req, res) => {
  const { status } = req.query as Record<string, string>;
  let query = `SELECT * FROM goals WHERE 1=1`;
  const params: any[] = [];
  if (status) { query += ` AND status = ?`; params.push(status); }
  query += ` ORDER BY created_at DESC`;
  const rows = sqlite.prepare(query).all(...params) as any[];
  res.json(rows.map(g => mapGoal(g)));
});

router.get('/:id', (req, res) => {
  const row = sqlite.prepare(`SELECT * FROM goals WHERE id = ?`).get(req.params.id) as any;
  if (!row) return res.status(404).json({ error: 'Goal not found' });
  res.json(mapGoal(row));
});

router.get('/:id/progress', (req, res) => {
  const row = sqlite.prepare(`SELECT * FROM goals WHERE id = ?`).get(req.params.id) as any;
  if (!row) return res.status(404).json({ error: 'Goal not found' });
  const currentAmount = getGoalProgress(req.params.id);
  const pct = row.target_amount > 0 ? Math.min(100, (currentAmount / row.target_amount) * 100) : 0;
  res.json({ currentAmount, targetAmount: row.target_amount, percentage: Math.round(pct * 10) / 10 });
});

router.post('/', (req, res) => {
  const parsed = createGoalSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
  }
  const { name, type, targetAmount, periodStart, periodEnd, description } = parsed.data;
  const id = randomUUID();
  const now = new Date().toISOString();
  sqlite.prepare(`INSERT INTO goals (id, created_at, updated_at, name, type, target_amount, period_start, period_end, description, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`)
    .run(id, now, now, name, type, targetAmount, periodStart, periodEnd, description ?? null);
  res.status(201).json(mapGoal(sqlite.prepare(`SELECT * FROM goals WHERE id = ?`).get(id) as any));
});

router.put('/:id', (req, res) => {
  const row = sqlite.prepare(`SELECT * FROM goals WHERE id = ?`).get(req.params.id) as any;
  if (!row) return res.status(404).json({ error: 'Goal not found' });

  const parsed = updateGoalSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
  }
  const { name, type, targetAmount, periodStart, periodEnd, description, status } = parsed.data;
  const now = new Date().toISOString();
  const completedAt = status === 'completed' && row.status !== 'completed' ? now : row.completed_at;
  sqlite.prepare(`UPDATE goals SET name=?, type=?, target_amount=?, period_start=?, period_end=?, description=?, status=?, completed_at=?, updated_at=? WHERE id=?`)
    .run(name ?? row.name, type ?? row.type, targetAmount ?? row.target_amount,
      periodStart ?? row.period_start, periodEnd ?? row.period_end,
      description !== undefined ? description : row.description,
      status ?? row.status, completedAt, now, req.params.id);
  res.json(mapGoal(sqlite.prepare(`SELECT * FROM goals WHERE id = ?`).get(req.params.id) as any));
});

router.delete('/:id', (req, res) => {
  const row = sqlite.prepare(`SELECT * FROM goals WHERE id = ?`).get(req.params.id) as any;
  if (!row) return res.status(404).json({ error: 'Goal not found' });
  sqlite.prepare(`DELETE FROM goals WHERE id = ?`).run(req.params.id);
  res.status(204).send();
});

function mapGoal(row: any) {
  return {
    id: row.id, createdAt: row.created_at, updatedAt: row.updated_at, name: row.name, type: row.type,
    targetAmount: row.target_amount, currentAmount: row.current_amount ?? 0,
    periodStart: row.period_start, periodEnd: row.period_end, description: row.description,
    status: row.status, completedAt: row.completed_at,
  };
}

export default router;
