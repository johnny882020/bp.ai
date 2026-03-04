# BP.ai — Blood Pressure Monitor

A personal blood pressure tracking web app with AI-powered photo scanning, medication tracking, and AHA-compliant classification.

**Live:** https://bp-ai.onrender.com

---

## Features

- **Track readings** — Manual entry or camera scan of your BP monitor display
- **AI scanning** — DocuPipe OCR for accurate photo extraction; Tesseract.js fallback built-in
- **AHA classification** — Color-coded categories (Normal → Hypertensive Crisis)
- **Medications** — Track current and past BP medications (stored locally per device)
- **Charts** — Visualize trends over time with recharts
- **CSV export** — Download all readings for your doctor
- **Authentication** — Secure per-user data via Base44

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Data fetching | @tanstack/react-query v5 |
| Backend / Auth | Base44 (BaaS) |
| Server | Express 4 (Node.js) |
| OCR primary | DocuPipe AI (server-side proxy) |
| OCR fallback | Tesseract.js v5 (WebAssembly, in-browser) |
| Charts | recharts |
| Deployment | Render (Node.js web service) |

---

## Quick Start

```bash
npm install
npm run dev        # http://localhost:5173 (frontend dev server)
npm test           # run all tests (118 passing)
npm run coverage   # coverage report
npm run build      # production build → dist/
node server.js     # serve production build on :3000
```

---

## Project Structure

```
bp-ai/
├── server.js                    # Express backend — /api/ocr proxy + static serving
├── render.yaml                  # Render deployment config (Node.js web service)
├── pages/                       # Top-level route pages
│   ├── Dashboard.jsx            # Main dashboard (readings, chart, stats)
│   ├── Readings.jsx             # Full readings list
│   ├── Charts.jsx               # Trend charts
│   ├── Medications.jsx          # Medication tracker
│   └── Settings.jsx             # Export, AHA reference, account
├── src/
│   ├── api/
│   │   └── base44Client.js      # Base44 SDK client + auth export
│   ├── components/bp/
│   │   ├── AddReadingForm.jsx   # Manual entry dialog
│   │   ├── BPChart.jsx          # recharts line chart
│   │   ├── CameraCapture.jsx    # Photo OCR (DocuPipe → Tesseract fallback)
│   │   ├── ExportData.jsx       # CSV download
│   │   ├── MedicationsPanel.jsx # Medication CRUD
│   │   ├── ReadingsList.jsx     # Paginated readings table
│   │   └── StatsCards.jsx       # Average / latest stats
│   ├── components/
│   │   ├── HeartLogo.jsx        # SVG brand logo
│   │   └── ui/                  # shadcn/ui primitives
│   ├── hooks/
│   │   ├── useAuth.js           # Auth state (login/register/OTP/logout)
│   │   ├── useBPReadings.js     # BP readings CRUD + React Query
│   │   └── useMedications.js    # Medications CRUD (localStorage)
│   ├── lib/
│   │   ├── bpCategories.js      # AHA classification + validation
│   │   ├── docupipeOcr.js       # DocuPipe client (calls /api/ocr)
│   │   └── ocrEngine.js         # Tesseract OCR + preprocessing + regex patterns
│   ├── pages/
│   │   └── LoginPage.jsx        # Login / Register / OTP verification
│   └── __tests__/
│       ├── bpCategories.test.js # 34 tests
│       ├── ocrEngine.test.js    # 24 tests
│       ├── sanity.test.js       # 5 sanity tests (ST-1..ST-5)
│       └── vv.test.js           # 55 V&V tests (V&V-1..V&V-10)
├── mobile/                      # Expo React Native app (see mobile/README.md)
└── README.md
```

---

## Camera Scanning

The scan flow has three steps: **select photo → extract → confirm before saving**.

After extraction the app shows the parsed systolic / diastolic / pulse values prominently so you can verify them before they enter your history. Tap **Retake** if anything looks wrong.

### DocuPipe OCR (primary — requires operator setup)

DocuPipe runs server-side via the `/api/ocr` Express endpoint.

To activate it, set the `DOCUPIPE_API_KEY` environment variable in your Render dashboard:

> Render Dashboard → bp-ai → Environment → Add `DOCUPIPE_API_KEY`

Get a free API key at https://docupipe.readme.io (300 free credits on signup, no credit card required).

### Tesseract.js (fallback — always available)

If DocuPipe is not configured or returns an error, the app automatically falls back to Tesseract.js running entirely in the browser via WebAssembly. No API key or network call required.

**Tips for best scan results:**
- Hold the phone parallel to the monitor display
- Ensure the room is well-lit — avoid glare on the LCD screen
- Make sure all digits are in frame and in focus

---

## Authentication

BP.ai uses Base44 for user authentication. On first visit:
1. Click **Create Account** and enter your email + password
2. Check your email for a 6-digit verification code
3. Enter the code in the verification screen
4. Sign in — your readings are private and per-user

---

## Tests

| Suite | Tests | Coverage |
|-------|-------|----------|
| `bpCategories.test.js` | 34 | AHA classification, validateReading |
| `ocrEngine.test.js` | 24 | All OCR patterns, normalization, edge cases |
| `sanity.test.js` | 5 | End-to-end smoke (ST-1..ST-5) |
| `vv.test.js` | 55 | V&V-1..V&V-10 formal validation |
| **Total** | **118** | |

---

## Deployment

Runs as a Node.js web service on Render. Automatic deploys on push to `master`.

The Express server (`server.js`) serves the Vite production build from `dist/` and exposes the `/api/ocr` DocuPipe proxy endpoint.

**Security headers** (set by Express middleware): CSP, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy, Permissions-Policy (camera self only).

**Environment variables:**

| Variable | Required | Purpose |
|----------|----------|---------|
| `DOCUPIPE_API_KEY` | Optional | Enables DocuPipe OCR; falls back to Tesseract if absent |
| `PORT` | Auto-set by Render | Server listen port |

---

## Medical Disclaimer

BP.ai is for informational and tracking purposes only. It is **not** a medical device and should not be used for diagnosis or treatment. Always consult a qualified healthcare professional for medical advice.
