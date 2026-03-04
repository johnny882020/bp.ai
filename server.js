import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const DOCUPIPE_API_KEY = process.env.DOCUPIPE_API_KEY;

// ── Security headers ──────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(self), microphone=(), geolocation=()');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: blob:; " +
    "connect-src 'self' https://*.base44.com https://api.base44.io; " +
    "worker-src blob:;"
  );
  next();
});

app.use(express.json({ limit: '10mb' }));

// ── DocuPipe OCR proxy ────────────────────────────────────────────────────────
app.post('/api/ocr', async (req, res) => {
  if (!DOCUPIPE_API_KEY) {
    return res.status(503).json({ error: 'OCR service not configured (no API key)' });
  }

  const { base64, filename = 'bp_monitor.jpg' } = req.body;
  if (!base64) {
    return res.status(400).json({ error: 'base64 image is required' });
  }

  try {
    // 1. Upload document to DocuPipe
    const uploadResp = await fetch('https://app.docupipe.ai/document', {
      method: 'POST',
      headers: {
        'X-API-Key': DOCUPIPE_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        document: {
          file: { contents: base64, filename },
        },
      }),
    });

    if (!uploadResp.ok) {
      const err = await uploadResp.json().catch(() => ({}));
      return res.status(502).json({
        error: err?.message || `DocuPipe upload failed (${uploadResp.status})`,
      });
    }

    const { jobId } = await uploadResp.json();
    if (!jobId) {
      return res.status(502).json({ error: 'DocuPipe did not return a jobId' });
    }

    // 2. Poll for completion (max 20 attempts × 2 s = 40 s)
    for (let attempt = 0; attempt < 20; attempt++) {
      await new Promise(r => setTimeout(r, 2000));

      const jobResp = await fetch(`https://app.docupipe.ai/job/${jobId}`, {
        headers: { 'X-API-Key': DOCUPIPE_API_KEY },
      });
      const job = await jobResp.json();

      if (job.status === 'completed') {
        // Extract text — try the most common field paths in DocuPipe responses
        const text =
          job?.result?.text ||
          job?.pages?.map(p => p.text).join('\n') ||
          job?.result?.pages?.map(p => p.text).join('\n') ||
          '';
        return res.json({ text });
      }

      if (job.status === 'failed') {
        return res.status(502).json({ error: 'DocuPipe processing failed' });
      }
      // status === 'processing' | 'queued' → keep polling
    }

    return res.status(504).json({ error: 'DocuPipe processing timed out' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// ── Serve Vite production build ───────────────────────────────────────────────
app.use(express.static(join(__dirname, 'dist')));

// SPA fallback — all non-API routes serve index.html
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`BP.ai server running on port ${PORT}`);
});
