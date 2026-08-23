import { BookkeepingEntry, EntryType, PeriodKey } from '@/types/bookkeeping';

export const formatMoney = (value: number, signed = false) => {
  const rounded = Math.round(Math.abs(value));
  const prefix = value < 0 ? '-' : signed && value > 0 ? '+' : '';
  return `${prefix}NT$ ${rounded.toLocaleString('zh-TW')}`;
};

export const todayISO = () => {
  // Taiwan stays on UTC+8 year-round. Shifting the timestamp before formatting
  // avoids reparsing locale-dependent date strings, which can fail in Hermes.
  const taipeiTimestamp = Date.now() + 8 * 60 * 60 * 1000;
  return new Date(taipeiTimestamp).toISOString().slice(0, 10);
};

export const displayDate = (date: string) => date.replaceAll('-', '/');

const localISO = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const periodRange = (period: PeriodKey): { start?: string; end?: string } => {
  const now = new Date(`${todayISO()}T12:00:00`);
  const end = localISO(now);

  if (period === 'all') return {};
  if (period === 'today') return { start: end, end };
  if (period === 'week') {
    const start = new Date(now);
    const day = start.getDay() || 7;
    start.setDate(start.getDate() - day + 1);
    return { start: localISO(start), end };
  }
  if (period === 'month') {
    return { start: localISO(new Date(now.getFullYear(), now.getMonth(), 1)), end };
  }
  if (period === 'lastMonth') {
    return {
      start: localISO(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
      end: localISO(new Date(now.getFullYear(), now.getMonth(), 0)),
    };
  }
  return { start: `${now.getFullYear()}-01-01`, end };
};

export const filterByPeriod = (entries: BookkeepingEntry[], period: PeriodKey) => {
  const { start, end } = periodRange(period);
  if (!start || !end) return entries;
  return entries.filter((entry) => entry.date >= start && entry.date <= end);
};

export const getEntryValue = (entry: BookkeepingEntry) =>
  entry.type === 'income' ? entry.netAmount : entry.grossAmount;

export const isExpense = (type: EntryType) => type !== 'income';

export const getSummary = (entries: BookkeepingEntry[]) => {
  const incomeEntries = entries.filter((entry) => entry.type === 'income');
  const expenseEntries = entries.filter((entry) => entry.type !== 'income');
  const grossIncome = incomeEntries.reduce((sum, entry) => sum + entry.grossAmount, 0);
  const fees = incomeEntries.reduce((sum, entry) => sum + entry.feeAmount, 0);
  const actualIncome = incomeEntries.reduce((sum, entry) => sum + entry.netAmount, 0);
  const expensesByType: Record<Exclude<EntryType, 'income'>, number> = {
    purchase: 0,
    staff: 0,
    operation: 0,
  };
  expenseEntries.forEach((entry) => {
    expensesByType[entry.type as Exclude<EntryType, 'income'>] += entry.grossAmount;
  });
  const totalExpense = expenseEntries.reduce((sum, entry) => sum + entry.grossAmount, 0);
  const unpaidIncome = incomeEntries.filter((entry) => entry.paymentStatus === 'unpaid');
  const unpaidExpense = expenseEntries.filter((entry) => entry.paymentStatus === 'unpaid');

  return {
    grossIncome,
    fees,
    actualIncome,
    expensesByType,
    totalExpense,
    profit: actualIncome - totalExpense,
    unpaidIncome,
    unpaidIncomeAmount: unpaidIncome.reduce((sum, entry) => sum + entry.netAmount, 0),
    unpaidExpense,
    unpaidExpenseAmount: unpaidExpense.reduce((sum, entry) => sum + entry.grossAmount, 0),
  };
};

