// AHA Blood Pressure Category Classification
// Identical to web src/lib/bpCategories.js — pure logic, zero platform deps.

export const BPCategory = {
  NORMAL:               'Normal',
  ELEVATED:             'Elevated',
  HYPERTENSION_STAGE_1: 'Hypertension Stage 1',
  HYPERTENSION_STAGE_2: 'Hypertension Stage 2',
  HYPERTENSIVE_CRISIS:  'Hypertensive Crisis',
} as const;

export type BPCategoryValue = typeof BPCategory[keyof typeof BPCategory];

export interface CategoryInfo {
  color: string;
  bgColor: string;
  recommendation: string;
}

export function classifyBP(systolic: number, diastolic: number): BPCategoryValue {
  if (systolic > 180 || diastolic > 120) return BPCategory.HYPERTENSIVE_CRISIS;
  if (systolic >= 140 || diastolic >= 90)  return BPCategory.HYPERTENSION_STAGE_2;
  if (systolic >= 130 || diastolic >= 80)  return BPCategory.HYPERTENSION_STAGE_1;
  if (systolic >= 120 && diastolic < 80)   return BPCategory.ELEVATED;
  return BPCategory.NORMAL;
}

export function getCategoryInfo(category: BPCategoryValue): CategoryInfo {
  const map: Record<BPCategoryValue, CategoryInfo> = {
    [BPCategory.NORMAL]: {
      color: '#16a34a',
      bgColor: '#dcfce7',
      recommendation: 'Maintain healthy habits — regular exercise, balanced diet, stress management.',
    },
    [BPCategory.ELEVATED]: {
      color: '#d97706',
      bgColor: '#fef9c3',
      recommendation: 'Lifestyle changes can prevent hypertension — reduce sodium, increase activity.',
    },
    [BPCategory.HYPERTENSION_STAGE_1]: {
      color: '#ea580c',
      bgColor: '#ffedd5',
      recommendation: 'Consult your doctor. Lifestyle changes and possibly medication recommended.',
    },
    [BPCategory.HYPERTENSION_STAGE_2]: {
      color: '#dc2626',
      bgColor: '#fee2e2',
      recommendation: 'Consult your doctor promptly. Medication is likely needed.',
    },
    [BPCategory.HYPERTENSIVE_CRISIS]: {
      color: '#991b1b',
      bgColor: '#fecaca',
      recommendation: '⚠️ Seek emergency care immediately.',
    },
  };
  return map[category] ?? map[BPCategory.NORMAL];
}

export function validateReading(
  systolic: number,
  diastolic: number,
  pulse?: number | null,
): string | null {
  if (isNaN(systolic) || systolic < 70 || systolic > 250)
    return 'Systolic must be between 70 and 250 mmHg.';
  if (isNaN(diastolic) || diastolic < 40 || diastolic > 150)
    return 'Diastolic must be between 40 and 150 mmHg.';
  if (pulse != null && !isNaN(pulse) && (pulse < 40 || pulse > 200))
    return 'Pulse must be between 40 and 200 bpm.';
  if (systolic <= diastolic)
    return 'Systolic must be greater than diastolic.';
  return null;
}
