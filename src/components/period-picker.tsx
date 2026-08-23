import { ScrollView, Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius } from '@/constants/app-theme';
import { PERIOD_LABELS, PeriodKey } from '@/types/bookkeeping';

const periods: PeriodKey[] = ['today', 'week', 'month', 'lastMonth', 'year', 'all'];

export function PeriodPicker({ value, onChange }: { value: PeriodKey; onChange: (value: PeriodKey) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {periods.map((period) => {
        const active = value === period;
        return (
          <Pressable
            accessibilityRole="button"
            key={period}
            onPress={() => onChange(period)}
            style={[styles.chip, active && styles.activeChip]}>
            <Text style={[styles.label, active && styles.activeLabel]}>{PERIOD_LABELS[period]}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingRight: 20 },
  chip: { paddingHorizontal: 15, paddingVertical: 9, borderRadius: radius.pill, backgroundColor: colors.surfaceSoft },
  activeChip: { backgroundColor: colors.ink },
  label: { color: colors.inkMuted, fontSize: 14, fontWeight: '800' },
  activeLabel: { color: colors.white },
});


