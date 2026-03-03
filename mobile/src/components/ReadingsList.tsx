import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, Alert, StyleSheet, ActivityIndicator,
} from 'react-native';
import { format } from 'date-fns';
import { BPReading } from '@/hooks/useBPReadings';
import { classifyBP, getCategoryInfo } from '@/lib/bpCategories';

const PAGE_SIZE = 25;

interface Props {
  readings: BPReading[];
  onDelete: (id: string) => void;
  isLoading: boolean;
}

export default function ReadingsList({ readings, onDelete, isLoading }: Props) {
  const [page, setPage] = useState(0);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#0f172a" />
      </View>
    );
  }

  if (readings.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No readings yet. Tap + Add Reading to get started.</Text>
      </View>
    );
  }

  const paginated = readings.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(readings.length / PAGE_SIZE);

  const confirmDelete = (id: string) => {
    Alert.alert(
      'Delete Reading',
      'Are you sure you want to delete this reading? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(id) },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={paginated}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => {
          const category = classifyBP(item.systolic, item.diastolic);
          const { color, bgColor } = getCategoryInfo(category);
          return (
            <View style={styles.row}>
              <View style={[styles.badge, { backgroundColor: bgColor }]}>
                <View style={[styles.badgeDot, { backgroundColor: color }]} />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.bpValue}>
                  {item.systolic}/{item.diastolic} mmHg
                  {item.pulse != null ? `  ·  ${item.pulse} bpm` : ''}
                </Text>
                <Text style={styles.rowDate}>
                  {format(new Date(item.measured_at), 'PPP p')}
                </Text>
                {(item.arm || item.position) && (
                  <Text style={styles.rowMeta}>
                    {[item.arm, item.position].filter(Boolean).join(' · ')}
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={() => confirmDelete(item.id)} style={styles.deleteBtn}>
                <Text style={styles.deleteBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {totalPages > 1 && (
        <View style={styles.pagination}>
          <TouchableOpacity
            onPress={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            style={[styles.pageBtn, page === 0 && styles.pageBtnDisabled]}
          >
            <Text style={styles.pageBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.pageInfo}>{page + 1} / {totalPages}</Text>
          <TouchableOpacity
            onPress={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            style={[styles.pageBtn, page === totalPages - 1 && styles.pageBtnDisabled]}
          >
            <Text style={styles.pageBtnText}>→</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  center: { padding: 40, alignItems: 'center' },
  emptyContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 40,
    alignItems: 'center',
  },
  emptyText: { color: '#94a3b8', fontSize: 14, textAlign: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  badgeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  rowContent: { flex: 1 },
  bpValue: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  rowDate: { fontSize: 12, color: '#64748b', marginTop: 2 },
  rowMeta: { fontSize: 11, color: '#94a3b8', marginTop: 1, textTransform: 'capitalize' },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtnText: { fontSize: 12, color: '#dc2626' },
  separator: { height: 1, backgroundColor: '#f1f5f9', marginLeft: 58 },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  pageBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#0f172a',
    borderRadius: 6,
  },
  pageBtnDisabled: { backgroundColor: '#e2e8f0' },
  pageBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  pageInfo: { fontSize: 13, color: '#64748b' },
});
