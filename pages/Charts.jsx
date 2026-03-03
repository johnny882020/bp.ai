import React from 'react';
import { useBPReadings } from '@/hooks/useBPReadings';
import BPChart from '@/components/bp/BPChart';
import StatsCards from '@/components/bp/StatsCards';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Charts() {
  const { readings, isLoading, isError, error } = useBPReadings();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-5">Analytics</h1>

      {isError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error?.message}</AlertDescription>
        </Alert>
      )}

      {isLoading && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 h-56 animate-pulse" />
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 h-24 animate-pulse" />
            ))}
          </div>
        </div>
      )}

      {!isLoading && readings.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 text-sm">
          Add readings on the Home tab to see your analytics here.
        </div>
      )}

      {!isLoading && readings.length > 0 && (
        <div className="space-y-4">
          <BPChart readings={readings} />
          <StatsCards readings={readings} />
        </div>
      )}
    </div>
  );
}
