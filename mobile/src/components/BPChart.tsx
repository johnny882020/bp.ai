import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme, VictoryScatter } from 'victory-native';
import { format } from 'date-fns';
import { BPReading } from '@/hooks/useBPReadings';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const RANGES = [7, 30, 90] as const;

interface Props {
  readings: BPReading[];
}

export default function BPChart({ readings }: Props) {
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(30);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - timeRange);

  const filtered = readings
    .filter((r) => new Date(r.measured_at) >= cutoff)
    .sort((a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime());

  const chartData = filtered.map((r, i) => ({
    x: i,
    xLabel: format(new Date(r.measured_at), 'MM/dd'),
    systolic: r.systolic,
    diastolic: r.diastolic,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Trend</Text>
        <View style={styles.toggleGroup}>
          {RANGES.map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.toggle, timeRange === r && styles.toggleActive]}
              onPress={() => setTimeRange(r)}
            >
              <Text style={[styles.toggleText, timeRange === r && styles.toggleTextActive]}>
                {r}d
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {chartData.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No readings in the last {timeRange} days</Text>
        </View>
      ) : (
        <VictoryChart
          width={SCREEN_WIDTH - 40}
          height={200}
          theme={VictoryTheme.material}
          padding={{ top: 20, bottom: 40, left: 44, right: 20 }}
          domain={{ y: [40, Math.max(180, ...chartData.map((d) => d.systolic + 20))] }}
        >
          <VictoryAxis
            tickFormat={(i: number) => chartData[i]?.xLabel ?? ''}
            tickCount={Math.min(chartData.length, 6)}
            style={{ tickLabels: { fontSize: 9, fill: '#94a3b8' } }}
          />
          <VictoryAxis
            dependentAxis
            style={{ tickLabels: { fontSize: 9, fill: '#94a3b8' } }}
          />
          {/* Stage 1 reference */}
          <VictoryLine
            data={[{ x: 0, y: 130 }, { x: chartData.length - 1, y: 130 }]}
            style={{ data: { stroke: '#f97316', strokeWidth: 1, strokeDasharray: '4,4', opacity: 0.6 } }}
          />
          {/* Stage 2 reference */}
          <VictoryLine
            data={[{ x: 0, y: 140 }, { x: chartData.length - 1, y: 140 }]}
            style={{ data: { stroke: '#dc2626', strokeWidth: 1, strokeDasharray: '4,4', opacity: 0.6 } }}
          />
          <VictoryLine
            data={chartData.map((d) => ({ x: d.x, y: d.systolic }))}
            style={{ data: { stroke: '#F44336', strokeWidth: 2 } }}
          />
          <VictoryLine
            data={chartData.map((d) => ({ x: d.x, y: d.diastolic }))}
            style={{ data: { stroke: '#0066CC', strokeWidth: 2 } }}
          />
          <VictoryScatter
            data={chartData.map((d) => ({ x: d.x, y: d.systolic }))}
            size={3}
            style={{ data: { fill: '#F44336' } }}
          />
          <VictoryScatter
            data={chartData.map((d) => ({ x: d.x, y: d.diastolic }))}
            size={3}
            style={{ data: { fill: '#0066CC' } }}
          />
        </VictoryChart>
      )}

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F44336' }]} />
          <Text style={styles.legendText}>Systolic</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#0066CC' }]} />
          <Text style={styles.legendText}>Diastolic</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  toggleGroup: {
    flexDirection: 'row',
    gap: 4,
  },
  toggle: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
  },
  toggleActive: {
    backgroundColor: '#0f172a',
  },
  toggleText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#fff',
  },
  empty: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 13,
  },
  legend: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
    marginTop: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#64748b',
  },
});
