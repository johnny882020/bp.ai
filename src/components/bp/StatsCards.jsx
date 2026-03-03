import React from 'react';
import { classifyBP, getCategoryInfo } from '@/lib/bpCategories';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Heart, Activity, Calendar } from 'lucide-react';

function computeStats(readings) {
  if (!readings.length) return null;

  const n = readings.length;
  const avgSys  = Math.round(readings.reduce((s, r) => s + r.systolic, 0) / n);
  const avgDia  = Math.round(readings.reduce((s, r) => s + r.diastolic, 0) / n);

  const withPulse = readings.filter(r => r.pulse != null);
  const avgPulse  = withPulse.length
    ? Math.round(withPulse.reduce((s, r) => s + r.pulse, 0) / withPulse.length)
    : null;

  const latest   = readings[0]; // already sorted newest-first
  const category = classifyBP(latest.systolic, latest.diastolic);
  const info     = getCategoryInfo(category);

  return { avgSys, avgDia, avgPulse, count: n, category, info };
}

function StatCard({ icon: Icon, label, value, sub, iconColor }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function StatsCards({ readings }) {
  const stats = computeStats(readings);

  if (!stats) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard
        icon={TrendingUp}
        label="Avg BP"
        value={`${stats.avgSys}/${stats.avgDia}`}
        sub="mmHg"
        iconColor="text-blue-500"
      />
      <StatCard
        icon={Heart}
        label="Avg Pulse"
        value={stats.avgPulse ?? '—'}
        sub="bpm"
        iconColor="text-red-500"
      />
      <StatCard
        icon={Calendar}
        label="Readings"
        value={stats.count}
        sub="total logged"
        iconColor="text-violet-500"
      />
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-4 h-4 text-emerald-500" />
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Latest</span>
        </div>
        <Badge style={{ backgroundColor: stats.info.bgColor, color: stats.info.color }}>
          {stats.category}
        </Badge>
      </div>
    </div>
  );
}
