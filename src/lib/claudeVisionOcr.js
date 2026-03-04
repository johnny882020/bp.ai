/**
 * Claude Vision OCR — uses the Anthropic Messages API directly from the browser.
 * Requires a user-provided Anthropic API key stored in localStorage under 'bp_anthropic_key'.
 *
 * The `anthropic-dangerous-allow-browser: true` header is required for browser-to-API calls.
 * See: https://docs.anthropic.com/en/api/getting-started
 */

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL             = 'claude-haiku-4-5-20251001';

/**
 * Extract a BP reading from a base64-encoded image using Claude Vision.
 *
 * @param {string} base64Image  - Base64-encoded image data (no data-URL prefix)
 * @param {string} mediaType    - MIME type, e.g. 'image/jpeg' or 'image/png'
 * @param {string} apiKey       - Anthropic API key (sk-ant-...)
 * @returns {Promise<string>}   - Raw text like "120/80 72" or "UNREADABLE"
 */
export async function extractBPWithClaude(base64Image, mediaType, apiKey) {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-allow-browser': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64Image },
            },
            {
              type: 'text',
              text:
                'You are reading a home blood pressure monitor display.\n\n' +
                'Home blood pressure monitors show THREE values:\n' +
                '• SYSTOLIC — the LARGER number, shown on top (typically 90–200)\n' +
                '• DIASTOLIC — the SMALLER number, shown below systolic (typically 50–120)\n' +
                '• PULSE / HEART RATE — shown separately, often smaller font (typically 40–120)\n\n' +
                'IGNORE completely: clock time (e.g. 10:30), date (e.g. 03/04 or 2026), ' +
                'memory indicator (M1 M2 or a lone digit 1 or 2), user number, battery icon, ' +
                'mmHg label, or any symbol that is not a blood pressure value.\n\n' +
                'Reply with ONLY the numbers in this exact format — nothing else:\n' +
                '  120/80 72   (systolic slash diastolic space pulse)\n' +
                '  120/80      (if pulse is not visible)\n\n' +
                'If the display is too blurry, dark, glared, or otherwise unreadable, ' +
                'reply with exactly one word: UNREADABLE',
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Anthropic API error (${response.status})`);
  }

  const data = await response.json();
  return (data.content?.[0]?.text ?? '').trim();
}
