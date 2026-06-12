import { Router } from 'express';
import {
  getMonthlyRevenue, getPartnerEquity, getCategoryBreakdown,
  getClientSummaries, getCumulativeEarningsByMonth,
  getMonthlyDelta, getDashboardStats,
} from '../lib/analyticsQueries';

const router = Router();

router.get('/dashboard', (_req, res) => {
  res.json(getDashboardStats());
});

router.get('/monthly-revenue', (req, res) => {
  const months = parseInt((req.query.months as string) || '12');
  res.json(getMonthlyRevenue(months));
});

router.get('/equity', (_req, res) => {
  res.json(getPartnerEquity());
});

router.get('/category-breakdown', (_req, res) => {
  res.json(getCategoryBreakdown());
});

router.get('/clients', (_req, res) => {
  res.json(getClientSummaries());
});

router.get('/cumulative-earnings', (_req, res) => {
  res.json(getCumulativeEarningsByMonth());
});

router.get('/monthly-delta', (_req, res) => {
  res.json(getMonthlyDelta());
});

export default router;
