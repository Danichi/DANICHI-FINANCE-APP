import { Hono } from 'hono';
import { cors } from 'hono/cors';
import transactions from './routes/transactions';
import expenses from './routes/expenses';
import goals from './routes/goals';
import clients from './routes/clients';
import analytics from './routes/analytics';
import settings from './routes/settings';

export interface Env {
  DB: D1Database;
  CORS_ORIGIN: string;
}

const app = new Hono<{ Bindings: Env }>();

app.use('*', async (c, next) => {
  const origins = (c.env.CORS_ORIGIN ?? 'http://localhost:5173').split(',').map(s => s.trim());
  return cors({ origin: origins, allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] })(c, next);
});

app.route('/api/transactions', transactions);
app.route('/api/expenses', expenses);
app.route('/api/goals', goals);
app.route('/api/clients', clients);
app.route('/api/analytics', analytics);
app.route('/api/settings', settings);

app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

export default app;
