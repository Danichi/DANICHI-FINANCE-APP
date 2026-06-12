import { initDb, db } from './database';
import { transactions, expenses, goals, clients, settings, rolePresets } from './schema';
import { calculateSplit } from '../lib/splitEngine';
import { randomUUID } from 'crypto';

initDb();

const CLIENTS = [
  'Silva Roofing', 'Apex HVAC', 'Green Leaf Landscaping', 'Pinnacle Plumbing',
  'Horizon Electric', 'Summit Concrete', 'Redwood Fencing', 'BlueSky Solar',
  'Ironwork Fabrication', 'Cedar Home Builders',
];

const PROJECTS = [
  'Google Ads Campaign', 'Meta Lead Gen', 'SEO + Content Strategy',
  'PPC Campaign Management', 'Social Media Ads', 'Email Marketing Setup',
  'Landing Page Optimization', 'Local SEO Campaign', 'Video Ad Production',
  'Retargeting Campaign',
];

type Assignment = 'malachi' | 'daniel' | 'split';
type WorkSplitMode = 'percentage' | 'hourly';

const ROLES: { cm: Assignment; sc: Assignment; mode: WorkSplitMode; mPct?: number; dPct?: number; mHrs?: number; dHrs?: number }[] = [
  { cm: 'malachi', sc: 'daniel', mode: 'hourly', mHrs: 14, dHrs: 6 },
  { cm: 'daniel', sc: 'malachi', mode: 'hourly', mHrs: 8, dHrs: 12 },
  { cm: 'malachi', sc: 'malachi', mode: 'percentage', mPct: 70, dPct: 30 },
  { cm: 'daniel', sc: 'daniel', mode: 'percentage', mPct: 30, dPct: 70 },
  { cm: 'split', sc: 'split', mode: 'percentage', mPct: 50, dPct: 50 },
  { cm: 'malachi', sc: 'split', mode: 'hourly', mHrs: 10, dHrs: 10 },
];

const AMOUNTS = [3500, 4200, 5000, 5800, 6500, 7000, 4800, 3800, 9000, 6200, 5500, 8000];

function dateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seed() {
  // Clear existing data
  db.delete(transactions).run();
  db.delete(expenses).run();
  db.delete(goals).run();
  db.delete(clients).run();
  db.delete(settings).run();
  db.delete(rolePresets).run();

  const now = new Date();
  const txIds: string[] = [];

  // Insert 12 months of transactions (3-5 per month)
  for (let monthOffset = 11; monthOffset >= 0; monthOffset--) {
    const d = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const txCount = randInt(3, 5);

    for (let i = 0; i < txCount; i++) {
      const id = randomUUID();
      txIds.push(id);
      const role = pick(ROLES);
      const gross = pick(AMOUNTS) + randInt(-500, 500);
      const day = randInt(1, 28);
      const paymentDate = dateStr(year, month, day);
      const clientName = pick(CLIENTS);

      const splitInput = {
        grossAmount: Math.round(gross * 100) / 100,
        clientManagerAssignment: role.cm,
        salesCommissionAssignment: role.sc,
        workSplitMode: role.mode,
        malachiWorkPercentage: role.mPct,
        danielWorkPercentage: role.dPct,
        malachiHours: role.mHrs,
        danielHours: role.dHrs,
      };
      const result = calculateSplit(splitInput);

      db.insert(transactions).values({
        id,
        createdAt: new Date(year, month - 1, day).toISOString(),
        updatedAt: new Date(year, month - 1, day).toISOString(),
        clientName,
        projectDescription: pick(PROJECTS),
        grossAmount: result.grossAmount,
        paymentDate,
        expenseDeduction: 0,
        netAmount: result.netAmount,
        clientManagerAssignment: role.cm,
        salesCommissionAssignment: role.sc,
        workSplitMode: role.mode,
        malachiWorkPercentage: result.malachiWorkPercentage,
        danielWorkPercentage: result.danielWorkPercentage,
        malachiHours: role.mHrs ?? null,
        danielHours: role.dHrs ?? null,
        businessProfitReserve: result.businessProfitReserve,
        clientManagementFee: result.clientManagementFee,
        clientManagementToMalachi: result.clientManagementToMalachi,
        clientManagementToDaniel: result.clientManagementToDaniel,
        salesCommission: result.salesCommission,
        salesCommissionToMalachi: result.salesCommissionToMalachi,
        salesCommissionToDaniel: result.salesCommissionToDaniel,
        workPool: result.workPool,
        malachiWorkPayout: result.malachiWorkPayout,
        danielWorkPayout: result.danielWorkPayout,
        malachiTotalPayout: result.malachiTotalPayout,
        danielTotalPayout: result.danielTotalPayout,
        businessTotalRetained: result.businessTotalRetained,
        explanation: result.explanation,
      }).run();
    }
  }

  // Insert unique clients
  const uniqueClients = [...new Set(CLIENTS)];
  for (const name of uniqueClients) {
    db.insert(clients).values({
      id: randomUUID(),
      name,
      createdAt: new Date().toISOString(),
      notes: null,
    }).run();
  }

  // Insert a few standalone expenses
  const expenseData = [
    { desc: 'Google Workspace (annual)', cat: 'software', amt: 180, paidBy: 'business' as const },
    { desc: 'Adobe Creative Cloud', cat: 'software', amt: 59.99, paidBy: 'malachi' as const },
    { desc: 'Meta Ads Manager Tool', cat: 'tools', amt: 49, paidBy: 'daniel' as const },
    { desc: 'Office supplies', cat: 'office', amt: 87.50, paidBy: 'malachi' as const },
    { desc: 'SEMrush subscription', cat: 'software', amt: 119.95, paidBy: 'business' as const },
  ];

  for (const e of expenseData) {
    db.insert(expenses).values({
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      date: dateStr(now.getFullYear(), now.getMonth() + 1, randInt(1, 20)),
      description: e.desc,
      amount: e.amt,
      category: e.cat,
      type: 'standalone',
      transactionId: null,
      paidBy: e.paidBy,
    }).run();
  }

  // Goals
  const firstDayThisMonth = dateStr(now.getFullYear(), now.getMonth() + 1, 1);
  const lastDayThisMonth = dateStr(now.getFullYear(), now.getMonth() + 1, 28);
  const firstDayLastQ = dateStr(now.getFullYear(), Math.max(1, now.getMonth() - 2), 1);
  const lastDayLastQ = dateStr(now.getFullYear(), now.getMonth(), 28);
  const firstDayPrevMonth = dateStr(now.getFullYear(), now.getMonth(), 1);
  const lastDayPrevMonth = dateStr(now.getFullYear(), now.getMonth(), 28);

  db.insert(goals).values({
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    name: 'Monthly Revenue Goal — June',
    type: 'monthly_revenue',
    targetAmount: 25000,
    periodStart: firstDayThisMonth,
    periodEnd: lastDayThisMonth,
    description: 'Hit $25K gross revenue this month',
    status: 'active',
    completedAt: null,
  }).run();

  db.insert(goals).values({
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    name: 'Q2 Revenue Target',
    type: 'quarterly_revenue',
    targetAmount: 75000,
    periodStart: firstDayLastQ,
    periodEnd: lastDayLastQ,
    description: 'Quarterly stretch goal',
    status: 'completed',
    completedAt: new Date().toISOString(),
  }).run();

  db.insert(goals).values({
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    name: 'Malachi Personal Goal',
    type: 'malachi_earnings',
    targetAmount: 8000,
    periodStart: firstDayPrevMonth,
    periodEnd: lastDayPrevMonth,
    description: 'Personal earnings target for the month',
    status: 'completed',
    completedAt: new Date().toISOString(),
  }).run();

  // Default settings
  const defaultSettings = [
    ['malachiName', 'Malachi'],
    ['danielName', 'Daniel'],
    ['currency', 'CAD'],
    ['defaultClientManager', 'malachi'],
    ['defaultSalesCommission', 'malachi'],
    ['defaultWorkSplitMode', 'percentage'],
    ['defaultMalachiPercentage', '50'],
    ['defaultDanielPercentage', '50'],
    ['tableDensity', 'comfortable'],
  ];

  for (const [key, value] of defaultSettings) {
    db.insert(settings).values({ key, value }).run();
  }

  // Role presets
  const presets = [
    { name: 'Malachi Handles Everything', cm: 'malachi', sc: 'malachi', mode: 'percentage', mPct: 100, dPct: 0 },
    { name: 'Daniel Handles Everything', cm: 'daniel', sc: 'daniel', mode: 'percentage', mPct: 0, dPct: 100 },
    { name: '50/50 Both', cm: 'split', sc: 'split', mode: 'percentage', mPct: 50, dPct: 50 },
    { name: 'Daniel Sold, Malachi Delivered', cm: 'malachi', sc: 'daniel', mode: 'percentage', mPct: 80, dPct: 20 },
  ];

  for (const p of presets) {
    db.insert(rolePresets).values({
      id: randomUUID(),
      name: p.name,
      clientManager: p.cm,
      salesCommission: p.sc,
      workSplitMode: p.mode,
      malachiPercentage: p.mPct,
      danielPercentage: p.dPct,
    }).run();
  }

  console.log('✓ Database seeded successfully');
  console.log(`  → ${txIds.length} transactions`);
  console.log(`  → ${uniqueClients.length} clients`);
  console.log('  → 5 expenses');
  console.log('  → 3 goals');
  console.log('  → 4 role presets');
}

seed().catch(console.error);
