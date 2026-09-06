# 006 — Android shell, PWA verify, and v1 close-out

- **Date:** 2026-09-06
- **Commit subject:** Add Capacitor Android app and v1 verification
- **Stage:** Stage 1 / MVP

## Summary

Adds the Capacitor 8 Android project (`io.github.victorjnr.rdr2guide`), Campfire-themed launcher/splash assets, SDK 36 compile/target, hardware back-button handling, and CSS system-bar insets. Web production build registers a PWA service worker; Android builds omit it and bundle map tiles. `assembleDebug` produces a sideloadable APK. Release signing stays local.

## Changes

- `npx cap add android` with frozen application ID
- `scripts/android-assets.mjs` writes mipmap icons, splash PNGs, and gitignored `android/local.properties`
- `android/app/src/main/res/values/colors.xml` — Campfire primary/accent
- `android/app/src/main/AndroidManifest.xml` — disable cleartext traffic
- `src/platform/pwaRegisterStub.ts` — no-op `virtual:pwa-register` for Android Vite builds
- README — Android / signing / PWA vs native notes

## Safety / permissions

- App ID **must not change**: `io.github.victorjnr.rdr2guide`
- `android/local.properties`, `*.keystore`, `*.jks`, `keystore.properties` are gitignored
- INTERNET is declared for optional source links via `@capacitor/browser`; checklists work offline
- CI does **not** build the APK

## How to verify

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run android:debug
```

Debug APK: `android/app/build/outputs/apk/debug/app-debug.apk` (gitignored).

Release: create a keystore outside the repo, write `keystore.properties` locally, then `npm run android:release`.
