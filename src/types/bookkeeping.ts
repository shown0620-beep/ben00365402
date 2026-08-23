export type EntryType = 'income' | 'purchase' | 'staff' | 'operation';
export type PaymentStatus = 'paid' | 'unpaid';
export type PaymentMethod = '現金' | '信用卡' | '行動支付' | '銀行轉帳' | '外送平台代收' | '其他';

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
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  notes: string;
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

export const PAYMENT_METHODS: PaymentMethod[] = ['現金', '信用卡', '行動支付', '銀行轉帳', '外送平台代收', '其他'];

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
