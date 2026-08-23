import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '@/constants/app-theme';
import { BookkeepingEntry, ENTRY_TYPE_EMOJI, ENTRY_TYPE_LABELS } from '@/types/bookkeeping';
import { displayDate, formatMoney } from '@/utils/format';

export function EntryRow({ entry, onPress }: { entry: BookkeepingEntry; onPress?: () => void }) {
  const income = entry.type === 'income';
  const statusLabel = entry.paymentStatus === 'paid' ? (income ? '已收款' : '已付款') : income ? '尚未收款' : '尚未付款';
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && onPress && styles.pressed]}>
      <View style={[styles.icon, { backgroundColor: income ? colors.incomeSoft : colors.expenseSoft }]}>
        <Text style={styles.iconText}>{ENTRY_TYPE_EMOJI[entry.type]}</Text>
      </View>
      <View style={styles.main}>
        <Text numberOfLines={1} style={styles.category}>{entry.category}</Text>
        <Text numberOfLines={1} style={styles.meta}>
          {displayDate(entry.date)} · {entry.source || ENTRY_TYPE_LABELS[entry.type]}
        </Text>
      </View>
      <View style={styles.amountColumn}>
        <Text style={[styles.amount, { color: income ? colors.income : colors.expense }]}>
          {income ? '+' : '-'}{formatMoney(income ? entry.netAmount : entry.grossAmount)}
        </Text>
        <Text style={[styles.status, entry.paymentStatus === 'unpaid' && styles.statusWarning]}>{statusLabel}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  pressed: { opacity: 0.6 },
  icon: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 19, fontWeight: '900' },
  main: { flex: 1, minWidth: 0 },
  category: { color: colors.ink, fontSize: 16, fontWeight: '900', marginBottom: 4 },
  meta: { color: colors.inkMuted, fontSize: 12 },
  amountColumn: { alignItems: 'flex-end', maxWidth: '43%' },
  amount: { fontSize: 14, fontWeight: '900', marginBottom: 5 },
  status: { color: colors.inkMuted, fontSize: 11, fontWeight: '700' },
  statusWarning: { color: colors.warning },
});


