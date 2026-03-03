import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import MedicationsPanel from '@/components/MedicationsPanel';

export default function MedicationsScreen() {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <MedicationsPanel />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16 },
});
