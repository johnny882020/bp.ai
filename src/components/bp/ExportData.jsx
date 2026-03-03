import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ExportData({ readings }) {
  const handleExport = () => {
    if (!readings.length) return;

    const header = 'Date,Time,Systolic,Diastolic,Pulse,Arm,Position,Notes\n';
    const rows = readings.map(r => {
      const d = new Date(r.measured_at ?? r.created_at);
      return [
        d.toLocaleDateString(),
        d.toLocaleTimeString(),
        r.systolic,
        r.diastolic,
        r.pulse ?? '',
        r.arm ?? '',
        r.position ?? '',
        `"${(r.notes ?? '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csv  = header + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `bp-readings-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={!readings.length}
      className="flex items-center gap-2"
    >
      <Download className="w-4 h-4" />
      Export CSV
    </Button>
  );
}
