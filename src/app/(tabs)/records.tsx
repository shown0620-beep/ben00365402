import { useEffect, useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { EntryRow } from '@/components/entry-row';
import { Screen } from '@/components/screen';
import { Card, EmptyState, PageHeader } from '@/components/ui';
import { colors, radius } from '@/constants/app-theme';
import { useBookkeeping } from '@/context/bookkeeping-context';
import { ENTRY_TYPE_LABELS } from '@/types/bookkeeping';
import { formatMoney, getEntryValue } from '@/utils/format';

type TypeFilter = 'all' | 'income' | 'expense' | 'purchase' | 'staff' | 'operation';
type StatusFilter = 'all' | 'paid' | 'unpaid';

const typeFilters: { key: TypeFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'income', label: '收入' },
  { key: 'expense', label: '全部支出' },
  { key: 'purchase', label: '進貨' },
  { key: 'staff', label: '員工' },
  { key: 'operation', label: '營運' },
];

export default function RecordsScreen() {
  const params = useLocalSearchParams<{ type?: string; status?: string }>();
  const { entries } = useBookkeeping();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    if (params.type && typeFilters.some((item) => item.key === params.type)) setTypeFilter(params.type as TypeFilter);
    if (params.status === 'paid' || params.status === 'unpaid') setStatusFilter(params.status);
  }, [params.status, params.type]);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase('zh-TW');
    return entries.filter((entry) => {
      const typeMatch =
        typeFilter === 'all' ||
        (typeFilter === 'expense' ? entry.type !== 'income' : entry.type === typeFilter);
      const statusMatch = statusFilter === 'all' || entry.paymentStatus === statusFilter;
      const textMatch =
        !keyword ||
        [entry.category, entry.source, entry.description, ENTRY_TYPE_LABELS[entry.type]]
          .join(' ')
          .toLocaleLowerCase('zh-TW')
          .includes(keyword);
      return typeMatch && statusMatch && textMatch;
    });
  }, [entries, search, statusFilter, typeFilter]);

  const net = filtered.reduce((sum, entry) => sum + (entry.type === 'income' ? getEntryValue(entry) : -getEntryValue(entry)), 0);

  return (
    <Screen>
      <PageHeader eyebrow="ALL ENTRIES" title="收支紀錄" />
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          accessibilityLabel="搜尋紀錄"
          onChangeText={setSearch}
          placeholder="搜尋分類、來源或說明"
          placeholderTextColor={colors.inkMuted}
          style={styles.searchInput}
          value={search}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {typeFilters.map((item) => (
          <FilterChip active={typeFilter === item.key} key={item.key} label={item.label} onPress={() => setTypeFilter(item.key)} />
        ))}
      </ScrollView>

      <View style={styles.statusRow}>
        {(['all', 'paid', 'unpaid'] as StatusFilter[]).map((status) => (
          <Pressable
            key={status}
            onPress={() => setStatusFilter(status)}
            style={[styles.statusButton, statusFilter === status && styles.statusButtonActive]}>
            <Text style={[styles.statusLabel, statusFilter === status && styles.statusLabelActive]}>
              {status === 'all' ? '所有狀態' : status === 'paid' ? '已完成' : '待處理'}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.resultRow}>
        <Text style={styles.resultCount}>{filtered.length} 筆紀錄</Text>
        <Text style={[styles.resultNet, { color: net >= 0 ? colors.income : colors.expense }]}>{formatMoney(net, true)}</Text>
      </View>

      <Card style={styles.listCard}>
        {filtered.length ? (
          filtered.map((entry) => (
            <EntryRow
              entry={entry}
              key={entry.id}
              onPress={() => router.push({ pathname: '/transaction/[id]', params: { id: String(entry.id) } })}
            />
          ))
        ) : (
          <EmptyState emoji="🔎" title="沒有符合的紀錄" description="調整篩選條件，或新增一筆收支。" />
        )}
      </Card>
    </Screen>
  );
}

function FilterChip({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.filterChip, active && styles.filterChipActive]}>
      <Text style={[styles.filterLabel, active && styles.filterLabelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  searchWrap: { height: 54, flexDirection: 'row', alignItems: 'center', borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 15 },
  searchIcon: { color: colors.inkMuted, fontSize: 23, marginRight: 9 },
  searchInput: { flex: 1, color: colors.ink, fontSize: 15 },
  filters: { gap: 8, paddingTop: 14, paddingRight: 20 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.pill, backgroundColor: colors.surfaceSoft },
  filterChipActive: { backgroundColor: colors.ink },
  filterLabel: { color: colors.inkMuted, fontSize: 13, fontWeight: '800' },
  filterLabelActive: { color: colors.white },
  statusRow: { flexDirection: 'row', marginTop: 12, padding: 4, borderRadius: radius.md, backgroundColor: colors.surfaceSoft },
  statusButton: { flex: 1, minHeight: 39, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm },
  statusButtonActive: { backgroundColor: colors.surface },
  statusLabel: { color: colors.inkMuted, fontSize: 12, fontWeight: '800' },
  statusLabelActive: { color: colors.ink },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 10 },
  resultCount: { color: colors.inkMuted, fontSize: 13, fontWeight: '700' },
  resultNet: { fontSize: 15, fontWeight: '900' },
  listCard: { paddingTop: 2, paddingBottom: 2 },
});


