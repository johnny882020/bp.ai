import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BPReading } from '@/hooks/useBPReadings';
import { classifyBP, getCategoryInfo } from '@/lib/bpCategories';

interface Props {
  readings: BPReading[];
}

export default function StatsCards({ readings }: Props) {
  if (readings.length === 0) {
    return (
      <View style={styles.grid}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[styles.card, styles.skeleton]} />
        ))}
      </View>
    );
  }

  const avgSys  = Math.round(readings.reduce((s, r) => s + r.systolic, 0) / readings.length);
  const avgDia  = Math.round(readings.reduce((s, r) => s + r.diastolic, 0) / readings.length);
  const withPulse = readings.filter((r) => r.pulse != null);
  const avgPulse = withPulse.length
    ? Math.round(withPulse.reduce((s, r) => s + r.pulse!, 0) / withPulse.length)
    : null;

  const latest = readings[0];
  const category = classifyBP(latest.systolic, latest.diastolic);
  const { color, bgColor } = getCategoryInfo(category);

  return (
    <View style={styles.grid}>
      <StatCard label="Avg BP" value={`${avgSys}/${avgDia}`} unit="mmHg" />
      <StatCard label="Avg Pulse" value={avgPulse != null ? String(avgPulse) : '—'} unit="bpm" />
      <StatCard label="Readings" value={String(readings.length)} unit="total" />
      <View style={[styles.card, { backgroundColor: bgColor }]}>
        <Text style={styles.cardLabel}>Latest</Text>
        <Text style={[styles.cardValue, { color }]} numberOfLines={1} adjustsFontSizeToFit>
          {category}
        </Text>
      </View>
    </View>
  );
}

function StatCard({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardUnit}>{unit}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    minHeight: 88,
    justifyContent: 'center',
  },
  skeleton: {
    backgroundColor: '#f1f5f9',
    borderColor: '#e2e8f0',
  },
  cardLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  cardUnit: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
});
