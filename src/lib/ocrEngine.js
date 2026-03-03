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
    const result = await Tesseract.recognize(imageSource, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text' && onProgress) {
          onProgress(Math.round(m.progress * 100));
        }
      },
    });

    const text = result.data.text.toUpperCase();
    const reading = this.extractBPReading(text);

    if (!reading) {
      throw new Error('Could not extract a reading from this image. Please try manual entry.');
    }

    return reading;
  }

  extractBPReading(text) {
    // Pattern 1: "SYS: 120 DIA: 80 PULSE: 72" (labelled format)
    const p1 = /SYS[:\s]*(\d{2,3}).*?DIA[:\s]*(\d{2,3}).*?(?:PULSE|PUL|P)[:\s]*(\d{2,3})/i;
    let m = text.match(p1);
    if (m) return { systolic: +m[1], diastolic: +m[2], pulse: +m[3] };

    // Pattern 2: "120/80 72" or "120/80 72bpm"
    const p2 = /(\d{2,3})\s*\/\s*(\d{2,3})\s+(\d{2,3})/;
    m = text.match(p2);
    if (m) return { systolic: +m[1], diastolic: +m[2], pulse: +m[3] };

    // Pattern 3: "BP 120/80 HR 72"
    const p3 = /BP[:\s]*(\d{2,3})\s*\/\s*(\d{2,3}).*?(?:HR|HEART\s*RATE|PULSE)[:\s]*(\d{2,3})/i;
    m = text.match(p3);
    if (m) return { systolic: +m[1], diastolic: +m[2], pulse: +m[3] };

    // Pattern 4: Sequential 2-3 digit numbers (fallback)
    const nums = text.match(/\d{2,3}/g);
    if (nums && nums.length >= 2) {
      return {
        systolic:  +nums[0],
        diastolic: +nums[1],
        pulse:     nums[2] ? +nums[2] : null,
      };
    }

    return null;
  }
}

export const ocrEngine = new OCREngine();
