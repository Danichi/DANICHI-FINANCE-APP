import { Router } from 'express';
import { randomUUID } from 'crypto';
import { sqlite } from '../db/database';

const router = Router();

router.get('/', (_req, res) => {
  const rows = sqlite.prepare(`SELECT * FROM settings`).all() as any[];
  const settings: Record<string, string> = {};
  rows.forEach(r => { settings[r.key] = r.value; });
  res.json(settings);
});

router.put('/', (req, res) => {
  const entries = Object.entries(req.body as Record<string, string>);
  const upsert = sqlite.prepare(`INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`);
  for (const [key, value] of entries) {
    upsert.run(key, String(value));
  }
  const rows = sqlite.prepare(`SELECT * FROM settings`).all() as any[];
  const settings: Record<string, string> = {};
  rows.forEach(r => { settings[r.key] = r.value; });
  res.json(settings);
});

router.get('/presets', (_req, res) => {
  const rows = sqlite.prepare(`SELECT * FROM role_presets ORDER BY name`).all() as any[];
  res.json(rows.map(mapPreset));
});

router.post('/presets', (req, res) => {
  const { id, name, clientManager, salesCommission, workSplitMode, malachiPercentage, danielPercentage } = req.body;
  const presetId = id || randomUUID();
  sqlite.prepare(`INSERT OR REPLACE INTO role_presets (id, name, client_manager, sales_commission, work_split_mode, malachi_percentage, daniel_percentage) VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .run(presetId, name, clientManager, salesCommission, workSplitMode, malachiPercentage ?? null, danielPercentage ?? null);
  res.status(201).json(mapPreset(sqlite.prepare(`SELECT * FROM role_presets WHERE id = ?`).get(presetId) as any));
});

router.delete('/presets/:id', (req, res) => {
  sqlite.prepare(`DELETE FROM role_presets WHERE id = ?`).run(req.params.id);
  res.status(204).send();
});

function mapPreset(row: any) {
  return {
    id: row.id, name: row.name, clientManager: row.client_manager, salesCommission: row.sales_commission,
    workSplitMode: row.work_split_mode, malachiPercentage: row.malachi_percentage, danielPercentage: row.daniel_percentage,
  };
}

export default router;
