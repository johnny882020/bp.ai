import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useBPReadings } from '@/hooks/useBPReadings';
import ReadingsList  from '@/components/ReadingsList';
import AddReadingForm from '@/components/AddReadingForm';

export default function ReadingsScreen() {
  const { readings, isLoading, isError, error, createMutation, deleteMutation } = useBPReadings();
  const [open, setOpen] = useState(false);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Readings</Text>
        <View style={styles.titleRight}>
          <Text style={styles.count}>{readings.length} total</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setOpen(true)}>
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{(error as any)?.message}</Text>
        </View>
      )}

      <ReadingsList readings={readings} onDelete={deleteMutation.mutate} isLoading={isLoading} />

      <AddReadingForm
        createMutation={createMutation}
        isOpen={open}
        onOpenChange={setOpen}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, gap: 14 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 26, fontWeight: '800', color: '#0f172a' },
  titleRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  count: { fontSize: 13, color: '#64748b' },
  addBtn: { paddingHorizontal: 14, paddingVertical: 7, backgroundColor: '#0f172a', borderRadius: 8 },
  addBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  errorBanner: { backgroundColor: '#fef2f2', borderRadius: 10, padding: 12 },
  errorText: { color: '#dc2626', fontSize: 13 },
});
