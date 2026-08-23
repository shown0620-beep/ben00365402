import type { SQLiteDatabase } from 'expo-sqlite';

async function ensureEntryColumns(db: SQLiteDatabase) {
  const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(entries)');
  const names = new Set(columns.map((column) => column.name));

  if (!names.has('payment_method')) {
    await db.execAsync("ALTER TABLE entries ADD COLUMN payment_method TEXT NOT NULL DEFAULT '現金';");
  }
  if (!names.has('notes')) {
    await db.execAsync("ALTER TABLE entries ADD COLUMN notes TEXT NOT NULL DEFAULT '';\n");
  }
}

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
      payment_method TEXT NOT NULL DEFAULT '現金',
      payment_status TEXT NOT NULL DEFAULT 'paid',
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_entries_date ON entries(date);
    CREATE INDEX IF NOT EXISTS idx_entries_type ON entries(type);
    CREATE INDEX IF NOT EXISTS idx_entries_payment_status ON entries(payment_status);
  `);

  await ensureEntryColumns(db);

  const defaultCategories = [
    ['income', '店內營業額'],
    ['income', '外帶營業額'],
    ['income', 'foodpanda'],
    ['income', 'Uber Eats'],
    ['income', '其他收入'],

    ['purchase', '菜商'],
    ['purchase', '豬肉商'],
    ['purchase', '雞肉商'],
    ['purchase', '牛肉商'],
    ['purchase', '海鮮商'],
    ['purchase', '飲料酒類'],
    ['purchase', '調味料／乾貨'],
    ['purchase', '雜貨耗材'],
    ['purchase', '包裝材料'],

    ['staff', '員工薪資'],
    ['staff', '加班費'],
    ['staff', '勞保'],
    ['staff', '健保'],
    ['staff', '勞退'],
    ['staff', '員工獎金／福利'],
    ['staff', '其他員工開銷'],

    ['operation', '房租'],
    ['operation', '水費'],
    ['operation', '電費'],
    ['operation', '瓦斯費'],
    ['operation', '稅金'],
    ['operation', '會計費'],
    ['operation', '網路電話'],
    ['operation', 'POS／系統費'],
    ['operation', '信用卡手續費'],
    ['operation', '外送平台抽成'],
    ['operation', '設備維修'],
    ['operation', '清潔用品'],
    ['operation', '廣告行銷'],
    ['operation', '臨時開銷'],
    ['operation', '其他營運開銷'],
  ] as const;

  for (const [type, name] of defaultCategories) {
    await db.runAsync(
      'INSERT OR IGNORE INTO categories (type, name, active) VALUES (?, ?, 1)',
      type,
      name,
    );
  }
}
