import React from 'react';
import { ScrollView, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useBPReadings } from '@/hooks/useBPReadings';
import BPChart    from '@/components/BPChart';
import StatsCards from '@/components/StatsCards';

export default function ChartsScreen() {
  const { readings, isLoading, isError, error } = useBPReadings();

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Analytics</Text>

      {isError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{(error as any)?.message}</Text>
        </View>
      )}

      {isLoading && (
        <View style={styles.center}>
          <ActivityIndicator color="#0f172a" />
        </View>
      )}

      {!isLoading && readings.length === 0 && (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Add readings on the Home tab to see analytics here.</Text>
        </View>
      )}

      {!isLoading && readings.length > 0 && (
        <>
          <BPChart readings={readings} />
          <StatsCards readings={readings} />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, gap: 14 },
  title: { fontSize: 26, fontWeight: '800', color: '#0f172a' },
  center: { padding: 40, alignItems: 'center' },
  errorBanner: { backgroundColor: '#fef2f2', borderRadius: 10, padding: 12 },
  errorText: { color: '#dc2626', fontSize: 13 },
  emptyBox: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', padding: 40, alignItems: 'center' },
  emptyText: { color: '#94a3b8', fontSize: 14, textAlign: 'center' },
});
