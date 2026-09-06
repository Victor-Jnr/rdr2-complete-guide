# 013 — Unsigned Android 0.5.0 release

- **Date:** 2026-09-06
- **Commit subject:** Ship unsigned Android 0.5.0 APK
- **Stage:** Stage 1 / MVP

## Summary

Ships product version **0.5.0** as an **unsigned** Android release APK (`versionName "0.5.0"`, `versionCode 2`, applicationId `io.github.victorjnr.rdr2guide`). There is no project keystore and the Android Debug key is **not** used for this build. It is not Play-signed.

## Changes

- `package.json` and About → Version **0.5.0**.
- `android/app/build.gradle` — `versionName "0.5.0"`, `versionCode` 1 → **2** (was still `"1.0"` / `1`). Release `signingConfig` is **null** so `assembleRelease` writes an unsigned APK.
- Gradle output is typically `android/app/build/outputs/apk/release/app-release-unsigned.apk`. A copy for sideload lives at `release/rdr2-complete-guide-0.5.0-unsigned.apk` (untracked; `*.apk` is gitignored). Do not commit the APK.

## Safety / permissions

- App ID remains frozen: `io.github.victorjnr.rdr2guide`.
- No keystore, no `signingConfigs.release`, no debug-key “release” signing.
- **Sideload:** most stock Android devices refuse unsigned APKs. Installing still requires the user to sign the APK (`apksigner`) or enable a setting that allows unsigned packages (uncommon on typical phones).

## How to verify

Set JDK 21 before Gradle (AGP needs 17+; default `java` on PATH may be 8):

```powershell
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.0.12.101-hotspot"
$env:Path = "$env:JAVA_HOME\bin;C:\Program Files\nodejs;$env:Path"
npm run typecheck
npm run lint
npm run android:release
```

Confirm the APK exists and is unsigned:

```powershell
jarsigner -verify android\app\build\outputs\apk\release\app-release-unsigned.apk
```

Expect “no manifest” / not signed. Optional: `$env:ANDROID_HOME\build-tools\<ver>\apksigner.bat verify` should report no signature.

To sign later (keystore kept **outside** git):

```powershell
zipalign -v -p 4 app-release-unsigned.apk rdr2-complete-guide-0.5.0-aligned.apk
apksigner sign --ks YOUR_KEYSTORE.jks --out rdr2-complete-guide-0.5.0-signed.apk rdr2-complete-guide-0.5.0-aligned.apk
apksigner verify --print-certs rdr2-complete-guide-0.5.0-signed.apk
```
