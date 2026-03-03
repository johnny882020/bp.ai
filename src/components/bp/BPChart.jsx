import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { format, subDays } from 'date-fns';

const TIME_RANGES = [7, 30, 90];

export default function BPChart({ readings }) {
  const [timeRange, setTimeRange] = useState(7);

  const cutoff = subDays(new Date(), timeRange);
  const filtered = readings
    .filter(r => new Date(r.measured_at ?? r.created_at) >= cutoff)
    .slice()
    .sort((a, b) => new Date(a.measured_at ?? a.created_at) - new Date(b.measured_at ?? b.created_at))
    .map(r => ({
      date:      format(new Date(r.measured_at ?? r.created_at), 'MM/dd'),
      systolic:  r.systolic,
      diastolic: r.diastolic,
      pulse:     r.pulse ?? undefined,
    }));

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900">BP Trend</h3>
        <div className="flex gap-1">
          {TIME_RANGES.map(d => (
            <button
              key={d}
              onClick={() => setTimeRange(d)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                timeRange === d
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
          No readings in the last {timeRange} days
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={filtered} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis domain={[60, 'auto']} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {/* AHA threshold reference lines */}
            <ReferenceLine y={130} stroke="#fb923c" strokeDasharray="3 3" label={{ value: 'Stage 1', fontSize: 10, fill: '#fb923c' }} />
            <ReferenceLine y={140} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Stage 2', fontSize: 10, fill: '#ef4444' }} />
            <Line type="monotone" dataKey="systolic"  stroke="#ef4444" strokeWidth={2} dot={false} name="Systolic" />
            <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={2} dot={false} name="Diastolic" />
            {filtered.some(d => d.pulse != null) && (
              <Line type="monotone" dataKey="pulse" stroke="#f97316" strokeWidth={1.5} dot={false} name="Pulse" />
            )}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
