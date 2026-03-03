import Tesseract from 'tesseract.js';

/**
 * Extract a blood pressure reading from an image using Tesseract OCR.
 * Supports 4 common BP monitor display formats.
 */
export class OCREngine {
  /**
   * @param {File|string} imageSource - File object or base64 data URL
   * @param {(progress: number) => void} [onProgress] - Optional 0-100 progress callback
   * @returns {Promise<{ systolic: number, diastolic: number, pulse: number|null }>}
   */
  async processImage(imageSource, onProgress) {
    // Preprocess: grayscale + contrast boost to help Tesseract read LCD displays
    const preprocessed = await this._preprocessImage(imageSource);

    const result = await Tesseract.recognize(preprocessed, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text' && onProgress) {
          onProgress(Math.round(m.progress * 100));
        }
      },
      // Restrict recognized characters to digits and common BP separators
      tessedit_char_whitelist: '0123456789/:() \n',
      // PSM 6 = uniform block of text (best for BP displays)
      tessedit_pageseg_mode: '6',
      // Override DPI to 150 — BP monitor photos are typically high-DPI
      user_defined_dpi: '150',
    });

    const text = result.data.text.toUpperCase();
    const reading = this.extractBPReading(text);

    if (!reading) {
      throw new Error('Could not extract a reading from this image. Please try manual entry.');
    }

    return reading;
  }

  /**
   * Preprocess the image for better OCR accuracy:
   * converts to grayscale and applies a 1.5× contrast boost.
   * Falls back to the original source in non-browser environments (Node / tests).
   */
  async _preprocessImage(imageSource) {
    if (typeof document === 'undefined') return imageSource; // Node / test environment

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas  = document.createElement('canvas');
        canvas.width  = img.naturalWidth  || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imageData.data;
        for (let i = 0; i < d.length; i += 4) {
          // Grayscale (luminance formula)
          const gray = Math.round(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]);
          // 1.5× contrast boost around midpoint 128
          const boosted = Math.min(255, Math.max(0, Math.round((gray - 128) * 1.5 + 128)));
          d[i] = d[i + 1] = d[i + 2] = boosted;
        }
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(imageSource); // Fallback on error
      img.src = typeof imageSource === 'string' ? imageSource : URL.createObjectURL(imageSource);
    });
  }

  /** Normalize common OCR misreads before pattern matching. */
  _normalizeOCR(raw) {
    return raw
      .replace(/(\d)[,،](\d)/g, '$1/$2')          // comma → slash (European monitors)
      .replace(/(?<=\d)[oO]|[oO](?=\d)/g, '0')   // O adjacent to digit → 0
      .replace(/(?<=\d)[IlL]|[IlL](?=\d)/g, '1') // l/I/L adjacent to digit → 1
      .replace(/\bS(\d{1,2})\b/g, '5$1')          // S + 1-2 digits → 5… (OCR artefact)
      .replace(/(\d+)\.\d+/g, '$1');              // truncate decimals: 120.5 → 120
  }

  /** Validate candidate pair; swap if inverted; return null if equal. */
  _validate(s, d, p) {
    if (s > d) return { systolic: s, diastolic: d, pulse: p ?? null };
    if (d > s) return { systolic: d, diastolic: s, pulse: p ?? null }; // swap recovery
    return null;
  }

  extractBPReading(text) {
    const t = this._normalizeOCR(text.toUpperCase());

    // Pattern 1: SYS/DIA labels — pulse OPTIONAL
    const p1 = /SYS[:\s]*(\d{2,3})[\s\S]{0,30}DIA[:\s]*(\d{2,3})(?:[\s\S]{0,30}(?:PULSE|PUL|P)[:\s]*(\d{2,3}))?/i;
    let m = t.match(p1);
    if (m) { const r = this._validate(+m[1], +m[2], m[3] ? +m[3] : null); if (r) return r; }

    // Pattern 3: BP/HR labels (checked before generic slash to capture HR pulse)
    const p3 = /BP[:\s]*(\d{2,3})\s*\/\s*(\d{2,3})(?:[\s\S]{0,30}(?:HR|HEART\s*RATE|PULSE)[:\s]*(\d{2,3}))?/i;
    m = t.match(p3);
    if (m) { const r = this._validate(+m[1], +m[2], m[3] ? +m[3] : null); if (r) return r; }

    // Pattern 2: generic slash format — pulse OPTIONAL (after P3 to avoid eating HR value)
    const p2 = /(\d{2,3})\s*\/\s*(\d{2,3})(?:\s+(\d{2,3}))?/;
    m = t.match(p2);
    if (m) { const r = this._validate(+m[1], +m[2], m[3] ? +m[3] : null); if (r) return r; }

    // Pattern 5: space-separated format "120  80  72" (≥2 spaces as delimiter)
    const p5 = /(\d{2,3})\s{2,}(\d{2,3})(?:\s{2,}(\d{2,3}))?/;
    m = t.match(p5);
    if (m) { const r = this._validate(+m[1], +m[2], m[3] ? +m[3] : null); if (r) return r; }

    // Pattern 4: smarter numeric fallback — range-guarded to avoid noise
    const tokens = [...t.matchAll(/\b(\d{2,3})\b/g)].map(x => +x[1]);
    const sysIdx = tokens.findIndex(n => n >= 90 && n <= 250);
    if (sysIdx !== -1) {
      const sys  = tokens[sysIdx];
      const rest = tokens.slice(sysIdx + 1);
      const dia  = rest.find(n => n >= 40 && n <= 140 && n < sys);
      if (dia !== undefined) {
        const pul = rest.slice(rest.indexOf(dia) + 1).find(n => n >= 40 && n <= 200);
        return { systolic: sys, diastolic: dia, pulse: pul ?? null };
      }
    }

    return null;
  }
}

export const ocrEngine = new OCREngine();
