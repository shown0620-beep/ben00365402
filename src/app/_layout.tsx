import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BookkeepingProvider } from '@/context/bookkeeping-context';
import { initializeDatabase } from '@/db/database';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SQLiteProvider databaseName="restaurant-bookkeeping.db" onInit={initializeDatabase}>
        <BookkeepingProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="transaction/[id]" options={{ presentation: 'modal' }} />
          </Stack>
        </BookkeepingProvider>
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}

