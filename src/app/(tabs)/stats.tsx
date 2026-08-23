import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PeriodPicker } from '@/components/period-picker';
import { Screen } from '@/components/screen';
import { Card, EmptyState, PageHeader, SectionTitle } from '@/components/ui';
import { colors, radius } from '@/constants/app-theme';
import { useBookkeeping } from '@/context/bookkeeping-context';
import { PeriodKey } from '@/types/bookkeeping';
import { filterByPeriod, formatMoney, getEntryValue, getSummary } from '@/utils/format';

type CategoryTotal = { name: string; value: number; income: boolean };

export default function StatsScreen() {
  const { entries } = useBookkeeping();
  const [period, setPeriod] = useState<PeriodKey>('month');
  const filtered = useMemo(() => filterByPeriod(entries, period), [entries, period]);
  const summary = useMemo(() => getSummary(filtered), [filtered]);

  const categoryTotals = useMemo(() => {
    const map = new Map<string, CategoryTotal>();
    filtered.forEach((entry) => {
      const income = entry.type === 'income';
      const key = `${income ? 'income' : 'expense'}:${entry.category}`;
      const current = map.get(key) ?? { name: entry.category, value: 0, income };
      current.value += getEntryValue(entry);
      map.set(key, current);
    });
    return [...map.values()].sort((a, b) => b.value - a.value);
  }, [filtered]);

  const incomeCategories = categoryTotals.filter((item) => item.income);
  const expenseCategories = categoryTotals.filter((item) => !item.income);

  return (
    <Screen>
      <PageHeader eyebrow="INSIGHTS" title="營運統計" />
      <PeriodPicker onChange={setPeriod} value={period} />

      <Card style={styles.hero}>
        <Text style={styles.heroLabel}>本期實際盈虧</Text>
        <Text style={[styles.heroValue, { color: summary.profit >= 0 ? colors.income : colors.expense }]}>
          {formatMoney(summary.profit, true)}
        </Text>
        <View style={styles.heroTrack}>
          <View
            style={[
              styles.heroFill,
              {
                width: `${summary.actualIncome + summary.totalExpense === 0 ? 50 : Math.max(8, Math.min(92, (summary.actualIncome / (summary.actualIncome + summary.totalExpense)) * 100))}%`,
              },
            ]}
          />
        </View>
        <View style={styles.legendRow}>
          <Legend label="收入" value={summary.actualIncome} color={colors.income} />
          <Legend label="支出" value={summary.totalExpense} color={colors.expense} />
        </View>
      </Card>

      <SectionTitle>支出結構</SectionTitle>
      <View style={styles.typeGrid}>
        <TypeCard label="進貨開銷" value={summary.expensesByType.purchase} emoji="🥬" />
        <TypeCard label="員工開銷" value={summary.expensesByType.staff} emoji="👥" />
        <TypeCard label="營運開銷" value={summary.expensesByType.operation} emoji="🏪" />
        <TypeCard label="平台抽成" value={summary.fees} emoji="%" />
      </View>

      <SectionTitle>支出分類排行</SectionTitle>
      <Card style={styles.rankingCard}>
        {expenseCategories.length ? (
          expenseCategories.map((item) => (
            <CategoryBar key={`expense-${item.name}`} item={item} max={expenseCategories[0]?.value || 1} />
          ))
        ) : (
          <EmptyState emoji="📊" title="還沒有支出資料" description="新增收支後，分類排行會自動出現在這裡。" />
        )}
      </Card>

      <SectionTitle>收入來源排行</SectionTitle>
      <Card style={styles.rankingCard}>
        {incomeCategories.length ? (
          incomeCategories.map((item) => (
            <CategoryBar key={`income-${item.name}`} item={item} max={incomeCategories[0]?.value || 1} />
          ))
        ) : (
          <EmptyState emoji="↗" title="還沒有收入資料" description="開始記帳後，收入來源會自動彙整。" />
        )}
      </Card>
    </Screen>
  );
}

function Legend({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.legend}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <View>
        <Text style={styles.legendLabel}>{label}</Text>
        <Text style={styles.legendValue}>{formatMoney(value)}</Text>
      </View>
    </View>
  );
}

function TypeCard({ label, value, emoji }: { label: string; value: number; emoji: string }) {
  return (
    <View style={styles.typeCard}>
      <Text style={styles.typeEmoji}>{emoji}</Text>
      <Text style={styles.typeLabel}>{label}</Text>
      <Text style={styles.typeValue}>{formatMoney(value)}</Text>
    </View>
  );
}

function CategoryBar({ item, max }: { item: CategoryTotal; max: number }) {
  const width = Math.max(5, (item.value / max) * 100);
  const color = item.income ? colors.income : colors.primary;
  return (
    <View style={styles.barItem}>
      <View style={styles.barHeader}>
        <Text style={styles.barName}>{item.name}</Text>
        <Text style={styles.barValue}>{formatMoney(item.value)}</Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { backgroundColor: color, width: `${width}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { marginTop: 18 },
  heroLabel: { color: colors.inkMuted, fontSize: 13, fontWeight: '800' },
  heroValue: { fontSize: 32, lineHeight: 40, fontWeight: '900', marginTop: 6 },
  heroTrack: { height: 9, marginTop: 22, borderRadius: radius.pill, overflow: 'hidden', backgroundColor: colors.expenseSoft },
  heroFill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.income },
  legendRow: { flexDirection: 'row', gap: 24, marginTop: 18 },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 9, height: 9, borderRadius: 5 },
  legendLabel: { color: colors.inkMuted, fontSize: 11 },
  legendValue: { color: colors.ink, fontSize: 13, fontWeight: '900', marginTop: 2 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeCard: { width: '48.5%', minHeight: 112, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 14 },
  typeEmoji: { fontSize: 19, fontWeight: '900' },
  typeLabel: { color: colors.inkMuted, fontSize: 12, fontWeight: '700', marginTop: 11 },
  typeValue: { color: colors.ink, fontSize: 16, fontWeight: '900', marginTop: 4 },
  rankingCard: { paddingBottom: 4 },
  barItem: { marginBottom: 18 },
  barHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 8 },
  barName: { flex: 1, color: colors.ink, fontSize: 14, fontWeight: '800' },
  barValue: { color: colors.ink, fontSize: 13, fontWeight: '900' },
  barTrack: { height: 7, borderRadius: radius.pill, backgroundColor: colors.surfaceSoft, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: radius.pill },
});


