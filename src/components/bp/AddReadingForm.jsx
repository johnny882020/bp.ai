import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { classifyBP, getCategoryInfo, validateReading } from '@/lib/bpCategories';

const empty = { systolic: '', diastolic: '', pulse: '', measured_at: '', arm: '', position: '', notes: '' };

function toDatetimeLocal(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AddReadingForm({ createMutation, initialValues, isOpen, onOpenChange }) {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  // Populate when opened (fresh or with OCR prefill)
  useEffect(() => {
    if (isOpen) {
      setError('');
      setForm({
        ...empty,
        measured_at: toDatetimeLocal(new Date().toISOString()),
        ...(initialValues
          ? {
              systolic:  initialValues.systolic  ?? '',
              diastolic: initialValues.diastolic ?? '',
              pulse:     initialValues.pulse     ?? '',
            }
          : {}),
      });
    }
  }, [isOpen, initialValues]);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const sys = parseInt(form.systolic);
  const dia = parseInt(form.diastolic);
  const liveCategory = !isNaN(sys) && !isNaN(dia) ? classifyBP(sys, dia) : null;
  const liveInfo     = liveCategory ? getCategoryInfo(liveCategory) : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const sys  = parseInt(form.systolic);
    const dia  = parseInt(form.diastolic);
    const pul  = form.pulse ? parseInt(form.pulse) : undefined;

    const err = validateReading(sys, dia, pul);
    if (err) { setError(err); return; }

    const payload = {
      systolic:    sys,
      diastolic:   dia,
      ...(pul != null           && { pulse: pul }),
      ...(form.measured_at      && { measured_at: new Date(form.measured_at).toISOString() }),
      ...(form.arm              && { arm: form.arm }),
      ...(form.position         && { position: form.position }),
      ...(form.notes.trim()     && { notes: form.notes.trim() }),
    };

    try {
      await createMutation.mutateAsync(payload);
      onOpenChange(false);
    } catch (e) {
      setError(e?.message || 'Failed to save reading. Please try again.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Add Reading</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* BP Values */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Systolic *</label>
              <Input type="number" value={form.systolic} onChange={set('systolic')} placeholder="120" required />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Diastolic *</label>
              <Input type="number" value={form.diastolic} onChange={set('diastolic')} placeholder="80" required />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Pulse (bpm)</label>
            <Input type="number" value={form.pulse} onChange={set('pulse')} placeholder="72" />
          </div>

          {/* Live category preview */}
          {liveInfo && (
            <div className="p-3 rounded-lg flex items-start gap-2" style={{ backgroundColor: liveInfo.bgColor }}>
              <Badge style={{ backgroundColor: liveInfo.bgColor, color: liveInfo.color }}>
                {liveCategory}
              </Badge>
              <p className="text-sm" style={{ color: liveInfo.color }}>{liveInfo.recommendation}</p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Date & Time</label>
            <Input type="datetime-local" value={form.measured_at} onChange={set('measured_at')} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Arm</label>
              <Select value={form.arm} onChange={set('arm')}>
                <option value="">— optional —</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Position</label>
              <Select value={form.position} onChange={set('position')}>
                <option value="">— optional —</option>
                <option value="sitting">Sitting</option>
                <option value="standing">Standing</option>
                <option value="lying">Lying</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Notes</label>
            <Textarea value={form.notes} onChange={set('notes')} placeholder="Any relevant notes…" rows={2} />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Saving…' : 'Save Reading'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
