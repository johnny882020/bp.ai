// OCR engine for React Native using ML Kit (on-device, no WebAssembly required).
// Same 4 regex patterns as web version — only the image ingestion differs.
// Requires: react-native-mlkit-ocr (needs EAS Build / prebuild — not Expo Go).

import MlkitOcr from 'react-native-mlkit-ocr';

export interface BPOcrResult {
  systolic: number | null;
  diastolic: number | null;
  pulse: number | null;
}

export class OCREngine {
  /**
   * Process an image URI (from expo-image-picker or expo-camera).
   * Returns extracted BP values; any undetected field is null.
   */
  async processImageUri(uri: string): Promise<BPOcrResult> {
    const blocks = await MlkitOcr.detectFromUri(uri);
    const text = blocks.map((b) => b.text).join('\n');
    return this.extractBPReading(text);
  }

  private _normalizeOCR(raw: string): string {
    return raw
      .replace(/(\d)[,،](\d)/g, '$1/$2')          // comma → slash (European monitors)
      .replace(/(?<=\d)[oO]|[oO](?=\d)/g, '0')   // O adjacent to digit → 0
      .replace(/(?<=\d)[IlL]|[IlL](?=\d)/g, '1') // l/I/L adjacent to digit → 1
      .replace(/\bS(\d{1,2})\b/g, '5$1');         // S + 1-2 digits → 5… (OCR artefact)
  }

  private _validate(s: number, d: number, p: number | null): BPOcrResult | null {
    const NULL_RESULT = { systolic: null, diastolic: null, pulse: null };
    if (s > d) return { systolic: s, diastolic: d, pulse: p };
    if (d > s) return { systolic: d, diastolic: s, pulse: p }; // swap recovery
    return null;
  }

  extractBPReading(text: string): BPOcrResult {
    const NULL_RESULT: BPOcrResult = { systolic: null, diastolic: null, pulse: null };
    const t = this._normalizeOCR(text.toUpperCase());

    // Pattern 1: SYS/DIA labels — pulse OPTIONAL
    const p1 = t.match(
      /SYS[:\s]*(\d{2,3})[\s\S]{0,30}DIA[:\s]*(\d{2,3})(?:[\s\S]{0,30}(?:PULSE|PUL|P)[:\s]*(\d{2,3}))?/i,
    );
    if (p1) {
      const r = this._validate(this._num(p1[1]), this._num(p1[2]), p1[3] ? this._num(p1[3]) : null);
      if (r) return r;
    }

    // Pattern 3: BP/HR labels (before generic slash to capture HR pulse)
    const p3 = t.match(
      /BP[:\s]*(\d{2,3})\s*\/\s*(\d{2,3})(?:[\s\S]{0,30}(?:HR|HEART\s*RATE|PULSE)[:\s]*(\d{2,3}))?/i,
    );
    if (p3) {
      const r = this._validate(this._num(p3[1]), this._num(p3[2]), p3[3] ? this._num(p3[3]) : null);
      if (r) return r;
    }

    // Pattern 2: generic slash format — pulse OPTIONAL
    const p2 = t.match(/(\d{2,3})\s*\/\s*(\d{2,3})(?:\s+(\d{2,3}))?/);
    if (p2) {
      const r = this._validate(this._num(p2[1]), this._num(p2[2]), p2[3] ? this._num(p2[3]) : null);
      if (r) return r;
    }

    // Pattern 4: smarter numeric fallback — range-guarded via word-boundary tokens
    const tokens = [...t.matchAll(/\b(\d{2,3})\b/g)].map((x) => parseInt(x[1], 10));
    const sysIdx = tokens.findIndex((n) => n >= 90 && n <= 250);
    if (sysIdx !== -1) {
      const sys  = tokens[sysIdx];
      const rest = tokens.slice(sysIdx + 1);
      const dia  = rest.find((n) => n >= 40 && n <= 140 && n < sys);
      if (dia !== undefined) {
        const pul = rest.slice(rest.indexOf(dia) + 1).find((n) => n >= 40 && n <= 200);
        return { systolic: sys, diastolic: dia, pulse: pul ?? null };
      }
    }

    return NULL_RESULT;
  }

  private _num(s: string): number {
    return parseInt(s, 10);
  }
}

export const ocrEngine = new OCREngine();
