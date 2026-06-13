import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import path from 'path';

const DB_PATH = process.env.DB_PATH ?? path.join(__dirname, '../../danichi.db');

const sqlite = new Database(DB_PATH);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });

export function initDb() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      client_name TEXT NOT NULL,
      project_description TEXT,
      gross_amount REAL NOT NULL,
      payment_date TEXT NOT NULL,
      expense_deduction REAL DEFAULT 0 NOT NULL,
      net_amount REAL NOT NULL,
      client_manager_assignment TEXT NOT NULL,
      sales_commission_assignment TEXT NOT NULL,
      work_split_mode TEXT NOT NULL,
      malachi_work_percentage REAL,
      daniel_work_percentage REAL,
      malachi_hours REAL,
      daniel_hours REAL,
      business_profit_reserve REAL NOT NULL,
      client_management_fee REAL NOT NULL,
      client_management_to_malachi REAL NOT NULL,
      client_management_to_daniel REAL NOT NULL,
      sales_commission REAL NOT NULL,
      sales_commission_to_malachi REAL NOT NULL,
      sales_commission_to_daniel REAL NOT NULL,
      work_pool REAL NOT NULL,
      malachi_work_payout REAL NOT NULL,
      daniel_work_payout REAL NOT NULL,
      malachi_total_payout REAL NOT NULL,
      daniel_total_payout REAL NOT NULL,
      business_total_retained REAL NOT NULL,
      explanation TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      type TEXT NOT NULL,
      transaction_id TEXT REFERENCES transactions(id),
      paid_by TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      target_amount REAL NOT NULL,
      period_start TEXT NOT NULL,
      period_end TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'active' NOT NULL,
      completed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS role_presets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      client_manager TEXT NOT NULL,
      sales_commission TEXT NOT NULL,
      work_split_mode TEXT NOT NULL,
      malachi_percentage REAL,
      daniel_percentage REAL
    );
  `);
}

export { sqlite };
