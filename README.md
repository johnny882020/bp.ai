# BP.ai — Blood Pressure Monitor

A personal blood pressure tracking web app with AI-powered photo scanning, medication tracking, and AHA-compliant classification.

**Live:** https://bp-ai.onrender.com

---

## Features

- **Track readings** — Manual entry or camera scan of your BP monitor display
- **AI scanning** — Claude Vision API for highly accurate photo OCR (optional, uses your own API key)
- **Tesseract fallback** — Built-in OCR for scanning without an API key
- **AHA classification** — Color-coded categories (Normal → Hypertensive Crisis)
- **Medications** — Track current and past BP medications
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
| OCR primary | Claude Vision API (Anthropic) |
| OCR fallback | Tesseract.js v5 (WebAssembly) |
| Charts | recharts |
| Deployment | Render (static site) |

---

## Quick Start

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # run all tests (118 passing)
npm run coverage   # coverage report
npm run build      # production build
```

---

## Project Structure

```
bp-ai/
├── pages/               # Top-level route pages
│   ├── Dashboard.jsx    # Main dashboard (readings, chart, stats)
│   ├── Readings.jsx     # Full readings list
│   ├── Charts.jsx       # Trend charts
│   ├── Medications.jsx  # Medication tracker
│   └── Settings.jsx     # Export, API key, AHA reference
├── src/
│   ├── api/
│   │   └── base44Client.js      # Base44 SDK client + auth export
│   ├── components/bp/
│   │   ├── AddReadingForm.jsx   # Manual entry dialog
│   │   ├── BPChart.jsx          # recharts line chart
│   │   ├── CameraCapture.jsx    # Photo OCR (Claude Vision / Tesseract)
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
│   │   └── useMedications.js    # Medications CRUD + React Query
│   ├── lib/
│   │   ├── bpCategories.js      # AHA classification + validation
│   │   ├── claudeVisionOcr.js   # Claude Vision API OCR
│   │   └── ocrEngine.js         # Tesseract OCR + preprocessing
│   ├── pages/
│   │   └── LoginPage.jsx        # Login / Register / OTP verification
│   └── __tests__/
│       ├── bpCategories.test.js # 34 tests
│       ├── ocrEngine.test.js    # 24 tests
│       ├── sanity.test.js       # 5 sanity tests (ST-1..ST-5)
│       └── vv.test.js           # 55 V&V tests (V&V-1..V&V-10)
├── mobile/                      # Expo React Native app (see mobile/README.md)
├── render.yaml                  # Render deployment config + security headers
└── README.md
```

---

## Camera Scanning

### With Anthropic API key (recommended)
1. Go to **Settings → Enhanced Scanning**
2. Paste your API key from [console.anthropic.com](https://console.anthropic.com)
3. Tap **Scan Monitor** — Claude AI reads the photo directly

### Without API key (built-in)
Tesseract.js OCR runs in-browser. Works for most clear photos; struggles with glare/low contrast.

**Tips for best results:**
- Hold phone parallel to the monitor display
- Ensure the room is well-lit
- Avoid glare on the LCD screen
- Make sure all digits are in frame and in focus

---

## Authentication

BP.ai uses Base44 for user authentication. On first visit:
1. Click **Create Account** and enter email + password
2. Check your email for a 6-digit verification code
3. Enter the code in the verification screen
4. Sign in — your data is private and per-user

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

Deployed as a static site on Render. Automatic deploys on push to `master`.

**Security headers:** CSP, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy, Permissions-Policy (camera self only) — all configured in `render.yaml`.

---

## Medical Disclaimer

BP.ai is for informational and tracking purposes only. It is **not** a medical device and should not be used for diagnosis or treatment. Always consult a qualified healthcare professional for medical advice.
