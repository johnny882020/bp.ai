/**
 * DocuPipe OCR — calls the /api/ocr backend proxy.
 * The proxy handles DocuPipe API authentication server-side.
 *
 * @param {string} base64Image  - Base64-encoded image data (no data-URL prefix)
 * @param {string} mediaType    - MIME type, e.g. 'image/jpeg' or 'image/png'
 * @returns {Promise<string>}   - Extracted text (e.g. "120/80 72") or empty string
 */
export async function extractBPWithDocuPipe(base64Image, mediaType) {
  const ext = mediaType?.split('/')[1] || 'jpg';
  const resp = await fetch('/api/ocr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64: base64Image, filename: `bp_monitor.${ext}` }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err?.error || `OCR service error (${resp.status})`);
  }

  const { text } = await resp.json();
  return text ?? '';
}
