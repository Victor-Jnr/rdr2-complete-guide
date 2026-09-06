# 014 — Wire release signing from keystore.properties

- **Date:** 2026-09-06
- **Commit subject:** Wire Gradle release signing via keystore.properties
- **Stage:** Stage 1 / MVP

## Summary

Points Android `release` builds at a gitignored `android/keystore.properties` so a local keystore can sign sideload APKs. A signed 0.5.0 GitHub Release was **not** published in this change: store/key passwords were not available on disk, so no signed APK was produced.

## Changes

- `android/app/build.gradle` — load `android/keystore.properties` when present; set `signingConfigs.release` (`storeFile`, `storePassword`, `keyAlias`, `keyPassword`). If the file is missing, `signingConfig` stays null (unsigned), same as 013.
- `android/keystore.properties.example` — dummy placeholders only. Copy to `android/keystore.properties` (gitignored).
- `README.md` — signing steps and GitHub Releases download location (APKs stay out of git).
- `src/features/about/AboutPage.tsx` — Android application ID, GitHub Releases link, same-keystore note.
- `documentation/README.md` — linked 014.
- `CHANGELOG.md` — file roles and 014 section.

## Safety / permissions

- Do **not** commit `android/keystore.properties`, `*.jks`, `*.keystore`, or APKs.
- The keystore file stays outside the repo. Root `.gitignore` already ignores `keystore.properties` and `*.jks`.
- No GitHub Release was created. Do not publish the unsigned 0.5.0 APK as if it were signed.
- App ID remains frozen: `io.github.victorjnr.rdr2guide`. Keep the same keystore for updates.

## How to verify

Create `android/keystore.properties` (gitignored) with:

```properties
storeFile=C:/Users/YOU/keys/your-release.jks
storePassword=YOUR_STORE_PASSWORD
keyAlias=rdr2guide
keyPassword=YOUR_KEY_PASSWORD
```

`storeFile` must be an absolute path. Then:

```powershell
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.0.12.101-hotspot"
$env:Path = "$env:JAVA_HOME\bin;C:\Program Files\nodejs;$env:Path"
npm run android:release
```

Confirm a signed APK (not `app-release-unsigned.apk`) and:

```powershell
apksigner verify --print-certs android\app\build\outputs\apk\release\app-release.apk
```

Without `android/keystore.properties`, `assembleRelease` still writes an unsigned APK.
