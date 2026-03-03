import React, { useState } from 'react';
import { format } from 'date-fns';
import { Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { classifyBP, getCategoryInfo } from '@/lib/bpCategories';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const PAGE_SIZE = 25;

export default function ReadingsList({ readings, onDelete, isLoading }) {
  const [page, setPage] = useState(0);
  const [confirming, setConfirming] = useState(null);

  const totalPages = Math.ceil(readings.length / PAGE_SIZE);
  const paginated  = readings.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 h-20 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!readings.length) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
        No readings yet. Add your first reading above.
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-2">
        {paginated.map(r => {
          const dateStr = r.measured_at ?? r.created_at;
          const category = classifyBP(r.systolic, r.diastolic);
          const info     = getCategoryInfo(category);

          return (
            <div key={r.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-lg">
                      {r.systolic}/{r.diastolic}
                      <span className="text-xs font-normal text-slate-500 ml-1">mmHg</span>
                    </span>
                    {r.pulse != null && (
                      <span className="text-slate-600 text-sm">
                        {r.pulse} <span className="text-xs text-slate-400">bpm</span>
                      </span>
                    )}
                    <Badge style={{ backgroundColor: info.bgColor, color: info.color }}>
                      {category}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {dateStr ? format(new Date(dateStr), 'PPP · p') : 'Unknown date'}
                    {r.arm      && ` · ${r.arm} arm`}
                    {r.position && ` · ${r.position}`}
                  </p>
                  {r.notes && (
                    <p className="text-xs text-slate-600 mt-1 bg-slate-50 rounded px-2 py-1">{r.notes}</p>
                  )}
                </div>

                <div className="ml-3 flex-shrink-0">
                  {confirming === r.id ? (
                    <div className="flex gap-1">
                      <Button size="sm" variant="destructive" onClick={() => { onDelete(r.id); setConfirming(null); }}>
                        Delete
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setConfirming(null)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button size="icon" variant="ghost" onClick={() => setConfirming(r.id)}
                      className="text-slate-400 hover:text-red-500 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4">
          <Button size="icon" variant="ghost" onClick={() => setPage(p => p - 1)} disabled={page === 0}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-slate-600">{page + 1} / {totalPages}</span>
          <Button size="icon" variant="ghost" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
