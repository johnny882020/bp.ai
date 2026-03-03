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

  extractBPReading(text: string): BPOcrResult {
    const normalized = text.replace(/[,،]/g, '.').replace(/[oO]/g, '0');

    // Pattern 1: explicit labels — "SYS 120 DIA 80 HR 72" or "SYS:120 DIA:80"
    const labelMatch = normalized.match(
      /SYS[:\s]*(\d{2,3})[\s\S]{0,20}DIA[:\s]*(\d{2,3})(?:[\s\S]{0,20}(?:HR|PUL|PULSE)[:\s]*(\d{2,3}))?/i,
    );
    if (labelMatch) {
      return {
        systolic:  this._num(labelMatch[1]),
        diastolic: this._num(labelMatch[2]),
        pulse:     labelMatch[3] ? this._num(labelMatch[3]) : null,
      };
    }

    // Pattern 2: "120/80 72" — slash-separated with optional pulse
    const slashMatch = normalized.match(/(\d{2,3})\s*\/\s*(\d{2,3})(?:\s+(\d{2,3}))?/);
    if (slashMatch) {
      return {
        systolic:  this._num(slashMatch[1]),
        diastolic: this._num(slashMatch[2]),
        pulse:     slashMatch[3] ? this._num(slashMatch[3]) : null,
      };
    }

    // Pattern 3: "BP 120/80 HR 72" or "BP:120/80 HR:72"
    const bpHrMatch = normalized.match(
      /BP[:\s]*(\d{2,3})\s*\/\s*(\d{2,3})(?:[\s\S]{0,20}HR[:\s]*(\d{2,3}))?/i,
    );
    if (bpHrMatch) {
      return {
        systolic:  this._num(bpHrMatch[1]),
        diastolic: this._num(bpHrMatch[2]),
        pulse:     bpHrMatch[3] ? this._num(bpHrMatch[3]) : null,
      };
    }

    // Pattern 4: three sequential numbers on separate lines — first is systolic range
    const lines = normalized.split(/\n/).map((l) => l.trim());
    const nums = lines
      .map((l) => parseInt(l.match(/^(\d{2,3})$/)?.[1] ?? '', 10))
      .filter((n) => !isNaN(n));
    const sys = nums.find((n) => n >= 80 && n <= 250);
    if (sys !== undefined) {
      const sysIdx = nums.indexOf(sys);
      const dia = nums[sysIdx + 1];
      const pul = nums[sysIdx + 2];
      if (dia !== undefined && dia < sys) {
        return {
          systolic:  sys,
          diastolic: dia,
          pulse:     pul !== undefined ? pul : null,
        };
      }
    }

    return { systolic: null, diastolic: null, pulse: null };
  }

  private _num(s: string): number {
    return parseInt(s, 10);
  }
}

export const ocrEngine = new OCREngine();
