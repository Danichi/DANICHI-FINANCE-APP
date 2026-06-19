import { Hono } from 'hono';
import type { Env } from '../index';

const router = new Hono<{ Bindings: Env }>();

function mapClient(row: Record<string, unknown>) {
  return {
    id: row.id, name: row.name, createdAt: row.created_at, notes: row.notes,
    transactionCount: (row.transaction_count as number) ?? 0,
    totalRevenue: (row.total_revenue as number) ?? 0,
    avgTransactionValue: (row.avg_transaction_value as number) ?? 0,
    lastPaymentDate: row.last_payment_date ?? null,
  };
}

router.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(`
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
  `).all<Record<string, unknown>>();
  return c.json(results.map(mapClient));
});

router.get('/:id', async (c) => {
  const id = c.req.param('id');
  const row = await c.env.DB.prepare(`SELECT * FROM clients WHERE id = ?`)
    .bind(id).first<Record<string, unknown>>();
  if (!row) return c.json({ error: 'Client not found' }, 404);

  const stats = await c.env.DB.prepare(
    `SELECT COUNT(*) as count, COALESCE(SUM(gross_amount), 0) as revenue, MAX(payment_date) as last FROM transactions WHERE client_name = ?`
  ).bind(row.name).first<{ count: number; revenue: number; last: string | null }>();

  return c.json(mapClient({
    ...row,
    transaction_count: stats?.count ?? 0,
    total_revenue: stats?.revenue ?? 0,
    last_payment_date: stats?.last ?? null,
  }));
});

router.post('/', async (c) => {
  const { name, notes } = await c.req.json<{ name?: string; notes?: string }>();
  if (!name) return c.json({ error: 'Name is required' }, 400);

  const id = crypto.randomUUID();
  try {
    await c.env.DB.prepare(`INSERT INTO clients (id, name, created_at, notes) VALUES (?, ?, ?, ?)`)
      .bind(id, name, new Date().toISOString(), notes ?? null).run();
    const saved = await c.env.DB.prepare(`SELECT * FROM clients WHERE id = ?`)
      .bind(id).first<Record<string, unknown>>();
    return c.json(mapClient(saved!), 201);
  } catch {
    return c.json({ error: 'Client already exists' }, 409);
  }
});

router.put('/:id', async (c) => {
  const id = c.req.param('id');
  const row = await c.env.DB.prepare(`SELECT * FROM clients WHERE id = ?`)
    .bind(id).first<Record<string, unknown>>();
  if (!row) return c.json({ error: 'Client not found' }, 404);

  const { name, notes } = await c.req.json<{ name?: string; notes?: string }>();
  await c.env.DB.prepare(`UPDATE clients SET name=?, notes=? WHERE id=?`)
    .bind(name ?? row.name, notes ?? row.notes, id).run();

  const updated = await c.env.DB.prepare(`SELECT * FROM clients WHERE id = ?`)
    .bind(id).first<Record<string, unknown>>();
  return c.json(mapClient(updated!));
});

export default router;
