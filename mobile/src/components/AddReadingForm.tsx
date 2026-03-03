import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { UseMutationResult } from '@tanstack/react-query';
import { BPReading } from '@/hooks/useBPReadings';
import { classifyBP, getCategoryInfo, validateReading } from '@/lib/bpCategories';

interface Props {
  createMutation: UseMutationResult<any, any, Omit<BPReading, 'id'>>;
  initialValues?: { systolic: number | null; diastolic: number | null; pulse: number | null } | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ARM_OPTIONS   = ['left', 'right'] as const;
const POS_OPTIONS   = ['sitting', 'standing', 'lying'] as const;

export default function AddReadingForm({ createMutation, initialValues, isOpen, onOpenChange }: Props) {
  const now = new Date().toISOString();
  const [systolic,  setSystolic]  = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [pulse,     setPulse]     = useState('');
  const [arm,       setArm]       = useState<string>('');
  const [position,  setPosition]  = useState<string>('');
  const [notes,     setNotes]     = useState('');
  const [measuredAt, setMeasuredAt] = useState(now);

  useEffect(() => {
    if (initialValues && isOpen) {
      setSystolic(initialValues.systolic != null ? String(initialValues.systolic) : '');
      setDiastolic(initialValues.diastolic != null ? String(initialValues.diastolic) : '');
      setPulse(initialValues.pulse != null ? String(initialValues.pulse) : '');
    }
  }, [initialValues, isOpen]);

  const reset = () => {
    setSystolic(''); setDiastolic(''); setPulse('');
    setArm(''); setPosition(''); setNotes('');
    setMeasuredAt(new Date().toISOString());
  };

  const sys = parseInt(systolic, 10);
  const dia = parseInt(diastolic, 10);
  const pul = pulse ? parseInt(pulse, 10) : null;
  const categoryValid = !isNaN(sys) && !isNaN(dia);
  const category = categoryValid ? classifyBP(sys, dia) : null;
  const { color, bgColor, recommendation } = category
    ? getCategoryInfo(category)
    : { color: '#94a3b8', bgColor: '#f1f5f9', recommendation: 'Enter systolic and diastolic values.' };

  const handleSubmit = () => {
    const err = validateReading(sys, dia, pul);
    if (err) { Alert.alert('Invalid Reading', err); return; }

    createMutation.mutate(
      {
        systolic: sys,
        diastolic: dia,
        pulse: pul,
        measured_at: measuredAt,
        arm: (arm || undefined) as BPReading['arm'],
        position: (position || undefined) as BPReading['position'],
        notes: notes || undefined,
      },
      {
        onSuccess: () => { reset(); onOpenChange(false); },
        onError: (e: any) => Alert.alert('Error', e?.message ?? 'Failed to save reading.'),
      },
    );
  };

  return (
    <Modal visible={isOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => onOpenChange(false)}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { reset(); onOpenChange(false); }}>
            <Text style={styles.cancelBtn}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Reading</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={createMutation.isPending}>
            <Text style={[styles.saveBtn, createMutation.isPending && styles.saveBtnDisabled]}>
              {createMutation.isPending ? 'Saving…' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {/* Live preview */}
          <View style={[styles.preview, { backgroundColor: bgColor }]}>
            {category && <Text style={[styles.previewCategory, { color }]}>{category}</Text>}
            <Text style={[styles.previewRec, { color }]}>{recommendation}</Text>
          </View>

          {/* BP values */}
          <View style={styles.row}>
            <View style={styles.fieldHalf}>
              <Text style={styles.label}>Systolic *</Text>
              <TextInput
                style={styles.input}
                value={systolic}
                onChangeText={setSystolic}
                keyboardType="number-pad"
                placeholder="120"
                placeholderTextColor="#cbd5e1"
                maxLength={3}
              />
            </View>
            <View style={styles.fieldHalf}>
              <Text style={styles.label}>Diastolic *</Text>
              <TextInput
                style={styles.input}
                value={diastolic}
                onChangeText={setDiastolic}
                keyboardType="number-pad"
                placeholder="80"
                placeholderTextColor="#cbd5e1"
                maxLength={3}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Pulse (bpm)</Text>
            <TextInput
              style={styles.input}
              value={pulse}
              onChangeText={setPulse}
              keyboardType="number-pad"
              placeholder="72"
              placeholderTextColor="#cbd5e1"
              maxLength={3}
            />
          </View>

          {/* Arm */}
          <View style={styles.field}>
            <Text style={styles.label}>Arm</Text>
            <View style={styles.segmentGroup}>
              {ARM_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.segment, arm === opt && styles.segmentActive]}
                  onPress={() => setArm(arm === opt ? '' : opt)}
                >
                  <Text style={[styles.segmentText, arm === opt && styles.segmentTextActive]}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Position */}
          <View style={styles.field}>
            <Text style={styles.label}>Position</Text>
            <View style={styles.segmentGroup}>
              {POS_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.segment, position === opt && styles.segmentActive]}
                  onPress={() => setPosition(position === opt ? '' : opt)}
                >
                  <Text style={[styles.segmentText, position === opt && styles.segmentTextActive]}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Notes */}
          <View style={styles.field}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Optional notes…"
              placeholderTextColor="#cbd5e1"
              multiline
              numberOfLines={3}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#0f172a' },
  cancelBtn: { fontSize: 16, color: '#64748b' },
  saveBtn: { fontSize: 16, color: '#2563eb', fontWeight: '600' },
  saveBtnDisabled: { opacity: 0.5 },
  scroll: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 16, gap: 14 },
  preview: {
    borderRadius: 10,
    padding: 14,
    marginBottom: 4,
  },
  previewCategory: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  previewRec: { fontSize: 13 },
  row: { flexDirection: 'row', gap: 12 },
  fieldHalf: { flex: 1 },
  field: {},
  label: { fontSize: 13, fontWeight: '500', color: '#475569', marginBottom: 6 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#0f172a',
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  segmentGroup: { flexDirection: 'row', gap: 8 },
  segment: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  segmentActive: { backgroundColor: '#0f172a', borderColor: '#0f172a' },
  segmentText: { fontSize: 13, color: '#64748b', fontWeight: '500' },
  segmentTextActive: { color: '#fff' },
});
