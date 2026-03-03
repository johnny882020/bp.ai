import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, Alert, Modal,
  TextInput, ScrollView, StyleSheet, Switch, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useMedications, Medication } from '@/hooks/useMedications';

const FREQUENCIES: Medication['frequency'][] = [
  'Daily', 'Twice Daily', 'Three Times Daily', 'Weekly', 'As Needed',
];

export default function MedicationsPanel() {
  const { medications, isLoading, createMutation, updateMutation, deleteMutation } = useMedications();
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName]       = useState('');
  const [dosage, setDosage]   = useState('');
  const [freq, setFreq]       = useState<Medication['frequency']>(null);

  const active   = medications.filter((m) => m.active !== false);
  const inactive = medications.filter((m) => m.active === false);

  const resetForm = () => { setName(''); setDosage(''); setFreq(null); };

  const handleAdd = () => {
    if (!name.trim()) { Alert.alert('Required', 'Medication name is required.'); return; }
    createMutation.mutate(
      { name: name.trim(), dosage: dosage || undefined, frequency: freq || undefined, active: true },
      { onSuccess: () => { resetForm(); setAddOpen(false); }, onError: (e: any) => Alert.alert('Error', e?.message) },
    );
  };

  const confirmDelete = (m: Medication) => {
    Alert.alert('Delete Medication', `Delete "${m.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(m.id) },
    ]);
  };

  const renderMed = (m: Medication) => (
    <View key={m.id} style={styles.medRow}>
      <View style={styles.medInfo}>
        <Text style={styles.medName}>{m.name}</Text>
        {(m.dosage || m.frequency) && (
          <Text style={styles.medSub}>{[m.dosage, m.frequency].filter(Boolean).join(' · ')}</Text>
        )}
      </View>
      <Switch
        value={m.active !== false}
        onValueChange={(val) => updateMutation.mutate({ id: m.id, data: { active: val } })}
        trackColor={{ false: '#e2e8f0', true: '#bbf7d0' }}
        thumbColor={m.active !== false ? '#16a34a' : '#94a3b8'}
      />
      <TouchableOpacity onPress={() => confirmDelete(m)} style={styles.deleteBtn}>
        <Text style={styles.deleteBtnText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ gap: 16 }}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Medications</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setAddOpen(true)}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {medications.length === 0 && !isLoading && (
        <Text style={styles.empty}>No medications added yet.</Text>
      )}

      {active.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.groupLabel}>Active</Text>
          {active.map(renderMed)}
        </View>
      )}

      {inactive.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.groupLabel}>Inactive</Text>
          {inactive.map(renderMed)}
        </View>
      )}

      {/* Add medication modal */}
      <Modal visible={addOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setAddOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => { resetForm(); setAddOpen(false); }}>
              <Text style={styles.cancelBtn}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Medication</Text>
            <TouchableOpacity onPress={handleAdd} disabled={createMutation.isPending}>
              <Text style={[styles.saveBtn, createMutation.isPending && { opacity: 0.5 }]}>Save</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={{ flex: 1, backgroundColor: '#f8fafc' }} contentContainerStyle={{ padding: 16, gap: 14 }}>
            <View>
              <Text style={styles.label}>Name *</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Lisinopril" placeholderTextColor="#cbd5e1" />
            </View>
            <View>
              <Text style={styles.label}>Dosage</Text>
              <TextInput style={styles.input} value={dosage} onChangeText={setDosage} placeholder="e.g. 10mg" placeholderTextColor="#cbd5e1" />
            </View>
            <View>
              <Text style={styles.label}>Frequency</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {FREQUENCIES.map((f) => (
                  <TouchableOpacity
                    key={f}
                    style={[styles.chip, freq === f && styles.chipActive]}
                    onPress={() => setFreq(freq === f ? null : f)}
                  >
                    <Text style={[styles.chipText, freq === f && styles.chipTextActive]}>{f}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 22, fontWeight: '700', color: '#0f172a' },
  addBtn: { paddingHorizontal: 14, paddingVertical: 7, backgroundColor: '#0f172a', borderRadius: 8 },
  addBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden' },
  groupLabel: { fontSize: 11, fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, padding: 12, paddingBottom: 4 },
  medRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  medInfo: { flex: 1 },
  medName: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  medSub: { fontSize: 12, color: '#64748b', marginTop: 2 },
  deleteBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#fef2f2', justifyContent: 'center', alignItems: 'center' },
  deleteBtnText: { fontSize: 12, color: '#dc2626' },
  empty: { color: '#94a3b8', fontSize: 14 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', backgroundColor: '#fff' },
  modalTitle: { fontSize: 17, fontWeight: '600', color: '#0f172a' },
  cancelBtn: { fontSize: 16, color: '#64748b' },
  saveBtn: { fontSize: 16, color: '#2563eb', fontWeight: '600' },
  label: { fontSize: 13, fontWeight: '500', color: '#475569', marginBottom: 6 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: '#0f172a' },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#fff' },
  chipActive: { backgroundColor: '#0f172a', borderColor: '#0f172a' },
  chipText: { fontSize: 13, color: '#64748b' },
  chipTextActive: { color: '#fff' },
});
