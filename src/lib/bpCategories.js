// AHA Blood Pressure Category Classification
// Single source of truth for all category logic across the app.

export const BPCategory = {
  NORMAL:               'Normal',
  ELEVATED:             'Elevated',
  HYPERTENSION_STAGE_1: 'Hypertension Stage 1',
  HYPERTENSION_STAGE_2: 'Hypertension Stage 2',
  HYPERTENSIVE_CRISIS:  'Hypertensive Crisis',
};

/**
 * Classify a blood pressure reading per AHA guidelines.
 * @param {number} systolic
 * @param {number} diastolic
 * @returns {string} BPCategory value
 */
export function classifyBP(systolic, diastolic) {
  if (systolic > 180 || diastolic > 120) return BPCategory.HYPERTENSIVE_CRISIS;
  if (systolic >= 140 || diastolic >= 90)  return BPCategory.HYPERTENSION_STAGE_2;
  if (systolic >= 130 || diastolic >= 80)  return BPCategory.HYPERTENSION_STAGE_1;
  if (systolic >= 120 && diastolic < 80)   return BPCategory.ELEVATED;
  return BPCategory.NORMAL;
}

/**
 * @param {string} category BPCategory value
 * @returns {{ color: string, bgColor: string, recommendation: string }}
 */
export function getCategoryInfo(category) {
  const map = {
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

/**
 * Validate a reading against AHA physiological ranges.
 * @returns {string|null} error message, or null if valid
 */
export function validateReading(systolic, diastolic, pulse) {
  if (isNaN(systolic) || systolic < 70 || systolic > 250)
    return 'Systolic must be between 70 and 250 mmHg.';
  if (isNaN(diastolic) || diastolic < 40 || diastolic > 150)
    return 'Diastolic must be between 40 and 150 mmHg.';
  if (pulse !== undefined && pulse !== null && !isNaN(pulse) && (pulse < 40 || pulse > 200))
    return 'Pulse must be between 40 and 200 bpm.';
  if (systolic <= diastolic)
    return 'Systolic must be greater than diastolic.';
  return null;
}
