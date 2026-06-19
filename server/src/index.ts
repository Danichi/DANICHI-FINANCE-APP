import express from 'express';
import cors from 'cors';
import path from 'path';
import { initDb } from './db/database';
import transactionRoutes from './routes/transactions';
import expenseRoutes from './routes/expenses';
import goalRoutes from './routes/goals';
import clientRoutes from './routes/clients';
import analyticsRoutes from './routes/analytics';
import settingsRoutes from './routes/settings';

const app = express();
const PORT = process.env.PORT || 3001;
const IS_PROD = process.env.NODE_ENV === 'production';

// Init DB on startup
initDb();

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:4173'];
app.use(cors({ origin: IS_PROD ? false : allowedOrigins }));
app.use(express.json());

app.use('/api/transactions', transactionRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Serve the built React app in production (same-origin, no CORS needed)
if (IS_PROD) {
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Danichi Finance API running on http://localhost:${PORT}`);
});
