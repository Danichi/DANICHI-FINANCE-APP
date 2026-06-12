import express from 'express';
import cors from 'cors';
import { initDb } from './db/database';
import transactionRoutes from './routes/transactions';
import expenseRoutes from './routes/expenses';
import goalRoutes from './routes/goals';
import clientRoutes from './routes/clients';
import analyticsRoutes from './routes/analytics';
import settingsRoutes from './routes/settings';

const app = express();
const PORT = process.env.PORT || 3001;

// Init DB on startup
initDb();

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }));
app.use(express.json());

app.use('/api/transactions', transactionRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.listen(PORT, () => {
  console.log(`Danichi Finance API running on http://localhost:${PORT}`);
});
