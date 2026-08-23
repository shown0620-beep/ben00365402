import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { EntryRow } from '@/components/entry-row';
import { PeriodPicker } from '@/components/period-picker';
import { Screen } from '@/components/screen';
import { Card, EmptyState, PageHeader, SectionTitle } from '@/components/ui';
import { colors, radius } from '@/constants/app-theme';
import { useBookkeeping } from '@/context/bookkeeping-context';
import { PeriodKey } from '@/types/bookkeeping';
import { filterByPeriod, formatMoney, getSummary } from '@/utils/format';

export default function HomeScreen() {
  const { entries, loading } = useBookkeeping();
  const [period, setPeriod] = useState<PeriodKey>('month');
  const filtered = useMemo(() => filterByPeriod(entries, period), [entries, period]);
  const summary = useMemo(() => getSummary(filtered), [filtered]);

  const openEntry = (id: number) => router.push({ pathname: '/transaction/[id]', params: { id: String(id) } });

  return (
    <Screen>
      <PageHeader
        eyebrow="RESTAURANT LEDGER"
        title="餐廳收支"
        right={
          <Pressable onPress={() => router.push('/(tabs)/add')} style={styles.quickAdd}>
            <Text style={styles.quickAddText}>＋</Text>
          </Pressable>
        }
      />
      <PeriodPicker onChange={setPeriod} value={period} />

      <Card style={[styles.profitCard, summary.profit < 0 && styles.lossCard]}>
        <Text style={styles.profitEyebrow}>實際盈虧</Text>
        <Text numberOfLines={1} adjustsFontSizeToFit style={styles.profitValue}>{formatMoney(summary.profit, true)}</Text>
        <View style={styles.profitFoot}>
          <View>
            <Text style={styles.profitSmallLabel}>實際收入</Text>
            <Text style={styles.profitSmallValue}>{formatMoney(summary.actualIncome)}</Text>
          </View>
          <View style={styles.profitDivider} />
          <View>
            <Text style={styles.profitSmallLabel}>總支出</Text>
            <Text style={styles.profitSmallValue}>{formatMoney(summary.totalExpense)}</Text>
          </View>
        </View>
      </Card>

      <View style={styles.twoColumns}>
        <Card style={styles.summaryCard}>
          <View style={[styles.dot, { backgroundColor: colors.income }]} />
          <Text style={styles.summaryLabel}>總營業額</Text>
          <Text style={styles.summaryValue}>{formatMoney(summary.grossIncome)}</Text>
          <Text style={styles.summaryMeta}>抽成 {formatMoney(summary.fees)}</Text>
        </Card>
        <Card style={styles.summaryCard}>
          <View style={[styles.dot, { backgroundColor: colors.expense }]} />
          <Text style={styles.summaryLabel}>本期支出</Text>
          <Text style={styles.summaryValue}>{formatMoney(summary.totalExpense)}</Text>
          <Text style={styles.summaryMeta}>共 {filtered.filter((item) => item.type !== 'income').length} 筆</Text>
        </Card>
      </View>

      <SectionTitle>待處理</SectionTitle>
      <View style={styles.pendingRow}>
        <Pressable onPress={() => router.push({ pathname: '/(tabs)/records', params: { status: 'unpaid', type: 'income' } })} style={[styles.pendingCard, styles.pendingIncome]}>
          <Text style={styles.pendingIcon}>↓</Text>
          <Text style={styles.pendingTitle}>尚未收款</Text>
          <Text style={styles.pendingAmount}>{formatMoney(summary.unpaidIncomeAmount)}</Text>
          <Text style={styles.pendingMeta}>{summary.unpaidIncome.length} 筆待確認</Text>
        </Pressable>
        <Pressable onPress={() => router.push({ pathname: '/(tabs)/records', params: { status: 'unpaid', type: 'expense' } })} style={[styles.pendingCard, styles.pendingExpense]}>
          <Text style={styles.pendingIcon}>↑</Text>
          <Text style={styles.pendingTitle}>尚未付款</Text>
          <Text style={styles.pendingAmount}>{formatMoney(summary.unpaidExpenseAmount)}</Text>
          <Text style={styles.pendingMeta}>{summary.unpaidExpense.length} 筆待處理</Text>
        </Pressable>
      </View>

      <SectionTitle
        aside={<Pressable onPress={() => router.push('/(tabs)/records')}><Text style={styles.viewAll}>查看全部</Text></Pressable>}>
        最近紀錄
      </SectionTitle>
      <Card style={styles.listCard}>
        {loading ? (
          <Text style={styles.loading}>正在整理帳目…</Text>
        ) : filtered.length ? (
          filtered.slice(0, 5).map((entry) => <EntryRow entry={entry} key={entry.id} onPress={() => openEntry(entry.id)} />)
        ) : (
          <EmptyState emoji="🧾" title="還沒有紀錄" description="點下方「記一筆」，幾秒鐘就能完成第一筆帳。" />
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  quickAdd: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  quickAddText: { color: colors.white, fontSize: 27, lineHeight: 29, fontWeight: '700' },
  profitCard: { marginTop: 18, backgroundColor: colors.ink, borderColor: colors.ink, padding: 22 },
  lossCard: { backgroundColor: '#6F322E', borderColor: '#6F322E' },
  profitEyebrow: { color: '#BFD1CA', fontSize: 13, fontWeight: '800', letterSpacing: 0.8 },
  profitValue: { color: colors.white, fontSize: 36, lineHeight: 44, fontWeight: '900', marginTop: 8, marginBottom: 22 },
  profitFoot: { flexDirection: 'row', alignItems: 'center', gap: 22 },
  profitSmallLabel: { color: '#BFD1CA', fontSize: 11, marginBottom: 4 },
  profitSmallValue: { color: colors.white, fontSize: 14, fontWeight: '800' },
  profitDivider: { width: 1, height: 34, backgroundColor: '#496158' },
  twoColumns: { flexDirection: 'row', gap: 12, marginTop: 12 },
  summaryCard: { flex: 1, padding: 15, borderRadius: radius.md },
  dot: { width: 9, height: 9, borderRadius: 5, marginBottom: 14 },
  summaryLabel: { color: colors.inkMuted, fontSize: 12, fontWeight: '700' },
  summaryValue: { color: colors.ink, fontSize: 17, fontWeight: '900', marginTop: 5 },
  summaryMeta: { color: colors.inkMuted, fontSize: 11, marginTop: 7 },
  pendingRow: { flexDirection: 'row', gap: 12 },
  pendingCard: { flex: 1, minHeight: 148, borderRadius: radius.lg, padding: 16 },
  pendingIncome: { backgroundColor: colors.incomeSoft },
  pendingExpense: { backgroundColor: colors.warningSoft },
  pendingIcon: { color: colors.ink, fontSize: 21, fontWeight: '900', marginBottom: 12 },
  pendingTitle: { color: colors.ink, fontSize: 14, fontWeight: '900' },
  pendingAmount: { color: colors.ink, fontSize: 17, fontWeight: '900', marginTop: 6 },
  pendingMeta: { color: colors.inkMuted, fontSize: 11, marginTop: 6 },
  viewAll: { color: colors.primary, fontSize: 13, fontWeight: '900' },
  listCard: { paddingTop: 2, paddingBottom: 2 },
  loading: { color: colors.inkMuted, textAlign: 'center', paddingVertical: 42 },
});


