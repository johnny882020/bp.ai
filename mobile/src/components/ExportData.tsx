import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { BPReading } from '@/hooks/useBPReadings';

interface Props {
  readings: BPReading[];
}

export default function ExportData({ readings }: Props) {
  const handleExport = async () => {
    if (readings.length === 0) return;

    const header = 'Date,Time,Systolic,Diastolic,Pulse,Arm,Position,Notes';
    const rows = readings.map((r) => {
      const d = new Date(r.measured_at);
      return [
        d.toLocaleDateString(),
        d.toLocaleTimeString(),
        r.systolic,
        r.diastolic,
        r.pulse ?? '',
        r.arm ?? '',
        r.position ?? '',
        (r.notes ?? '').replace(/,/g, ' '),
      ].join(',');
    });
    const csv = [header, ...rows].join('\n');

    const fileUri = FileSystem.cacheDirectory + 'bp-readings.csv';
    try {
      await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, { mimeType: 'text/csv', dialogTitle: 'Export BP Readings' });
      } else {
        Alert.alert('Exported', `CSV saved to: ${fileUri}`);
      }
    } catch (e: any) {
      Alert.alert('Export failed', e?.message ?? 'Could not export CSV.');
    }
  };

  return (
    <TouchableOpacity
      style={[styles.btn, readings.length === 0 && styles.btnDisabled]}
      onPress={handleExport}
      disabled={readings.length === 0}
    >
      <Text style={styles.btnText}>Export CSV</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 40,
    paddingHorizontal: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.4 },
  btnText: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
});
