import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import { BookkeepingEntry, Category, EntryDraft, EntryType } from '@/types/bookkeeping';

type EntryRow = {
  id: number;
  type: EntryType;
  date: string;
  category: string;
  source: string;
  description: string;
  gross_amount: number;
  fee_amount: number;
  net_amount: number;
  payment_status: 'paid' | 'unpaid';
  created_at: string;
  updated_at: string;
};

type CategoryRow = {
  id: number;
  type: EntryType;
  name: string;
  active: number;
};

type BookkeepingContextValue = {
  entries: BookkeepingEntry[];
  categories: Category[];
  loading: boolean;
  addEntry: (draft: EntryDraft) => Promise<void>;
  updateEntry: (id: number, draft: EntryDraft) => Promise<void>;
  deleteEntry: (id: number) => Promise<void>;
  togglePayment: (entry: BookkeepingEntry) => Promise<void>;
  addCategory: (type: EntryType, name: string) => Promise<void>;
  toggleCategory: (category: Category) => Promise<void>;
  refresh: () => Promise<void>;
};

const BookkeepingContext = createContext<BookkeepingContextValue | null>(null);

const mapEntry = (row: EntryRow): BookkeepingEntry => ({
  id: row.id,
  type: row.type,
  date: row.date,
  category: row.category,
  source: row.source,
  description: row.description,
  grossAmount: row.gross_amount,
  feeAmount: row.fee_amount,
  netAmount: row.net_amount,
  paymentStatus: row.payment_status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export function BookkeepingProvider({ children }: PropsWithChildren) {
  const db = useSQLiteContext();
  const [entries, setEntries] = useState<BookkeepingEntry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [entryRows, categoryRows] = await Promise.all([
      db.getAllAsync<EntryRow>('SELECT * FROM entries ORDER BY date DESC, id DESC'),
      db.getAllAsync<CategoryRow>('SELECT id, type, name, active FROM categories ORDER BY type, id'),
    ]);
    setEntries(entryRows.map(mapEntry));
    setCategories(
      categoryRows.map((row) => ({ id: row.id, type: row.type, name: row.name, active: !!row.active })),
    );
    setLoading(false);
  }, [db]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addEntry = useCallback(
    async (draft: EntryDraft) => {
      const now = new Date().toISOString();
      await db.runAsync(
        `INSERT INTO entries
          (type, date, category, source, description, gross_amount, fee_amount, net_amount, payment_status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        draft.type,
        draft.date,
        draft.category,
        draft.source.trim(),
        draft.description.trim(),
        draft.grossAmount,
        draft.feeAmount,
        draft.netAmount,
        draft.paymentStatus,
        now,
        now,
      );
      await refresh();
    },
    [db, refresh],
  );

  const updateEntry = useCallback(
    async (id: number, draft: EntryDraft) => {
      await db.runAsync(
        `UPDATE entries SET
          type = ?, date = ?, category = ?, source = ?, description = ?,
          gross_amount = ?, fee_amount = ?, net_amount = ?, payment_status = ?, updated_at = ?
         WHERE id = ?`,
        draft.type,
        draft.date,
        draft.category,
        draft.source.trim(),
        draft.description.trim(),
        draft.grossAmount,
        draft.feeAmount,
        draft.netAmount,
        draft.paymentStatus,
        new Date().toISOString(),
        id,
      );
      await refresh();
    },
    [db, refresh],
  );

  const deleteEntry = useCallback(
    async (id: number) => {
      await db.runAsync('DELETE FROM entries WHERE id = ?', id);
      await refresh();
    },
    [db, refresh],
  );

  const togglePayment = useCallback(
    async (entry: BookkeepingEntry) => {
      const next = entry.paymentStatus === 'paid' ? 'unpaid' : 'paid';
      await db.runAsync(
        'UPDATE entries SET payment_status = ?, updated_at = ? WHERE id = ?',
        next,
        new Date().toISOString(),
        entry.id,
      );
      await refresh();
    },
    [db, refresh],
  );

  const addCategory = useCallback(
    async (type: EntryType, name: string) => {
      await db.runAsync(
        `INSERT INTO categories (type, name, active) VALUES (?, ?, 1)
         ON CONFLICT(type, name) DO UPDATE SET active = 1`,
        type,
        name.trim(),
      );
      await refresh();
    },
    [db, refresh],
  );

  const toggleCategory = useCallback(
    async (category: Category) => {
      await db.runAsync('UPDATE categories SET active = ? WHERE id = ?', category.active ? 0 : 1, category.id);
      await refresh();
    },
    [db, refresh],
  );

  const value = useMemo(
    () => ({
      entries,
      categories,
      loading,
      addEntry,
      updateEntry,
      deleteEntry,
      togglePayment,
      addCategory,
      toggleCategory,
      refresh,
    }),
    [
      entries,
      categories,
      loading,
      addEntry,
      updateEntry,
      deleteEntry,
      togglePayment,
      addCategory,
      toggleCategory,
      refresh,
    ],
  );

  return <BookkeepingContext.Provider value={value}>{children}</BookkeepingContext.Provider>;
}

export function useBookkeeping() {
  const context = useContext(BookkeepingContext);
  if (!context) throw new Error('useBookkeeping must be used inside BookkeepingProvider');
  return context;
}


