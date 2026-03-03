import React from 'react';
import { useBPReadings } from '@/hooks/useBPReadings';
import ReadingsList   from '@/components/bp/ReadingsList';
import AddReadingForm from '@/components/bp/AddReadingForm';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Readings() {
  const { readings, isLoading, isError, error, createMutation, deleteMutation } = useBPReadings();
  const [open, setOpen] = React.useState(false);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-slate-900">Readings</h1>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span>{readings.length} total</span>
          <button
            onClick={() => setOpen(true)}
            className="h-9 px-4 rounded-md text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 transition-colors"
          >
            + Add
          </button>
        </div>
      </div>

      {isError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error?.message}</AlertDescription>
        </Alert>
      )}

      <ReadingsList readings={readings} onDelete={deleteMutation.mutate} isLoading={isLoading} />

      <AddReadingForm
        createMutation={createMutation}
        isOpen={open}
        onOpenChange={setOpen}
      />
    </div>
  );
}
