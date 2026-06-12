import { Router } from 'express';
import { sqlite } from '../db/database';
import { randomUUID } from 'crypto';

const router = Router();

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
  const { date, description, amount, category, type, transactionId, paidBy } = req.body;
  if (!date || !description || !amount || !category || !type || !paidBy) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const id = randomUUID();
  const now = new Date().toISOString();
  sqlite.prepare(`INSERT INTO expenses (id, created_at, date, description, amount, category, type, transaction_id, paid_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, now, date, description, parseFloat(amount), category, type, transactionId || null, paidBy);
  res.status(201).json(mapExpense(sqlite.prepare(`SELECT * FROM expenses WHERE id = ?`).get(id) as any));
});

router.put('/:id', (req, res) => {
  const row = sqlite.prepare(`SELECT * FROM expenses WHERE id = ?`).get(req.params.id) as any;
  if (!row) return res.status(404).json({ error: 'Expense not found' });
  const { date, description, amount, category, type, transactionId, paidBy } = req.body;
  sqlite.prepare(`UPDATE expenses SET date=?, description=?, amount=?, category=?, type=?, transaction_id=?, paid_by=? WHERE id=?`)
    .run(date ?? row.date, description ?? row.description, amount ? parseFloat(amount) : row.amount,
      category ?? row.category, type ?? row.type, transactionId ?? row.transaction_id, paidBy ?? row.paid_by, req.params.id);
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
