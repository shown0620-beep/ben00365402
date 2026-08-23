export type EntryType = 'income' | 'purchase' | 'staff' | 'operation';
export type PaymentStatus = 'paid' | 'unpaid';

export type BookkeepingEntry = {
  id: number;
  type: EntryType;
  date: string;
  category: string;
  source: string;
  description: string;
  grossAmount: number;
  feeAmount: number;
  netAmount: number;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
};

export type EntryDraft = Omit<BookkeepingEntry, 'id' | 'createdAt' | 'updatedAt'>;

export type Category = {
  id: number;
  type: EntryType;
  name: string;
  active: boolean;
};

export type PeriodKey = 'today' | 'week' | 'month' | 'lastMonth' | 'year' | 'all';

export const ENTRY_TYPE_LABELS: Record<EntryType, string> = {
  income: '收入',
  purchase: '進貨',
  staff: '員工',
  operation: '營運',
};

export const ENTRY_TYPE_EMOJI: Record<EntryType, string> = {
  income: '↗',
  purchase: '🥬',
  staff: '👥',
  operation: '🏪',
};

export const PERIOD_LABELS: Record<PeriodKey, string> = {
  today: '今天',
  week: '本週',
  month: '本月',
  lastMonth: '上月',
  year: '今年',
  all: '全部',
};


