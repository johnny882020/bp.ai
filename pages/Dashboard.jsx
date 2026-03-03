import React from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Heart, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useBPReadings } from '@/hooks/useBPReadings';

import StatsCards      from '@/components/bp/StatsCards';
import BPChart         from '@/components/bp/BPChart';
import ReadingsList    from '@/components/bp/ReadingsList';
import AddReadingForm  from '@/components/bp/AddReadingForm';
import ExportData      from '@/components/bp/ExportData';
import CameraCapture   from '@/components/bp/CameraCapture';

export default function Dashboard() {
  const { readings, isLoading, isError, error, createMutation, deleteMutation } = useBPReadings();
  const [addFormOpen,   setAddFormOpen]   = React.useState(false);
  const [prefilledData, setPrefilledData] = React.useState(null);

  const handleOpenAddFormWithData = (data) => {
    setPrefilledData(data);
    setAddFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg shadow-blue-600/20">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">BP.ai</h1>
              <p className="text-sm text-slate-500">Blood Pressure Monitor</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <CameraCapture onOpenAddForm={handleOpenAddFormWithData} />
            <ExportData readings={readings} />
            <AddReadingForm
              createMutation={createMutation}
              initialValues={prefilledData}
              isOpen={addFormOpen}
              onOpenChange={(open) => {
                setAddFormOpen(open);
                if (!open) setPrefilledData(null);
              }}
            />
            <button
              onClick={() => setAddFormOpen(true)}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-md text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 transition-colors"
            >
              + Add Reading
            </button>
          </div>
        </div>

        {/* Error banner */}
        {isError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              Failed to load readings: {error?.message ?? 'Unknown error'}
            </AlertDescription>
          </Alert>
        )}

        {/* Health tip */}
        <Alert className="mb-5">
          <Info className="h-4 w-4 text-blue-600 inline mr-2" />
          <AlertDescription>
            <strong>Healthy range:</strong> Below 120/80 mmHg.
            Measure at the same time each day for consistent tracking.
          </AlertDescription>
        </Alert>

        {/* Stats */}
        {readings.length > 0 && (
          <div className="mb-5">
            <StatsCards readings={readings} />
          </div>
        )}

        {/* Chart + list */}
        <div className="space-y-4">
          <BPChart readings={readings} />
          <ReadingsList
            readings={readings}
            onDelete={deleteMutation.mutate}
            isLoading={isLoading}
          />
        </div>

        {/* AHA Reference */}
        <div className="mt-6 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-3 text-sm">BP Categories (AHA)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {[
              { label: 'Normal',   range: '< 120/80',   bg: '#dcfce7', color: '#16a34a' },
              { label: 'Elevated', range: '120–129/<80', bg: '#fef9c3', color: '#d97706' },
              { label: 'Stage 1',  range: '130–139/80–89', bg: '#ffedd5', color: '#ea580c' },
              { label: 'Stage 2',  range: '≥ 140/≥ 90', bg: '#fee2e2', color: '#dc2626' },
            ].map(({ label, range, bg, color }) => (
              <div key={label} className="flex items-start gap-2 p-2 rounded-lg" style={{ backgroundColor: bg }}>
                <div className="w-2 h-2 rounded-full mt-0.5 flex-shrink-0" style={{ backgroundColor: color }} />
                <div>
                  <p className="font-semibold" style={{ color }}>{label}</p>
                  <p style={{ color }}>{range}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
