import { Alert } from 'react-native';

import { EntryForm } from '@/components/entry-form';
import { Screen } from '@/components/screen';
import { PageHeader } from '@/components/ui';
import { useBookkeeping } from '@/context/bookkeeping-context';

export default function AddEntryScreen() {
  const { addEntry } = useBookkeeping();
  return (
    <Screen>
      <PageHeader eyebrow="QUICK ENTRY" title="記一筆" />
      <EntryForm
        onSubmit={addEntry}
        onSubmitted={() => Alert.alert('已儲存', '這筆帳已經加入紀錄。')}
      />
    </Screen>
  );
}


