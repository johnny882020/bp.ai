import React, { useState } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMedications } from '@/hooks/useMedications';

export default function MedicationsPanel() {
  const { medications, isLoading, createMutation, updateMutation, deleteMutation } = useMedications();
  const [showAdd, setShowAdd] = useState(false);
  const [confirmId, setConfirmId] = useState(null);

  const active   = medications.filter(m => m.active);
  const inactive = medications.filter(m => !m.active);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Medications</h2>
        <Button onClick={() => setShowAdd(true)} size="sm" className="flex items-center gap-1">
          <Plus className="w-4 h-4" /> Add
        </Button>
      </div>

      {isLoading && <div className="text-slate-500 text-sm">Loading…</div>}

      {!isLoading && !medications.length && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
          No medications added yet.
        </div>
      )}

      {active.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Active</h3>
          <div className="space-y-2">
            {active.map(m => (
              <MedCard key={m.id} med={m}
                onToggle={() => updateMutation.mutate({ id: m.id, data: { active: false } })}
                onDelete={() => setConfirmId(m.id)}
                confirmId={confirmId}
                onConfirm={() => { deleteMutation.mutate(m.id); setConfirmId(null); }}
                onCancel={() => setConfirmId(null)}
              />
            ))}
          </div>
        </section>
      )}

      {inactive.length > 0 && (
        <section className="opacity-60">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Inactive</h3>
          <div className="space-y-2">
            {inactive.map(m => (
              <MedCard key={m.id} med={m}
                onToggle={() => updateMutation.mutate({ id: m.id, data: { active: true } })}
                onDelete={() => setConfirmId(m.id)}
                confirmId={confirmId}
                onConfirm={() => { deleteMutation.mutate(m.id); setConfirmId(null); }}
                onCancel={() => setConfirmId(null)}
              />
            ))}
          </div>
        </section>
      )}

      <AddMedDialog
        open={showAdd}
        onOpenChange={setShowAdd}
        onSave={(data) => { createMutation.mutate(data); setShowAdd(false); }}
        isPending={createMutation.isPending}
      />
    </div>
  );
}

function MedCard({ med, onToggle, onDelete, confirmId, onConfirm, onCancel }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-start justify-between">
      <div>
        <p className="font-semibold text-slate-900">{med.name}</p>
        {med.dosage    && <p className="text-sm text-slate-600">{med.dosage}</p>}
        {med.frequency && <p className="text-xs text-slate-400">{med.frequency}</p>}
      </div>
      <div className="flex gap-1 ml-3">
        <Button size="icon" variant="ghost"
          className={med.active ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 hover:text-emerald-600'}
          onClick={onToggle}
          title={med.active ? 'Mark inactive' : 'Mark active'}
        >
          <Check className="w-4 h-4" />
        </Button>
        {confirmId === med.id ? (
          <>
            <Button size="sm" variant="destructive" onClick={onConfirm}>Delete</Button>
            <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
          </>
        ) : (
          <Button size="icon" variant="ghost"
            className="text-slate-400 hover:text-red-500 hover:bg-red-50"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function AddMedDialog({ open, onOpenChange, onSave, isPending }) {
  const [name,      setName]      = useState('');
  const [dosage,    setDosage]    = useState('');
  const [frequency, setFrequency] = useState('Daily');

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), dosage: dosage.trim() || undefined, frequency, active: true });
    setName(''); setDosage(''); setFrequency('Daily');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader><DialogTitle>Add Medication</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Name *</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Lisinopril" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Dosage</label>
            <Input value={dosage} onChange={e => setDosage(e.target.value)} placeholder="e.g. 10mg" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Frequency</label>
            <Select value={frequency} onChange={e => setFrequency(e.target.value)}>
              {['Daily','Twice Daily','Three Times Daily','Weekly','As Needed'].map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </Select>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleSave} disabled={!name.trim() || isPending}>
              {isPending ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
