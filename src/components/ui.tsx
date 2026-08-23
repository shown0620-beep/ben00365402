import { PropsWithChildren, ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors, radius, shadow } from '@/constants/app-theme';

export function PageHeader({ eyebrow, title, right }: { eyebrow?: string; title: string; right?: ReactNode }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerText}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.pageTitle}>{title}</Text>
      </View>
      {right}
    </View>
  );
}

export function SectionTitle({ children, aside }: PropsWithChildren<{ aside?: ReactNode }>) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>{children}</Text>
      {aside}
    </View>
  );
}

export function Card({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  tone = 'primary',
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: 'primary' | 'danger' | 'neutral';
}) {
  const background = tone === 'danger' ? colors.expense : tone === 'neutral' ? colors.surfaceSoft : colors.primary;
  const textColor = tone === 'neutral' ? colors.ink : colors.white;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        { backgroundColor: background },
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}>
      <Text style={[styles.primaryButtonText, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

export function EmptyState({ emoji, title, description }: { emoji: string; title: string; description: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyEmoji}>{emoji}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  headerText: { flex: 1 },
  eyebrow: { color: colors.primary, fontSize: 13, fontWeight: '800', letterSpacing: 1.2, marginBottom: 4 },
  pageTitle: { color: colors.ink, fontSize: 30, lineHeight: 36, fontWeight: '900', letterSpacing: -0.7 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 26, marginBottom: 12 },
  sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: '900' },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 18, borderWidth: 1, borderColor: colors.border, ...shadow },
  primaryButton: { minHeight: 54, paddingHorizontal: 20, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { fontSize: 16, fontWeight: '900' },
  disabled: { opacity: 0.45 },
  pressed: { transform: [{ scale: 0.985 }], opacity: 0.9 },
  empty: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 28 },
  emptyEmoji: { fontSize: 34, marginBottom: 12 },
  emptyTitle: { color: colors.ink, fontSize: 18, fontWeight: '900', marginBottom: 6 },
  emptyDescription: { color: colors.inkMuted, textAlign: 'center', lineHeight: 21 },
});


