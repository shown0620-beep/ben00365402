import type { SQLiteDatabase } from 'expo-sqlite';

export async function initializeDatabase(db: SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(type, name)
    );

    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      date TEXT NOT NULL,
      category TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      gross_amount REAL NOT NULL DEFAULT 0,
      fee_amount REAL NOT NULL DEFAULT 0,
      net_amount REAL NOT NULL DEFAULT 0,
      payment_status TEXT NOT NULL DEFAULT 'paid',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_entries_date ON entries(date);
    CREATE INDEX IF NOT EXISTS idx_entries_type ON entries(type);
    CREATE INDEX IF NOT EXISTS idx_entries_payment_status ON entries(payment_status);
  `);

  const defaultCategories = [
    ['income', '店內營業額'],
    ['income', '外帶營業額'],
    ['income', 'foodpanda'],
    ['income', 'Uber Eats'],
    ['income', '其他收入'],
    ['purchase', '蔬菜'],
    ['purchase', '肉品'],
    ['purchase', '海鮮'],
    ['purchase', '飲料／酒水'],
    ['purchase', '包材／耗材'],
    ['purchase', '其他進貨'],
    ['staff', '薪資'],
    ['staff', '獎金'],
    ['staff', '勞健保'],
    ['staff', '員工餐'],
    ['staff', '其他員工開銷'],
    ['operation', '租金'],
    ['operation', '水電瓦斯'],
    ['operation', '設備維修'],
    ['operation', '廣告行銷'],
    ['operation', '清潔用品'],
    ['operation', '其他營運開銷'],
  ];

  for (const [type, name] of defaultCategories) {
    await db.runAsync(
      'INSERT OR IGNORE INTO categories (type, name, active) VALUES (?, ?, 1)',
      type,
      name,
    );
  }
}


