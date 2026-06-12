import { Router } from 'express';
import { sqlite } from '../db/database';
import { randomUUID } from 'crypto';

const router = Router();

router.get('/', (req, res) => {
  const rows = sqlite.prepare(`
    SELECT
      c.id, c.name, c.created_at, c.notes,
      COUNT(t.id) as transaction_count,
      COALESCE(SUM(t.gross_amount), 0) as total_revenue,
      COALESCE(AVG(t.gross_amount), 0) as avg_transaction_value,
      MAX(t.payment_date) as last_payment_date
    FROM clients c
    LEFT JOIN transactions t ON t.client_name = c.name
    GROUP BY c.id
    ORDER BY total_revenue DESC
  `).all() as any[];
  res.json(rows.map(mapClient));
});

router.get('/:id', (req, res) => {
  const row = sqlite.prepare(`SELECT * FROM clients WHERE id = ?`).get(req.params.id) as any;
  if (!row) return res.status(404).json({ error: 'Client not found' });
  const stats = sqlite.prepare(`
    SELECT COUNT(*) as count, COALESCE(SUM(gross_amount), 0) as revenue, MAX(payment_date) as last
    FROM transactions WHERE client_name = ?
  `).get(row.name) as any;
  res.json({ ...mapClient({ ...row, transaction_count: stats.count, total_revenue: stats.revenue, last_payment_date: stats.last }) });
});

router.post('/', (req, res) => {
  const { name, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const id = randomUUID();
  try {
    sqlite.prepare(`INSERT INTO clients (id, name, created_at, notes) VALUES (?, ?, ?, ?)`).run(id, name, new Date().toISOString(), notes || null);
    res.status(201).json(mapClient(sqlite.prepare(`SELECT * FROM clients WHERE id = ?`).get(id) as any));
  } catch {
    res.status(409).json({ error: 'Client already exists' });
  }
});

router.put('/:id', (req, res) => {
  const row = sqlite.prepare(`SELECT * FROM clients WHERE id = ?`).get(req.params.id) as any;
  if (!row) return res.status(404).json({ error: 'Client not found' });
  const { name, notes } = req.body;
  sqlite.prepare(`UPDATE clients SET name=?, notes=? WHERE id=?`).run(name ?? row.name, notes ?? row.notes, req.params.id);
  res.json(mapClient(sqlite.prepare(`SELECT * FROM clients WHERE id = ?`).get(req.params.id) as any));
});

function mapClient(row: any) {
  return {
    id: row.id, name: row.name, createdAt: row.created_at, notes: row.notes,
    transactionCount: row.transaction_count ?? 0,
    totalRevenue: row.total_revenue ?? 0,
    avgTransactionValue: row.avg_transaction_value ?? 0,
    lastPaymentDate: row.last_payment_date ?? null,
  };
}

export default router;
