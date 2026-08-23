import { PropsWithChildren, ReactNode } from 'react';
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/constants/app-theme';

type ScreenProps = PropsWithChildren<{
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  footer?: ReactNode;
}>;

export function Screen({ children, scroll = true, contentStyle, footer }: ScreenProps) {
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.content, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, styles.flex, contentStyle]}>{children}</View>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      {content}
      {footer}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 120 },
  flex: { flex: 1 },
});


