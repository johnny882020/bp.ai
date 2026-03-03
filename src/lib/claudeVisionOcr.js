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
                'This is a photo of a home blood pressure monitor display. ' +
                'Extract the blood pressure reading and pulse rate shown. ' +
                'Reply with ONLY the numbers in one of these formats:\n' +
                '  - "120/80 72"  (systolic/diastolic pulse)\n' +
                '  - "120/80"     (if no pulse is shown)\n' +
                'Do not include units, labels, or any other text. ' +
                'If you cannot clearly read the numbers, reply with exactly: UNREADABLE',
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
