# BP.ai Mobile — Build & App Store Submission Guide

## Required Assets (create before building)

Place these files in `mobile/assets/`:

| File | Size | Description |
|------|------|-------------|
| `icon.png` | 1024×1024 | Black background, white heart with red pulse line |
| `splash.png` | 1284×2778 | White background, centered BP.ai logo |
| `adaptive-icon.png` | 1024×1024 | Same design as icon.png (used by Android) |

Design guidelines: Black (#000000) background, white heart silhouette, red (#dc2626) ECG pulse line through center.

---

## EAS Build Setup

```bash
# 1. Install EAS CLI globally
npm install -g eas-cli

# 2. Login to your Expo account (create one at expo.dev if needed)
eas login

# 3. From the mobile/ directory — link the project to your Expo account
cd mobile
eas build:configure

# 4. Install dependencies
npm install
```

---

## Building for App Stores

### Development build (for testing on a device)
```bash
eas build --platform all --profile development
```

### Preview build (internal testing APK for Android)
```bash
eas build --platform android --profile preview
```

### Production build (for App Store / Play Store submission)
```bash
eas build --platform all --profile production
```

---

## iOS Submission (Apple App Store)

**Requirements:**
- Apple Developer Program membership ($99/year) at developer.apple.com
- App Store Connect app record created at appstoreconnect.apple.com

**Steps:**
1. Create app in App Store Connect — note the App ID (ascAppId)
2. Fill in `eas.json` → `submit.production.ios.ascAppId` and `appleTeamId`
3. Run production build: `eas build --platform ios --profile production`
4. Submit: `eas submit --platform ios --latest`

---

## Android Submission (Google Play Store)

**Requirements:**
- Google Play Developer account ($25 one-time) at play.google.com/console
- Service account key JSON for automated submission

**Steps:**
1. In Google Play Console → Setup → API access → create Service Account
2. Download JSON key → save as `mobile/google-play-key.json`
3. Grant "Release manager" role to the service account in Play Console
4. Run production build: `eas build --platform android --profile production`
5. Submit: `eas submit --platform android --latest`

---

## Privacy Policy

A privacy policy URL is required by both stores. Create a page at your domain (e.g., `https://bp-ai.onrender.com/privacy`) or use a free generator like App Privacy Policy Generator.

Key points to include:
- What health data is collected (BP readings, medications)
- Where it is stored (Base44 cloud, per-user, encrypted)
- Data deletion policy
- No data sold to third parties

---

## Checklist Before Submission

- [ ] Assets created and placed in `mobile/assets/`
- [ ] `eas.json` filled with correct `ascAppId` and `appleTeamId`
- [ ] `google-play-key.json` placed in `mobile/` (gitignored)
- [ ] Privacy policy URL available
- [ ] App Store Connect app record created (iOS)
- [ ] Google Play app created (Android)
- [ ] Production build completed successfully
- [ ] App tested on physical device
