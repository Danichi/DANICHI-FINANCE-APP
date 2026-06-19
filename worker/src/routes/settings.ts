import { Hono } from 'hono';
import type { Env } from '../index';

const router = new Hono<{ Bindings: Env }>();

router.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(`SELECT * FROM settings`)
    .all<{ key: string; value: string }>();
  const out: Record<string, string> = {};
  results.forEach(r => { out[r.key] = r.value; });
  return c.json(out);
});

router.put('/', async (c) => {
  const body = await c.req.json<Record<string, string>>();
  const stmts = Object.entries(body).map(([key, value]) =>
    c.env.DB.prepare(
      `INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`
    ).bind(key, String(value))
  );
  if (stmts.length > 0) await c.env.DB.batch(stmts);

  const { results } = await c.env.DB.prepare(`SELECT * FROM settings`)
    .all<{ key: string; value: string }>();
  const out: Record<string, string> = {};
  results.forEach(r => { out[r.key] = r.value; });
  return c.json(out);
});

router.get('/presets', async (c) => {
  const { results } = await c.env.DB.prepare(`SELECT * FROM role_presets ORDER BY name`)
    .all<Record<string, unknown>>();
  return c.json(results.map(mapPreset));
});

router.post('/presets', async (c) => {
  const body = await c.req.json<{
    id?: string; name: string; clientManager: string; salesCommission: string;
    workSplitMode: string; malachiPercentage?: number; danielPercentage?: number;
  }>();
  const presetId = body.id ?? crypto.randomUUID();

  await c.env.DB.prepare(
    `INSERT OR REPLACE INTO role_presets (id, name, client_manager, sales_commission, work_split_mode, malachi_percentage, daniel_percentage) VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(presetId, body.name, body.clientManager, body.salesCommission, body.workSplitMode,
    body.malachiPercentage ?? null, body.danielPercentage ?? null).run();

  const saved = await c.env.DB.prepare(`SELECT * FROM role_presets WHERE id = ?`)
    .bind(presetId).first<Record<string, unknown>>();
  return c.json(mapPreset(saved!), 201);
});

router.delete('/presets/:id', async (c) => {
  await c.env.DB.prepare(`DELETE FROM role_presets WHERE id = ?`).bind(c.req.param('id')).run();
  return new Response(null, { status: 204 });
});

function mapPreset(row: Record<string, unknown>) {
  return {
    id: row.id, name: row.name, clientManager: row.client_manager,
    salesCommission: row.sales_commission, workSplitMode: row.work_split_mode,
    malachiPercentage: row.malachi_percentage, danielPercentage: row.daniel_percentage,
  };
}

export default router;
