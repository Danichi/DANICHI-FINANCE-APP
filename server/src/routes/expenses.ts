import { Router } from 'express';
import { z } from 'zod';
import { sqlite } from '../db/database';
import { randomUUID } from 'crypto';

const router = Router();

const createExpenseSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  description: z.string().min(1, 'Description is required').max(500),
  amount: z.number().positive('Amount must be positive').max(10_000_000),
  category: z.enum(['software', 'ads', 'tools', 'office', 'other']),
  type: z.enum(['project', 'standalone']),
  paidBy: z.enum(['malachi', 'daniel', 'business']),
  transactionId: z.string().uuid().optional().nullable(),
});

const updateExpenseSchema = createExpenseSchema.partial();

router.get('/', (req, res) => {
  const { type, category, dateFrom, dateTo, page = '1', limit = '50' } = req.query as Record<string, string>;
  let query = `SELECT * FROM expenses WHERE 1=1`;
  const params: any[] = [];
  if (type) { query += ` AND type = ?`; params.push(type); }
  if (category) { query += ` AND category = ?`; params.push(category); }
  if (dateFrom) { query += ` AND date >= ?`; params.push(dateFrom); }
  if (dateTo) { query += ` AND date <= ?`; params.push(dateTo); }
  query += ` ORDER BY date DESC`;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(200, parseInt(limit));
  const offset = (pageNum - 1) * limitNum;
  const total = (sqlite.prepare(query.replace('SELECT *', 'SELECT COUNT(*) as count')).get(...params) as any)?.count ?? 0;
  const data = sqlite.prepare(query + ` LIMIT ? OFFSET ?`).all(...params, limitNum, offset);
  res.json({ data: data.map(mapExpense), total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) });
});

router.get('/:id', (req, res) => {
  const row = sqlite.prepare(`SELECT * FROM expenses WHERE id = ?`).get(req.params.id) as any;
  if (!row) return res.status(404).json({ error: 'Expense not found' });
  res.json(mapExpense(row));
});

router.post('/', (req, res) => {
  const parsed = createExpenseSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
  }
  const { date, description, amount, category, type, transactionId, paidBy } = parsed.data;
  const id = randomUUID();
  const now = new Date().toISOString();
  sqlite.prepare(`INSERT INTO expenses (id, created_at, date, description, amount, category, type, transaction_id, paid_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, now, date, description, amount, category, type, transactionId ?? null, paidBy);
  res.status(201).json(mapExpense(sqlite.prepare(`SELECT * FROM expenses WHERE id = ?`).get(id) as any));
});

router.put('/:id', (req, res) => {
  const row = sqlite.prepare(`SELECT * FROM expenses WHERE id = ?`).get(req.params.id) as any;
  if (!row) return res.status(404).json({ error: 'Expense not found' });

  const parsed = updateExpenseSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
  }
  const { date, description, amount, category, type, transactionId, paidBy } = parsed.data;
  sqlite.prepare(`UPDATE expenses SET date=?, description=?, amount=?, category=?, type=?, transaction_id=?, paid_by=? WHERE id=?`)
    .run(date ?? row.date, description ?? row.description, amount ?? row.amount,
      category ?? row.category, type ?? row.type,
      transactionId !== undefined ? transactionId : row.transaction_id,
      paidBy ?? row.paid_by, req.params.id);
  res.json(mapExpense(sqlite.prepare(`SELECT * FROM expenses WHERE id = ?`).get(req.params.id) as any));
});

router.delete('/:id', (req, res) => {
  const row = sqlite.prepare(`SELECT * FROM expenses WHERE id = ?`).get(req.params.id) as any;
  if (!row) return res.status(404).json({ error: 'Expense not found' });
  sqlite.prepare(`DELETE FROM expenses WHERE id = ?`).run(req.params.id);
  res.status(204).send();
});

function mapExpense(row: any) {
  return {
    id: row.id, createdAt: row.created_at, date: row.date, description: row.description,
    amount: row.amount, category: row.category, type: row.type,
    transactionId: row.transaction_id, paidBy: row.paid_by,
  };
}

export default router;
