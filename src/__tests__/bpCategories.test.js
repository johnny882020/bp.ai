import { describe, it, expect } from 'vitest';
import {
  classifyBP,
  getCategoryInfo,
  validateReading,
  BPCategory,
} from '../lib/bpCategories.js';

// ---------------------------------------------------------------------------
// classifyBP — all 5 AHA boundaries
// ---------------------------------------------------------------------------
describe('classifyBP', () => {
  it('returns Normal for 119/79 (below all thresholds)', () => {
    expect(classifyBP(119, 79)).toBe(BPCategory.NORMAL);
  });

  it('returns Normal for 115/75 (well within normal)', () => {
    expect(classifyBP(115, 75)).toBe(BPCategory.NORMAL);
  });

  it('returns Elevated at sys=120 AND dia<80 (exact lower boundary)', () => {
    expect(classifyBP(120, 75)).toBe(BPCategory.ELEVATED);
  });

  it('returns Elevated at sys=129/dia=79 (upper boundary)', () => {
    expect(classifyBP(129, 79)).toBe(BPCategory.ELEVATED);
  });

  it('returns Elevated only when dia<80 (sys=125 dia=80 is Stage 1)', () => {
    expect(classifyBP(125, 80)).toBe(BPCategory.HYPERTENSION_STAGE_1);
  });

  it('returns Stage 1 at sys=130 (exact lower boundary)', () => {
    expect(classifyBP(130, 79)).toBe(BPCategory.HYPERTENSION_STAGE_1);
  });

  it('returns Stage 1 when dia=80 drives it (sys=119)', () => {
    expect(classifyBP(119, 80)).toBe(BPCategory.HYPERTENSION_STAGE_1);
  });

  it('returns Stage 1 at sys=139/dia=89 (upper boundary)', () => {
    expect(classifyBP(139, 89)).toBe(BPCategory.HYPERTENSION_STAGE_1);
  });

  it('returns Stage 2 at sys=140 (exact lower boundary)', () => {
    expect(classifyBP(140, 79)).toBe(BPCategory.HYPERTENSION_STAGE_2);
  });

  it('returns Stage 2 when dia=90 drives it (sys=120)', () => {
    expect(classifyBP(120, 90)).toBe(BPCategory.HYPERTENSION_STAGE_2);
  });

  it('returns Stage 2 at sys=180 exactly (crisis requires STRICTLY > 180)', () => {
    expect(classifyBP(180, 80)).toBe(BPCategory.HYPERTENSION_STAGE_2);
  });

  it('returns Crisis at sys=181 (one above strict boundary)', () => {
    expect(classifyBP(181, 80)).toBe(BPCategory.HYPERTENSIVE_CRISIS);
  });

  it('returns Crisis when dia=121 drives it (sys=140)', () => {
    expect(classifyBP(140, 121)).toBe(BPCategory.HYPERTENSIVE_CRISIS);
  });

  it('returns Crisis at dia=120 exactly? No — boundary is STRICTLY > 120', () => {
    // dia=120, sys=140 → Stage 2 (not crisis)
    expect(classifyBP(140, 120)).toBe(BPCategory.HYPERTENSION_STAGE_2);
  });
});

// ---------------------------------------------------------------------------
// getCategoryInfo — correct colors per category
// ---------------------------------------------------------------------------
describe('getCategoryInfo', () => {
  it('returns green color for Normal', () => {
    const info = getCategoryInfo(BPCategory.NORMAL);
    expect(info.color).toBe('#16a34a');
    expect(info.bgColor).toBe('#dcfce7');
  });

  it('returns amber color for Elevated', () => {
    const info = getCategoryInfo(BPCategory.ELEVATED);
    expect(info.color).toBe('#d97706');
  });

  it('returns orange color for Stage 1', () => {
    const info = getCategoryInfo(BPCategory.HYPERTENSION_STAGE_1);
    expect(info.color).toBe('#ea580c');
  });

  it('returns red color for Stage 2', () => {
    const info = getCategoryInfo(BPCategory.HYPERTENSION_STAGE_2);
    expect(info.color).toBe('#dc2626');
  });

  it('returns dark red for Crisis', () => {
    const info = getCategoryInfo(BPCategory.HYPERTENSIVE_CRISIS);
    expect(info.color).toBe('#991b1b');
  });

  it('falls back to Normal info for unknown category', () => {
    const info = getCategoryInfo('not-a-real-category');
    expect(info.color).toBe('#16a34a');
  });

  it('includes a recommendation string for every category', () => {
    Object.values(BPCategory).forEach(cat => {
      const info = getCategoryInfo(cat);
      expect(typeof info.recommendation).toBe('string');
      expect(info.recommendation.length).toBeGreaterThan(0);
    });
  });
});

// ---------------------------------------------------------------------------
// validateReading — ranges and sys > dia constraint
// ---------------------------------------------------------------------------
describe('validateReading', () => {
  it('returns null for a valid reading (120/80 pulse 72)', () => {
    expect(validateReading(120, 80, 72)).toBeNull();
  });

  it('returns null when pulse is omitted entirely', () => {
    expect(validateReading(120, 80)).toBeNull();
  });

  it('returns null when pulse is explicitly null', () => {
    expect(validateReading(120, 80, null)).toBeNull();
  });

  it('rejects systolic below minimum (69 < 70)', () => {
    expect(validateReading(69, 50, 72)).toMatch(/systolic/i);
  });

  it('rejects systolic above maximum (251 > 250)', () => {
    expect(validateReading(251, 80, 72)).toMatch(/systolic/i);
  });

  it('accepts systolic at exact minimum boundary (70)', () => {
    expect(validateReading(70, 50, 60)).toBeNull();
  });

  it('accepts systolic at exact maximum boundary (250)', () => {
    expect(validateReading(250, 140, 72)).toBeNull();
  });

  it('rejects diastolic below minimum (39 < 40)', () => {
    expect(validateReading(120, 39, 72)).toMatch(/diastolic/i);
  });

  it('rejects diastolic above maximum (151 > 150)', () => {
    expect(validateReading(120, 151, 72)).toMatch(/diastolic/i);
  });

  it('rejects pulse below minimum (39 < 40)', () => {
    expect(validateReading(120, 80, 39)).toMatch(/pulse/i);
  });

  it('rejects pulse above maximum (201 > 200)', () => {
    expect(validateReading(120, 80, 201)).toMatch(/pulse/i);
  });

  it('rejects reading where sys === dia', () => {
    expect(validateReading(120, 120, 72)).toMatch(/systolic must be greater/i);
  });

  it('rejects reading where sys < dia', () => {
    expect(validateReading(80, 120, 72)).toMatch(/systolic must be greater/i);
  });
});
