import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useBPReadings } from '@/hooks/useBPReadings';
import StatsCards    from '@/components/StatsCards';
import BPChart       from '@/components/BPChart';
import ReadingsList  from '@/components/ReadingsList';
import AddReadingForm from '@/components/AddReadingForm';
import CameraCapture from '@/components/CameraCapture';
import { BPOcrResult } from '@/lib/ocrEngine';

export default function DashboardScreen() {
  const { readings, isLoading, isError, error, createMutation, deleteMutation } = useBPReadings();
  const [addOpen,       setAddOpen]       = useState(false);
  const [prefilledData, setPrefilledData] = useState<BPOcrResult | null>(null);

  const handleOpenWithData = (data: BPOcrResult) => {
    setPrefilledData(data);
    setAddOpen(true);
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>BP.ai</Text>
          <Text style={styles.appSub}>Blood Pressure Monitor</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setAddOpen(true)}>
          <Text style={styles.addBtnText}>+ Add Reading</Text>
        </TouchableOpacity>
      </View>

      {/* Error */}
      {isError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>Failed to load readings: {(error as any)?.message ?? 'Unknown error'}</Text>
        </View>
      )}

      {/* Health tip */}
      <View style={styles.tipBox}>
        <Text style={styles.tipText}>
          <Text style={styles.tipBold}>Healthy range:</Text> Below 120/80 mmHg. Measure at the same time each day.
        </Text>
      </View>

      {/* Camera scan */}
      <CameraCapture onOpenAddForm={handleOpenWithData} />

      {/* Stats */}
      {readings.length > 0 && (
        <StatsCards readings={readings} />
      )}

      {/* Chart */}
      <BPChart readings={readings} />

      {/* List */}
      <ReadingsList readings={readings} onDelete={deleteMutation.mutate} isLoading={isLoading} />

      <AddReadingForm
        createMutation={createMutation}
        initialValues={prefilledData}
        isOpen={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open);
          if (!open) setPrefilledData(null);
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, gap: 14 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  appName: { fontSize: 26, fontWeight: '800', color: '#0f172a' },
  appSub: { fontSize: 13, color: '#64748b' },
  addBtn: { paddingHorizontal: 16, paddingVertical: 9, backgroundColor: '#0f172a', borderRadius: 8 },
  addBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  errorBanner: { backgroundColor: '#fef2f2', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#fecaca' },
  errorText: { color: '#dc2626', fontSize: 13 },
  tipBox: { backgroundColor: '#eff6ff', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#bfdbfe' },
  tipText: { color: '#1d4ed8', fontSize: 13 },
  tipBold: { fontWeight: '700' },
});
