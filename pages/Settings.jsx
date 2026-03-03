import React from 'react';
import { useBPReadings } from '@/hooks/useBPReadings';
import ExportData from '@/components/bp/ExportData';
import { Info, BookOpen, AlertTriangle, LogOut } from 'lucide-react';

const CATEGORIES = [
  { name: 'Normal',              range: '< 120/80 mmHg',      color: '#16a34a', bg: '#dcfce7', desc: 'Maintain healthy habits.' },
  { name: 'Elevated',            range: '120–129 / < 80 mmHg', color: '#d97706', bg: '#fef9c3', desc: 'Lifestyle changes can help.' },
  { name: 'Hypertension Stage 1',range: '130–139 / 80–89 mmHg',color: '#ea580c', bg: '#ffedd5', desc: 'Consult your doctor.' },
  { name: 'Hypertension Stage 2',range: '≥ 140 / ≥ 90 mmHg',  color: '#dc2626', bg: '#fee2e2', desc: 'Treatment likely needed.' },
  { name: 'Hypertensive Crisis', range: '> 180 / > 120 mmHg', color: '#991b1b', bg: '#fecaca', desc: '⚠️ Seek emergency care immediately.' },
];

export default function Settings({ onLogout }) {
  const { readings } = useBPReadings();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>

      {/* Export */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h2 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
          <Info className="w-4 h-4" /> Data Export
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          Download all your readings as a CSV file to share with your doctor or for backup.
        </p>
        <ExportData readings={readings} />
        <p className="text-xs text-slate-400 mt-2">{readings.length} reading{readings.length !== 1 ? 's' : ''} stored</p>
      </div>

      {/* AHA Guidelines */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4" /> AHA Blood Pressure Guidelines
        </h2>
        <div className="space-y-2">
          {CATEGORIES.map(c => (
            <div key={c.name} className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: c.bg }}>
              <div className="w-3 h-3 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: c.color }} />
              <div>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-semibold text-sm" style={{ color: c.color }}>{c.name}</span>
                  <span className="text-xs text-slate-600">{c.range}</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm font-semibold text-amber-900 flex items-center gap-2 mb-1">
          <AlertTriangle className="w-4 h-4" /> Medical Disclaimer
        </p>
        <p className="text-xs text-amber-800">
          BP.ai is for informational and tracking purposes only. It is not a medical device and
          should not be used for diagnosis or treatment. Always consult a qualified healthcare
          professional for medical advice.
        </p>
      </div>

      {/* Logout */}
      {onLogout && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <LogOut className="w-4 h-4" /> Account
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Sign out of BP.ai on this device.
          </p>
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      )}

      {/* Version */}
      <p className="text-xs text-center text-slate-400">BP.ai v1.0 · Powered by Base44</p>
    </div>
  );
}
