/**
 * Sanity tests — smoke-level integration checks.
 * 5 tests corresponding to ST-1 through ST-5.
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

describe('Sanity tests', () => {
  it('ST-1: classifyBP → getCategoryInfo pipeline returns complete info object', () => {
    const category = classifyBP(120, 80);
    const info = getCategoryInfo(category);
    expect(info).toBeDefined();
    expect(typeof info.color).toBe('string');
    expect(typeof info.bgColor).toBe('string');
    expect(typeof info.recommendation).toBe('string');
    expect(info.color.startsWith('#')).toBe(true);
  });

  it('ST-2: validateReading accepts a physiologically normal reading', () => {
    expect(validateReading(118, 76, 68)).toBeNull();
  });

  it('ST-3: validateReading rejects a reading with impossible systolic', () => {
    const err = validateReading(50, 30, 60);
    expect(typeof err).toBe('string');
    expect(err.length).toBeGreaterThan(0);
  });

  it('ST-4: OCR Pattern 4 (numeric fallback) recovers a reading from plain numbers', () => {
    const engine = new OCREngine();
    const r = engine.extractBPReading('130\n85\n72');
    expect(r).not.toBeNull();
    expect(r.systolic).toBe(130);
    expect(r.diastolic).toBe(85);
    expect(r.pulse).toBe(72);
  });

  it('ST-5: AHA crisis boundary — 181/80 is crisis; 180/80 is Stage 2', () => {
    expect(classifyBP(181, 80)).toBe(BPCategory.HYPERTENSIVE_CRISIS);
    expect(classifyBP(180, 80)).toBe(BPCategory.HYPERTENSION_STAGE_2);
  });
});
