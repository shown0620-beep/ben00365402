import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { EntryForm } from '@/components/entry-form';
import { Screen } from '@/components/screen';
import { EmptyState, PageHeader, PrimaryButton, SectionTitle } from '@/components/ui';
import { colors, radius } from '@/constants/app-theme';
import { useBookkeeping } from '@/context/bookkeeping-context';
import { EntryDraft } from '@/types/bookkeeping';

export default function EditEntryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { entries, loading, updateEntry, deleteEntry, togglePayment } = useBookkeeping();
  const entry = entries.find((item) => item.id === Number(id));

  if (loading) {
    return <Screen><Text style={styles.loading}>正在載入紀錄…</Text></Screen>;
  }

  if (!entry) {
    return (
      <Screen>
        <BackButton />
        <EmptyState emoji="🧾" title="找不到這筆紀錄" description="這筆資料可能已被刪除。" />
      </Screen>
    );
  }

  const initialValue: EntryDraft = {
    type: entry.type,
    date: entry.date,
    category: entry.category,
    source: entry.source,
    description: entry.description,
    grossAmount: entry.grossAmount,
    feeAmount: entry.feeAmount,
    netAmount: entry.netAmount,
    paymentMethod: entry.paymentMethod,
    paymentStatus: entry.paymentStatus,
    notes: entry.notes,
  };

  const confirmDelete = () => {
    Alert.alert('刪除這筆紀錄？', '刪除後無法復原。', [
      { text: '取消', style: 'cancel' },
      {
        text: '刪除',
        style: 'destructive',
        onPress: () => {
          void deleteEntry(entry.id).then(() => router.back());
        },
      },
    ]);
  };

  const statusText = entry.paymentStatus === 'paid'
    ? entry.type === 'income' ? '改為尚未收款' : '改為尚未付款'
    : entry.type === 'income' ? '標記為已收款' : '標記為已付款';

  return (
    <Screen>
      <BackButton />
      <PageHeader eyebrow="EDIT ENTRY" title="編輯紀錄" />
      <View style={styles.actionRow}>
        <Pressable onPress={() => void togglePayment(entry)} style={styles.statusAction}>
          <Text style={styles.statusActionText}>{statusText}</Text>
        </Pressable>
      </View>
      <EntryForm
        initialValue={initialValue}
        onSubmit={(draft) => updateEntry(entry.id, draft)}
        onSubmitted={() => router.back()}
        submitLabel="儲存修改"
      />
      <SectionTitle>危險區域</SectionTitle>
      <PrimaryButton label="刪除這筆紀錄" onPress={confirmDelete} tone="danger" />
    </Screen>
  );
}

function BackButton() {
  return (
    <Pressable onPress={() => router.back()} style={styles.backButton}>
      <Text style={styles.backText}>‹ 返回</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  loading: { color: colors.inkMuted, textAlign: 'center', marginTop: 80 },
  backButton: { alignSelf: 'flex-start', minHeight: 40, justifyContent: 'center', marginBottom: 2 },
  backText: { color: colors.primary, fontSize: 15, fontWeight: '900' },
  actionRow: { marginTop: -10, marginBottom: 2 },
  statusAction: { minHeight: 46, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: colors.warningSoft },
  statusActionText: { color: colors.warning, fontSize: 14, fontWeight: '900' },
});
