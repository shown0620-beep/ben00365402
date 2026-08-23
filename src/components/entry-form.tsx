import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radius } from '@/constants/app-theme';
import { useBookkeeping } from '@/context/bookkeeping-context';
import {
  EntryDraft,
  EntryType,
  ENTRY_TYPE_EMOJI,
  ENTRY_TYPE_LABELS,
  PaymentStatus,
  PAYMENT_METHODS,
} from '@/types/bookkeeping';
import { formatMoney, todayISO } from '@/utils/format';
import { PrimaryButton, SectionTitle } from './ui';

const types: EntryType[] = ['income', 'purchase', 'staff', 'operation'];

const emptyDraft = (): EntryDraft => ({
  type: 'income',
  date: todayISO(),
  category: '',
  source: '',
  description: '',
  grossAmount: 0,
  feeAmount: 0,
  netAmount: 0,
  paymentMethod: '現金',
  paymentStatus: 'paid',
  notes: '',
});

type EntryFormProps = {
  initialValue?: EntryDraft;
  submitLabel?: string;
  onSubmit: (draft: EntryDraft) => Promise<void>;
  onSubmitted?: () => void;
};

export function EntryForm({ initialValue, submitLabel = '儲存這一筆', onSubmit, onSubmitted }: EntryFormProps) {
  const { categories } = useBookkeeping();
  const amountRef = useRef<TextInput>(null);
  const [draft, setDraft] = useState<EntryDraft>(initialValue ?? emptyDraft());
  const [grossInput, setGrossInput] = useState(initialValue?.grossAmount ? String(initialValue.grossAmount) : '');
  const [feeInput, setFeeInput] = useState(initialValue?.feeAmount ? String(initialValue.feeAmount) : '');
  const [netInput, setNetInput] = useState(initialValue?.netAmount ? String(initialValue.netAmount) : '');
  const [netTouched, setNetTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  const availableCategories = useMemo(
    () => categories.filter((category) => category.type === draft.type && category.active),
    [categories, draft.type],
  );

  useEffect(() => {
    if (!draft.category || !availableCategories.some((category) => category.name === draft.category)) {
      setDraft((current) => ({ ...current, category: availableCategories[0]?.name ?? '' }));
    }
  }, [availableCategories, draft.category]);

  const gross = Number(grossInput.replaceAll(',', '')) || 0;
  const fee = draft.type === 'income' ? Number(feeInput.replaceAll(',', '')) || 0 : 0;
  const autoNet = Math.max(gross - fee, 0);
  const net = draft.type === 'income' ? Number(netInput.replaceAll(',', '')) || 0 : gross;

  useEffect(() => {
    if (draft.type === 'income' && !netTouched) setNetInput(autoNet ? String(autoNet) : '');
  }, [autoNet, draft.type, netTouched]);

  const changeType = (type: EntryType) => {
    setDraft((current) => ({ ...current, type, category: '', feeAmount: 0, netAmount: 0 }));
    setFeeInput('');
    setNetInput('');
    setNetTouched(false);
  };

  const chooseCategory = (name: string) => {
    setDraft((current) => ({ ...current, category: name }));
    setTimeout(() => amountRef.current?.focus(), 80);
  };

  const save = async () => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.date)) {
      Alert.alert('日期格式不正確', '請使用 YYYY-MM-DD，例如 2026-08-23。');
      return;
    }
    if (!draft.category) {
      Alert.alert('請選擇分類', '若沒有可用分類，請先到設定新增分類。');
      return;
    }
    if (gross <= 0) {
      Alert.alert('請輸入金額', '金額必須大於 0。');
      return;
    }
    if (fee > gross) {
      Alert.alert('抽成金額過高', '手續費／平台抽成不可大於營業額。');
      return;
    }
    if (draft.type === 'income' && net < 0) {
      Alert.alert('實際入帳不正確', '實際入帳不可小於 0。');
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        ...draft,
        grossAmount: gross,
        feeAmount: fee,
        netAmount: draft.type === 'income' ? net : gross,
      });
      if (!initialValue) {
        setDraft(emptyDraft());
        setGrossInput('');
        setFeeInput('');
        setNetInput('');
        setNetTouched(false);
      }
      onSubmitted?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <View>
      <SectionTitle>這筆是什麼？</SectionTitle>
      <View style={styles.typeGrid}>
        {types.map((type) => {
          const active = draft.type === type;
          return (
            <Pressable key={type} onPress={() => changeType(type)} style={[styles.typeButton, active && styles.typeButtonActive]}>
              <Text style={styles.typeEmoji}>{ENTRY_TYPE_EMOJI[type]}</Text>
              <Text style={[styles.typeLabel, active && styles.typeLabelActive]}>{ENTRY_TYPE_LABELS[type]}</Text>
            </Pressable>
          );
        })}
      </View>

      <FieldLabel>日期</FieldLabel>
      <TextInput
        accessibilityLabel="日期"
        autoCapitalize="none"
        maxLength={10}
        onChangeText={(date) => setDraft((current) => ({ ...current, date }))}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={colors.inkMuted}
        style={styles.input}
        value={draft.date}
      />

      <FieldLabel>分類</FieldLabel>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
        {availableCategories.map((category) => {
          const active = category.name === draft.category;
          return (
            <Pressable key={category.id} onPress={() => chooseCategory(category.name)} style={[styles.categoryChip, active && styles.categoryChipActive]}>
              <Text style={[styles.categoryLabel, active && styles.categoryLabelActive]}>{category.name}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <FieldLabel>{draft.type === 'income' ? '來源／平台' : '廠商／對象'}</FieldLabel>
      <TextInput
        accessibilityLabel={draft.type === 'income' ? '來源或平台' : '廠商或對象'}
        onChangeText={(source) => setDraft((current) => ({ ...current, source }))}
        placeholder={draft.type === 'income' ? '例如：店內、Foodpanda、LINE Pay' : '例如：菜商、房東、員工姓名'}
        placeholderTextColor={colors.inkMuted}
        style={styles.input}
        value={draft.source}
      />

      <FieldLabel>{draft.type === 'income' ? '營業額' : '支出金額'}</FieldLabel>
      <View style={styles.moneyInputWrap}>
        <Text style={styles.currency}>NT$</Text>
        <TextInput
          ref={amountRef}
          accessibilityLabel="金額"
          keyboardType="decimal-pad"
          onChangeText={setGrossInput}
          placeholder="0"
          placeholderTextColor={colors.inkMuted}
          style={styles.moneyInput}
          value={grossInput}
        />
      </View>

      {draft.type === 'income' ? (
        <>
          <FieldLabel>手續費／平台抽成</FieldLabel>
          <View style={styles.moneyInputWrap}>
            <Text style={styles.currency}>NT$</Text>
            <TextInput
              accessibilityLabel="手續費或平台抽成"
              keyboardType="decimal-pad"
              onChangeText={setFeeInput}
              placeholder="0"
              placeholderTextColor={colors.inkMuted}
              style={styles.moneyInput}
              value={feeInput}
            />
          </View>

          <FieldLabel>實際入帳</FieldLabel>
          <View style={styles.moneyInputWrap}>
            <Text style={styles.currency}>NT$</Text>
            <TextInput
              accessibilityLabel="實際入帳"
              keyboardType="decimal-pad"
              onChangeText={(value) => {
                setNetTouched(true);
                setNetInput(value);
              }}
              placeholder="0"
              placeholderTextColor={colors.inkMuted}
              style={styles.moneyInput}
              value={netInput}
            />
          </View>
          <Text style={styles.helperText}>預設為營業額－抽成；若實際入帳不同可直接修改。</Text>
          <View style={styles.netRow}>
            <Text style={styles.netLabel}>目前實際入帳</Text>
            <Text style={styles.netValue}>{formatMoney(net)}</Text>
          </View>
        </>
      ) : null}

      <FieldLabel>{draft.type === 'income' ? '收款方式' : '付款方式'}</FieldLabel>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
        {PAYMENT_METHODS.map((method) => {
          const active = draft.paymentMethod === method;
          return (
            <Pressable key={method} onPress={() => setDraft((current) => ({ ...current, paymentMethod: method }))} style={[styles.categoryChip, active && styles.categoryChipActive]}>
              <Text style={[styles.categoryLabel, active && styles.categoryLabelActive]}>{method}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <FieldLabel>{draft.type === 'income' ? '收款狀態' : '付款狀態'}</FieldLabel>
      <View style={styles.segment}>
        {(['paid', 'unpaid'] as PaymentStatus[]).map((status) => {
          const active = draft.paymentStatus === status;
          const label = status === 'paid' ? (draft.type === 'income' ? '已收款' : '已付款') : draft.type === 'income' ? '尚未收款' : '尚未付款';
          return (
            <Pressable key={status} onPress={() => setDraft((current) => ({ ...current, paymentStatus: status }))} style={[styles.segmentButton, active && styles.segmentButtonActive]}>
              <Text style={[styles.segmentLabel, active && styles.segmentLabelActive]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      <FieldLabel>說明（選填）</FieldLabel>
      <TextInput
        accessibilityLabel="說明"
        multiline
        numberOfLines={3}
        onChangeText={(description) => setDraft((current) => ({ ...current, description }))}
        placeholder="例如：8/23 晚餐營業額、蔬菜進貨"
        placeholderTextColor={colors.inkMuted}
        style={[styles.input, styles.multiline]}
        textAlignVertical="top"
        value={draft.description}
      />

      <FieldLabel>備註（選填）</FieldLabel>
      <TextInput
        accessibilityLabel="備註"
        multiline
        numberOfLines={3}
        onChangeText={(notes) => setDraft((current) => ({ ...current, notes }))}
        placeholder="其他需要記住的資訊"
        placeholderTextColor={colors.inkMuted}
        style={[styles.input, styles.multiline]}
        textAlignVertical="top"
        value={draft.notes}
      />

      <View style={styles.submit}>
        <PrimaryButton disabled={saving} label={saving ? '儲存中…' : submitLabel} onPress={() => void save()} />
      </View>
    </View>
  );
}

function FieldLabel({ children }: { children: string }) {
  return <Text style={styles.fieldLabel}>{children}</Text>;
}

const styles = StyleSheet.create({
  typeGrid: { flexDirection: 'row', gap: 9 },
  typeButton: { flex: 1, minHeight: 82, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', gap: 5 },
  typeButtonActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  typeEmoji: { fontSize: 21, fontWeight: '900' },
  typeLabel: { color: colors.ink, fontSize: 13, fontWeight: '900' },
  typeLabelActive: { color: colors.white },
  fieldLabel: { color: colors.ink, fontSize: 14, fontWeight: '900', marginTop: 22, marginBottom: 8 },
  input: { minHeight: 52, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, color: colors.ink, fontSize: 16, paddingHorizontal: 15 },
  multiline: { minHeight: 96, paddingTop: 14 },
  categoryRow: { gap: 8, paddingRight: 20 },
  categoryChip: { borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingVertical: 10, paddingHorizontal: 15 },
  categoryChipActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  categoryLabel: { color: colors.inkMuted, fontSize: 13, fontWeight: '800' },
  categoryLabelActive: { color: colors.primary },
  moneyInputWrap: { flexDirection: 'row', alignItems: 'center', minHeight: 64, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16 },
  currency: { color: colors.inkMuted, fontSize: 16, fontWeight: '800', marginRight: 10 },
  moneyInput: { flex: 1, color: colors.ink, fontSize: 27, fontWeight: '900', textAlign: 'right' },
  helperText: { color: colors.inkMuted, fontSize: 12, lineHeight: 18, marginTop: 8 },
  netRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.incomeSoft, borderRadius: radius.md, padding: 15, marginTop: 10 },
  netLabel: { color: colors.income, fontWeight: '800' },
  netValue: { color: colors.income, fontSize: 18, fontWeight: '900' },
  segment: { flexDirection: 'row', padding: 4, gap: 4, borderRadius: radius.md, backgroundColor: colors.surfaceSoft },
  segmentButton: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm },
  segmentButtonActive: { backgroundColor: colors.surface },
  segmentLabel: { color: colors.inkMuted, fontWeight: '800' },
  segmentLabelActive: { color: colors.ink, fontWeight: '900' },
  submit: { marginTop: 28 },
});
