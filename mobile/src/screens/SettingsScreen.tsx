import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useBPReadings } from '@/hooks/useBPReadings';
import ExportData from '@/components/ExportData';

const CATEGORIES = [
  { name: 'Normal',              range: '< 120/80 mmHg',       color: '#16a34a', bg: '#dcfce7', desc: 'Maintain healthy habits.' },
  { name: 'Elevated',            range: '120–129 / < 80 mmHg', color: '#d97706', bg: '#fef9c3', desc: 'Lifestyle changes can help.' },
  { name: 'Hypertension Stage 1',range: '130–139 / 80–89 mmHg',color: '#ea580c', bg: '#ffedd5', desc: 'Consult your doctor.' },
  { name: 'Hypertension Stage 2',range: '≥ 140 / ≥ 90 mmHg',  color: '#dc2626', bg: '#fee2e2', desc: 'Treatment likely needed.' },
  { name: 'Hypertensive Crisis', range: '> 180 / > 120 mmHg', color: '#991b1b', bg: '#fecaca', desc: 'Seek emergency care immediately.' },
];

export default function SettingsScreen() {
  const { readings } = useBPReadings();

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>

      {/* Export */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Data Export</Text>
        <Text style={styles.cardDesc}>
          Share your readings as a CSV file with your doctor or for backup.
        </Text>
        <ExportData readings={readings} />
        <Text style={styles.count}>{readings.length} reading{readings.length !== 1 ? 's' : ''} stored</Text>
      </View>

      {/* AHA Guidelines */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>AHA Blood Pressure Guidelines</Text>
        {CATEGORIES.map((c) => (
          <View key={c.name} style={[styles.categoryRow, { backgroundColor: c.bg }]}>
            <View style={[styles.dot, { backgroundColor: c.color }]} />
            <View style={{ flex: 1 }}>
              <View style={styles.categoryHeader}>
                <Text style={[styles.categoryName, { color: c.color }]}>{c.name}</Text>
                <Text style={styles.categoryRange}>{c.range}</Text>
              </View>
              <Text style={styles.categoryDesc}>{c.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerTitle}>⚠️  Medical Disclaimer</Text>
        <Text style={styles.disclaimerText}>
          BP.ai is for informational and tracking purposes only. It is not a medical device and
          should not be used for diagnosis or treatment. Always consult a qualified healthcare
          professional for medical advice.
        </Text>
      </View>

      <Text style={styles.version}>BP.ai v1.0 · Powered by Base44</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, gap: 14 },
  title: { fontSize: 26, fontWeight: '800', color: '#0f172a' },
  card: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', padding: 16, gap: 10 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  cardDesc: { fontSize: 13, color: '#64748b' },
  count: { fontSize: 12, color: '#94a3b8' },
  categoryRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 10, borderRadius: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 3, flexShrink: 0 },
  categoryHeader: { flexDirection: 'row', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' },
  categoryName: { fontSize: 13, fontWeight: '700' },
  categoryRange: { fontSize: 11, color: '#475569' },
  categoryDesc: { fontSize: 11, color: '#475569', marginTop: 2 },
  disclaimer: { backgroundColor: '#fffbeb', borderRadius: 12, borderWidth: 1, borderColor: '#fde68a', padding: 14 },
  disclaimerTitle: { fontSize: 14, fontWeight: '700', color: '#92400e', marginBottom: 6 },
  disclaimerText: { fontSize: 12, color: '#78350f', lineHeight: 18 },
  version: { textAlign: 'center', fontSize: 12, color: '#94a3b8', paddingVertical: 8 },
});
