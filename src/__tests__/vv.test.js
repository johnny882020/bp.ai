/**
 * Verification & Validation (V&V) Test Suite — BP.ai
 * V&V-1 through V&V-10: formal validation of core medical logic.
 *
 * These tests verify that the app's classification, validation, and OCR
 * logic conform to AHA guidelines and physiological constraints.
 */
import { describe, it, expect } from 'vitest';
import { vi } from 'vitest';

vi.mock('tesseract.js', () => ({ default: {} }));

import {
  classifyBP,
  getCategoryInfo,
  validateReading,
  BPCategory,
} from '../lib/bpCategories.js';
import { OCREngine } from '../lib/ocrEngine.js';

const engine = new OCREngine();
const ext = (text) => engine.extractBPReading(text.toUpperCase());

// ──────────────────────────────────────────────────────────────────────────────
// V&V-1: AHA boundary precision
// ──────────────────────────────────────────────────────────────────────────────
describe('V&V-1: AHA boundary precision', () => {
  it('sys=119/dia=79 → Normal (one below Elevated threshold)', () => {
    expect(classifyBP(119, 79)).toBe(BPCategory.NORMAL);
  });

  it('sys=120/dia=79 → Elevated (exact lower bound)', () => {
    expect(classifyBP(120, 79)).toBe(BPCategory.ELEVATED);
  });

  it('sys=129/dia=79 → Elevated (upper bound)', () => {
    expect(classifyBP(129, 79)).toBe(BPCategory.ELEVATED);
  });

  it('sys=130/dia=79 → Stage 1 (exact lower bound)', () => {
    expect(classifyBP(130, 79)).toBe(BPCategory.HYPERTENSION_STAGE_1);
  });

  it('sys=139/dia=89 → Stage 1 (upper bound)', () => {
    expect(classifyBP(139, 89)).toBe(BPCategory.HYPERTENSION_STAGE_1);
  });

  it('sys=140/dia=79 → Stage 2 (exact lower bound)', () => {
    expect(classifyBP(140, 79)).toBe(BPCategory.HYPERTENSION_STAGE_2);
  });

  it('sys=180/dia=120 → Stage 2 (crisis requires STRICTLY > thresholds)', () => {
    expect(classifyBP(180, 120)).toBe(BPCategory.HYPERTENSION_STAGE_2);
  });

  it('sys=181/dia=80 → Crisis (one above strict boundary)', () => {
    expect(classifyBP(181, 80)).toBe(BPCategory.HYPERTENSIVE_CRISIS);
  });

  it('sys=140/dia=121 → Crisis (diastolic drives it)', () => {
    expect(classifyBP(140, 121)).toBe(BPCategory.HYPERTENSIVE_CRISIS);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// V&V-2: Systolic must be strictly greater than diastolic
// ──────────────────────────────────────────────────────────────────────────────
describe('V&V-2: sys > dia enforcement', () => {
  it('rejects sys === dia (120/120)', () => {
    expect(validateReading(120, 120, 72)).toMatch(/systolic must be greater/i);
  });

  it('rejects sys < dia (80/120)', () => {
    expect(validateReading(80, 120, 72)).toMatch(/systolic must be greater/i);
  });

  it('accepts sys > dia by 1 (121/120)', () => {
    expect(validateReading(121, 120, 72)).toBeNull();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// V&V-3: Physiological range enforcement
// ──────────────────────────────────────────────────────────────────────────────
describe('V&V-3: physiological range boundaries', () => {
  it('accepts systolic at minimum boundary (70)', () => {
    expect(validateReading(70, 50, 60)).toBeNull();
  });
  it('rejects systolic below minimum (69)', () => {
    expect(validateReading(69, 50, 60)).toMatch(/systolic/i);
  });
  it('accepts systolic at maximum boundary (250)', () => {
    expect(validateReading(250, 140, 72)).toBeNull();
  });
  it('rejects systolic above maximum (251)', () => {
    expect(validateReading(251, 140, 72)).toMatch(/systolic/i);
  });

  it('accepts diastolic at minimum boundary (40)', () => {
    expect(validateReading(100, 40, 60)).toBeNull();
  });
  it('rejects diastolic below minimum (39)', () => {
    expect(validateReading(100, 39, 60)).toMatch(/diastolic/i);
  });
  it('accepts diastolic at maximum boundary (150)', () => {
    expect(validateReading(200, 150, 72)).toBeNull();
  });
  it('rejects diastolic above maximum (151)', () => {
    expect(validateReading(200, 151, 72)).toMatch(/diastolic/i);
  });

  it('accepts pulse at minimum boundary (40)', () => {
    expect(validateReading(120, 80, 40)).toBeNull();
  });
  it('rejects pulse below minimum (39)', () => {
    expect(validateReading(120, 80, 39)).toMatch(/pulse/i);
  });
  it('accepts pulse at maximum boundary (200)', () => {
    expect(validateReading(120, 80, 200)).toBeNull();
  });
  it('rejects pulse above maximum (201)', () => {
    expect(validateReading(120, 80, 201)).toMatch(/pulse/i);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// V&V-4: OCR with maximum artifact noise
// ──────────────────────────────────────────────────────────────────────────────
describe('V&V-4: OCR artifact normalization under maximum noise', () => {
  it('all 4 normalizations in one string: O→0, l→1, comma→slash, L→1', () => {
    // "12O,8l" → "120/81" after O→0, comma→slash, l→1
    const r = ext('12O,8l');
    expect(r).not.toBeNull();
    expect(r.systolic).toBe(120);
    expect(r.diastolic).toBe(81);
  });

  it('S-prefix artifact: "S20/80" → normalized to "520/80" by regex → extracted as-is', () => {
    // "S20" → "520" (S+2digits normalization); P2 matches "520/80" as 3-digit number
    // OCR engine extracts what it finds — range validation happens in validateReading
    const r = ext('S20/80');
    expect(r).not.toBeNull();
    expect(r.systolic).toBe(520);
    expect(r.diastolic).toBe(80);
  });

  it('decimal readings: "120.5/80.3" → 120/80', () => {
    expect(ext('120.5/80.3')).toEqual({ systolic: 120, diastolic: 80, pulse: null });
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// V&V-5: OCR returns null when no valid reading exists
// ──────────────────────────────────────────────────────────────────────────────
describe('V&V-5: OCR null on invalid input', () => {
  it('returns null for completely unrelated text', () => {
    expect(ext('BATTERY LOW PLEASE CHARGE')).toBeNull();
  });

  it('returns null for numbers all out of BP range (e.g. date only)', () => {
    // "03 15 24" — all below 90 (systolic min)
    expect(ext('03 15 24')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(ext('')).toBeNull();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// V&V-6: OCR swap recovery
// ──────────────────────────────────────────────────────────────────────────────
describe('V&V-6: OCR swap recovery (inverted readings)', () => {
  it('corrects inverted slash format "80/120" → {sys:120, dia:80}', () => {
    expect(ext('80/120')).toEqual({ systolic: 120, diastolic: 80, pulse: null });
  });

  it('corrects inverted SYS/DIA labels where values are swapped', () => {
    // SYS: 80 DIA: 120 — _validate detects d > s and swaps
    expect(ext('SYS: 80 DIA: 120')).toEqual({ systolic: 120, diastolic: 80, pulse: null });
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// V&V-7: Full AHA spectrum — one representative reading per category
// ──────────────────────────────────────────────────────────────────────────────
describe('V&V-7: full AHA classification spectrum', () => {
  const cases = [
    [115, 75, BPCategory.NORMAL],
    [125, 75, BPCategory.ELEVATED],
    [135, 85, BPCategory.HYPERTENSION_STAGE_1],
    [150, 95, BPCategory.HYPERTENSION_STAGE_2],
    [185, 115, BPCategory.HYPERTENSIVE_CRISIS],
  ];
  cases.forEach(([sys, dia, expected]) => {
    it(`${sys}/${dia} → ${expected}`, () => {
      expect(classifyBP(sys, dia)).toBe(expected);
    });
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// V&V-8: BP category colors match medical convention
// ──────────────────────────────────────────────────────────────────────────────
describe('V&V-8: category colors match medical convention', () => {
  it('Normal is green (#16a34a)', () => {
    expect(getCategoryInfo(BPCategory.NORMAL).color).toBe('#16a34a');
  });

  it('Elevated is amber/yellow (not red)', () => {
    const color = getCategoryInfo(BPCategory.ELEVATED).color;
    expect(color).toMatch(/^#[dD]/); // amber starts with #d
  });

  it('Stage 1 is orange', () => {
    expect(getCategoryInfo(BPCategory.HYPERTENSION_STAGE_1).color).toBe('#ea580c');
  });

  it('Stage 2 is red', () => {
    expect(getCategoryInfo(BPCategory.HYPERTENSION_STAGE_2).color).toBe('#dc2626');
  });

  it('Crisis is dark red (darker than Stage 2)', () => {
    expect(getCategoryInfo(BPCategory.HYPERTENSIVE_CRISIS).color).toBe('#991b1b');
  });

  it('Crisis color is darker than Stage 2 color (lower hex value)', () => {
    const crisis = parseInt(getCategoryInfo(BPCategory.HYPERTENSIVE_CRISIS).color.slice(1), 16);
    const stage2 = parseInt(getCategoryInfo(BPCategory.HYPERTENSION_STAGE_2).color.slice(1), 16);
    expect(crisis).toBeLessThan(stage2);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// V&V-9: Crisis threshold is STRICTLY > 180 systolic AND/OR > 120 diastolic
// ──────────────────────────────────────────────────────────────────────────────
describe('V&V-9: hypertensive crisis threshold strictness', () => {
  it('sys=180 is NOT crisis (not strictly greater)', () => {
    expect(classifyBP(180, 80)).toBe(BPCategory.HYPERTENSION_STAGE_2);
  });

  it('sys=181 IS crisis', () => {
    expect(classifyBP(181, 80)).toBe(BPCategory.HYPERTENSIVE_CRISIS);
  });

  it('dia=120 is NOT crisis (not strictly greater)', () => {
    expect(classifyBP(150, 120)).toBe(BPCategory.HYPERTENSION_STAGE_2);
  });

  it('dia=121 IS crisis', () => {
    expect(classifyBP(150, 121)).toBe(BPCategory.HYPERTENSIVE_CRISIS);
  });

  it('both sys=181 and dia=121 is crisis', () => {
    expect(classifyBP(181, 121)).toBe(BPCategory.HYPERTENSIVE_CRISIS);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// V&V-10: Medical recommendations are present for all categories
// ──────────────────────────────────────────────────────────────────────────────
describe('V&V-10: medical recommendations present for all categories', () => {
  Object.values(BPCategory).forEach(cat => {
    it(`${cat} has a non-empty recommendation string`, () => {
      const info = getCategoryInfo(cat);
      expect(typeof info.recommendation).toBe('string');
      expect(info.recommendation.trim().length).toBeGreaterThan(10);
    });
  });

  it('Crisis recommendation mentions emergency or doctor', () => {
    const rec = getCategoryInfo(BPCategory.HYPERTENSIVE_CRISIS).recommendation.toLowerCase();
    const mentionsUrgency = rec.includes('emergency') || rec.includes('doctor') ||
                            rec.includes('immediately') || rec.includes('seek');
    expect(mentionsUrgency).toBe(true);
  });

  it('Normal recommendation does not mention emergency', () => {
    const rec = getCategoryInfo(BPCategory.NORMAL).recommendation.toLowerCase();
    expect(rec.includes('emergency')).toBe(false);
  });
});
