import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/app-theme';

const iconMap: Record<string, string> = {
  index: '⌂',
  records: '☷',
  add: '+',
  stats: '▥',
  settings: '⚙',
};

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const isAdd = name === 'add';
  return (
    <View style={[styles.iconWrap, isAdd && styles.addIconWrap, focused && !isAdd && styles.activeIconWrap]}>
      <Text style={[styles.icon, isAdd && styles.addIcon, focused && !isAdd && styles.activeIcon]}>{iconMap[name]}</Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.inkMuted,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: styles.label,
        tabBarStyle: styles.tabBar,
        tabBarIcon: ({ focused }) => <TabIcon focused={focused} name={route.name} />,
      })}>
      <Tabs.Screen name="index" options={{ title: '首頁' }} />
      <Tabs.Screen name="records" options={{ title: '紀錄' }} />
      <Tabs.Screen name="add" options={{ title: '記一筆' }} />
      <Tabs.Screen name="stats" options={{ title: '統計' }} />
      <Tabs.Screen name="settings" options={{ title: '設定' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: { position: 'absolute', height: 78, paddingTop: 8, paddingBottom: 10, backgroundColor: colors.surface, borderTopColor: colors.border },
  label: { fontSize: 11, fontWeight: '800' },
  iconWrap: { width: 32, height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  activeIconWrap: { backgroundColor: colors.primarySoft },
  icon: { color: colors.inkMuted, fontSize: 21, lineHeight: 24, fontWeight: '900' },
  activeIcon: { color: colors.primary },
  addIconWrap: { width: 46, height: 46, marginTop: -18, borderRadius: 23, backgroundColor: colors.primary },
  addIcon: { color: colors.white, fontSize: 30, lineHeight: 32 },
});


