import { describe, it, expect, beforeEach } from 'vitest';
import { vi } from 'vitest';

// Prevent Tesseract from loading in Node environment (it requires browser canvas)
vi.mock('tesseract.js', () => ({ default: {} }));

import { OCREngine } from '../lib/ocrEngine.js';

let engine;
beforeEach(() => { engine = new OCREngine(); });

// Helper: mirrors what processImage does before calling extractBPReading
const ext = (text) => engine.extractBPReading(text.toUpperCase());

// ---------------------------------------------------------------------------
// Pattern 1 — SYS/DIA labels
// ---------------------------------------------------------------------------
describe('Pattern 1 (SYS/DIA labels)', () => {
  it('extracts all three values when pulse is present', () => {
    expect(ext('SYS: 120 DIA: 80 PULSE: 72')).toEqual({ systolic: 120, diastolic: 80, pulse: 72 });
  });

  it('extracts SYS/DIA when pulse is absent — BUG FIX', () => {
    expect(ext('SYS 135 DIA 85')).toEqual({ systolic: 135, diastolic: 85, pulse: null });
  });

  it('handles PUL abbreviation for pulse', () => {
    expect(ext('SYS:118 DIA:76 PUL:68')).toEqual({ systolic: 118, diastolic: 76, pulse: 68 });
  });

  it('handles colon-space separator: "SYS: 122 DIA: 78"', () => {
    expect(ext('SYS: 122 DIA: 78')).toEqual({ systolic: 122, diastolic: 78, pulse: null });
  });
});

// ---------------------------------------------------------------------------
// Pattern 2 — slash format
// ---------------------------------------------------------------------------
describe('Pattern 2 (slash format)', () => {
  it('extracts 120/80 with pulse', () => {
    expect(ext('120/80 72')).toEqual({ systolic: 120, diastolic: 80, pulse: 72 });
  });

  it('extracts 120/80 without pulse — BUG FIX', () => {
    expect(ext('120/80')).toEqual({ systolic: 120, diastolic: 80, pulse: null });
  });

  it('handles spaces around slash "120 / 80"', () => {
    expect(ext('120 / 80')).toEqual({ systolic: 120, diastolic: 80, pulse: null });
  });
});

// ---------------------------------------------------------------------------
// Pattern 3 — BP/HR labels
// ---------------------------------------------------------------------------
describe('Pattern 3 (BP/HR labels)', () => {
  it('extracts BP label with HR label', () => {
    expect(ext('BP 120/80 HR 72')).toEqual({ systolic: 120, diastolic: 80, pulse: 72 });
  });

  it('extracts BP label without HR — pulse optional', () => {
    expect(ext('BP: 118/76')).toEqual({ systolic: 118, diastolic: 76, pulse: null });
  });
});

// ---------------------------------------------------------------------------
// Pattern 4 — smarter numeric fallback
// ---------------------------------------------------------------------------
describe('Pattern 4 (numeric fallback)', () => {
  it('picks up plain numbers when no labels or slash present', () => {
    // 125 is systolic-range, 82 is diastolic-range, 68 is pulse-range
    expect(ext('125\n82\n68')).toEqual({ systolic: 125, diastolic: 82, pulse: 68 });
  });

  it('returns null when no number falls in systolic range (90–250)', () => {
    // All numbers < 90 — no valid systolic
    expect(ext('12 25 30')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// OCR character normalization
// ---------------------------------------------------------------------------
describe('OCR character normalization', () => {
  it('replaces O with 0 when adjacent to digits ("12O/8O" → "120/80")', () => {
    expect(ext('12O/8O')).toEqual({ systolic: 120, diastolic: 80, pulse: null });
  });

  it('replaces l with 1 when adjacent to digits ("l20/80" → "120/80")', () => {
    expect(ext('l20/80')).toEqual({ systolic: 120, diastolic: 80, pulse: null });
  });

  it('handles comma format used by European monitors ("120,80")', () => {
    expect(ext('120,80')).toEqual({ systolic: 120, diastolic: 80, pulse: null });
  });
});

// ---------------------------------------------------------------------------
// Swap recovery — inverted values
// ---------------------------------------------------------------------------
describe('Swap recovery (inverted readings)', () => {
  it('swaps values when diastolic appears larger than systolic ("80/120")', () => {
    expect(ext('80/120')).toEqual({ systolic: 120, diastolic: 80, pulse: null });
  });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------
describe('Edge cases', () => {
  it('returns null for complete garbage text', () => {
    expect(ext('HELLO WORLD FOO BAR')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(ext('')).toBeNull();
  });

  it('pulse is null (not undefined) when not found', () => {
    const r = ext('SYS 120 DIA 80');
    expect(r).not.toBeNull();
    expect(r.pulse).toBeNull();
    expect(r.pulse).not.toBeUndefined();
  });

  it('handles a reading with only two-digit numbers in valid ranges', () => {
    // sys=95 (valid), dia=65 (valid), no pulse
    expect(ext('95/65')).toEqual({ systolic: 95, diastolic: 65, pulse: null });
  });
});

// ---------------------------------------------------------------------------
// OCR decimal normalization
// ---------------------------------------------------------------------------
describe('OCR decimal normalization', () => {
  it('truncates decimal readings ("120.5/80.3" → 120/80)', () => {
    expect(ext('120.5/80.3')).toEqual({ systolic: 120, diastolic: 80, pulse: null });
  });

  it('truncates decimals with pulse ("120.5/80.3 72.0")', () => {
    expect(ext('120.5/80.3 72.0')).toEqual({ systolic: 120, diastolic: 80, pulse: 72 });
  });
});

// ---------------------------------------------------------------------------
// Pattern 5 — space-separated format
// ---------------------------------------------------------------------------
describe('Pattern 5 (space-separated)', () => {
  it('extracts "130  85  72" with double-space separator', () => {
    expect(ext('130  85  72')).toEqual({ systolic: 130, diastolic: 85, pulse: 72 });
  });

  it('extracts "118  76" without pulse', () => {
    expect(ext('118  76')).toEqual({ systolic: 118, diastolic: 76, pulse: null });
  });

  it('handles tab-separated values (tabs count as \\s)', () => {
    expect(ext('125\t\t82')).toEqual({ systolic: 125, diastolic: 82, pulse: null });
  });
});
