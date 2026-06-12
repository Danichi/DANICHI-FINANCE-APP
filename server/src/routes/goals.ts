import { Router } from 'express';
import { sqlite } from '../db/database';
import { getGoalProgress } from '../lib/analyticsQueries';
import { randomUUID } from 'crypto';

const router = Router();

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
  const { name, type, targetAmount, periodStart, periodEnd, description } = req.body;
  if (!name || !type || !targetAmount || !periodStart || !periodEnd) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const id = randomUUID();
  const now = new Date().toISOString();
  sqlite.prepare(`INSERT INTO goals (id, created_at, updated_at, name, type, target_amount, period_start, period_end, description, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`)
    .run(id, now, now, name, type, parseFloat(targetAmount), periodStart, periodEnd, description || null);
  res.status(201).json(mapGoal(sqlite.prepare(`SELECT * FROM goals WHERE id = ?`).get(id) as any));
});

router.put('/:id', (req, res) => {
  const row = sqlite.prepare(`SELECT * FROM goals WHERE id = ?`).get(req.params.id) as any;
  if (!row) return res.status(404).json({ error: 'Goal not found' });
  const { name, type, targetAmount, periodStart, periodEnd, description, status } = req.body;
  const now = new Date().toISOString();
  const completedAt = status === 'completed' && row.status !== 'completed' ? now : row.completed_at;
  sqlite.prepare(`UPDATE goals SET name=?, type=?, target_amount=?, period_start=?, period_end=?, description=?, status=?, completed_at=?, updated_at=? WHERE id=?`)
    .run(name ?? row.name, type ?? row.type, targetAmount ? parseFloat(targetAmount) : row.target_amount,
      periodStart ?? row.period_start, periodEnd ?? row.period_end, description ?? row.description,
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
