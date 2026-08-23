import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { Screen } from '@/components/screen';
import { Card, PageHeader, PrimaryButton, SectionTitle } from '@/components/ui';
import { colors, radius } from '@/constants/app-theme';
import { useBookkeeping } from '@/context/bookkeeping-context';
import { EntryType, ENTRY_TYPE_LABELS } from '@/types/bookkeeping';
import { todayISO } from '@/utils/format';

const types: EntryType[] = ['income', 'purchase', 'staff', 'operation'];

export default function SettingsScreen() {
  const { entries, categories, addCategory, toggleCategory } = useBookkeeping();
  const [selectedType, setSelectedType] = useState<EntryType>('income');
  const [newCategory, setNewCategory] = useState('');
  const selectedCategories = useMemo(
    () => categories.filter((category) => category.type === selectedType),
    [categories, selectedType],
  );

  const createCategory = async () => {
    if (!newCategory.trim()) return;
    await addCategory(selectedType, newCategory.trim());
    setNewCategory('');
  };

  const exportBackup = async () => {
    const available = await Sharing.isAvailableAsync();
    if (!available || !FileSystem.cacheDirectory) {
      Alert.alert('目前無法匯出', '這台裝置目前不支援系統分享功能。');
      return;
    }
    const path = `${FileSystem.cacheDirectory}restaurant-bookkeeping-${todayISO()}.json`;
    const payload = JSON.stringify(
      { app: '餐廳收支', schemaVersion: 1, exportedAt: new Date().toISOString(), entries, categories },
      null,
      2,
    );
    await FileSystem.writeAsStringAsync(path, payload, { encoding: FileSystem.EncodingType.UTF8 });
    await Sharing.shareAsync(path, { mimeType: 'application/json', dialogTitle: '匯出餐廳收支備份' });
  };

  return (
    <Screen>
      <PageHeader eyebrow="PREFERENCES" title="設定" />

      <SectionTitle>資料備份</SectionTitle>
      <Card>
        <View style={styles.backupHeader}>
          <View style={styles.backupIcon}><Text style={styles.backupIconText}>↥</Text></View>
          <View style={styles.backupText}>
            <Text style={styles.cardTitle}>匯出 JSON 備份</Text>
            <Text style={styles.cardDescription}>把 {entries.length} 筆紀錄存成檔案，可傳到雲端硬碟或自己的信箱。</Text>
          </View>
        </View>
        <PrimaryButton label="選擇備份位置" onPress={() => void exportBackup()} tone="neutral" />
      </Card>

      <SectionTitle>分類管理</SectionTitle>
      <ScrollTypes selected={selectedType} onChange={setSelectedType} />
      <Card style={styles.categoryCard}>
        {selectedCategories.map((category) => (
          <View key={category.id} style={styles.categoryRow}>
            <View style={[styles.categoryDot, !category.active && styles.categoryDotInactive]} />
            <Text style={[styles.categoryName, !category.active && styles.categoryNameInactive]}>{category.name}</Text>
            <Pressable onPress={() => void toggleCategory(category)} style={[styles.toggle, category.active && styles.toggleActive]}>
              <Text style={[styles.toggleText, category.active && styles.toggleTextActive]}>{category.active ? '使用中' : '已停用'}</Text>
            </Pressable>
          </View>
        ))}
        <View style={styles.addRow}>
          <TextInput
            accessibilityLabel="新增分類名稱"
            onChangeText={setNewCategory}
            onSubmitEditing={() => void createCategory()}
            placeholder={`新增${ENTRY_TYPE_LABELS[selectedType]}分類`}
            placeholderTextColor={colors.inkMuted}
            returnKeyType="done"
            style={styles.addInput}
            value={newCategory}
          />
          <Pressable disabled={!newCategory.trim()} onPress={() => void createCategory()} style={[styles.addButton, !newCategory.trim() && styles.disabled]}>
            <Text style={styles.addButtonText}>新增</Text>
          </Pressable>
        </View>
      </Card>

      <SectionTitle>關於</SectionTitle>
      <Card>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>資料儲存</Text>
          <Text style={styles.aboutValue}>手機本機 SQLite</Text>
        </View>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>網路需求</Text>
          <Text style={styles.aboutValue}>離線可使用</Text>
        </View>
        <View style={[styles.aboutRow, styles.aboutRowLast]}>
          <Text style={styles.aboutLabel}>版本</Text>
          <Text style={styles.aboutValue}>1.0.0</Text>
        </View>
      </Card>
    </Screen>
  );
}

function ScrollTypes({ selected, onChange }: { selected: EntryType; onChange: (type: EntryType) => void }) {
  return (
    <View style={styles.typeRow}>
      {types.map((type) => (
        <Pressable key={type} onPress={() => onChange(type)} style={[styles.typeButton, selected === type && styles.typeButtonActive]}>
          <Text style={[styles.typeButtonText, selected === type && styles.typeButtonTextActive]}>{ENTRY_TYPE_LABELS[type]}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  backupHeader: { flexDirection: 'row', gap: 13, marginBottom: 18 },
  backupIcon: { width: 48, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.incomeSoft },
  backupIconText: { color: colors.income, fontSize: 25, fontWeight: '900' },
  backupText: { flex: 1 },
  cardTitle: { color: colors.ink, fontSize: 16, fontWeight: '900', marginBottom: 4 },
  cardDescription: { color: colors.inkMuted, fontSize: 12, lineHeight: 18 },
  typeRow: { flexDirection: 'row', gap: 7, marginBottom: 10 },
  typeButton: { flex: 1, minHeight: 41, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm, backgroundColor: colors.surfaceSoft },
  typeButtonActive: { backgroundColor: colors.ink },
  typeButtonText: { color: colors.inkMuted, fontSize: 12, fontWeight: '800' },
  typeButtonTextActive: { color: colors.white },
  categoryCard: { paddingTop: 4, paddingBottom: 14 },
  categoryRow: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  categoryDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.income },
  categoryDotInactive: { backgroundColor: colors.border },
  categoryName: { flex: 1, color: colors.ink, fontSize: 14, fontWeight: '800' },
  categoryNameInactive: { color: colors.inkMuted, textDecorationLine: 'line-through' },
  toggle: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: colors.surfaceSoft },
  toggleActive: { backgroundColor: colors.incomeSoft },
  toggleText: { color: colors.inkMuted, fontSize: 11, fontWeight: '800' },
  toggleTextActive: { color: colors.income },
  addRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  addInput: { flex: 1, height: 46, borderRadius: radius.sm, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, color: colors.ink, paddingHorizontal: 12 },
  addButton: { minWidth: 64, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm, backgroundColor: colors.primary },
  addButtonText: { color: colors.white, fontWeight: '900' },
  disabled: { opacity: 0.4 },
  aboutRow: { minHeight: 49, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.border },
  aboutRowLast: { borderBottomWidth: 0 },
  aboutLabel: { color: colors.inkMuted, fontSize: 13 },
  aboutValue: { color: colors.ink, fontSize: 13, fontWeight: '800' },
});


