# 017 — Android search fields fit the phone width

- **Date:** 2026-09-12
- **Commit subject:** Keep search fields inside the phone content column
- **Stage:** Stage 1 / MVP

## Summary

0.5.2 made Search and map-layer pin search visible, but on a real phone the brass box was wider than the padded column: the right edge clipped, and “Search works fully offline.” peeked out from behind it. The header title sat against the left edge with no safe-area gutter. 0.5.3 (`versionCode` 5) sizes those fields to the content column and insets the chrome.

## Changes

- Page gutters use longhand padding: `16px` plus `--safe-left` / `--safe-right` (not `100vw`).
- Search chrome lives on `.search-field__control`; the text input fills it with `inset: 0` and `width: auto` so `width: 100%` plus padding cannot overflow. `size={1}` and `min-width: 0` stop the placeholder / UA min-size from forcing overflow.
- The labeled search row wraps: label on its own line on phones; label + field share a row from 768px with `flex: 1 1 12rem` (not `width: 100%` beside the label).
- Header padding matches the 16px gutter plus `--safe-*`. The content pane clips horizontal overflow.
- Map layer sheet and Layers button honor `--safe-left` / `--safe-right`.
- Version **0.5.3** / `versionCode` **5**. Same application ID and release keystore as 0.5.2. Do not overwrite the v0.5.2 GitHub Release.

## Safety / permissions

- App ID remains frozen: `io.github.victorjnr.rdr2guide`.
- Do not commit `android/keystore.properties`, `*.jks`, or APKs. Signed sideload builds use the same keystore as 0.5.0–0.5.2.
- None of this changes broker / adapter permissions.

## How to verify

Desktop localhost is **not** a substitute for a device, but it does confirm the box stays in the padded column.

```powershell
npm run typecheck
npm run lint
npx vitest run
npm run build
```

In the browser: width **360**, inject `--safe-area-inset-top: 48px`, `--safe-area-inset-bottom: 32px`, `--safe-area-inset-left: 16px`, `--safe-area-inset-right: 16px`. On **Search**, the brass box has air on both sides and does not cover the offline hint. `input.getBoundingClientRect().width` must be ≤ viewport width minus the visible gutters. The header title starts after the left inset. On **Map → Layers**, “Search pins” stays inside the sheet.

```powershell
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.0.12.101-hotspot"
$env:Path = "$env:JAVA_HOME\bin;C:\Program Files\nodejs;$env:Path"
npm run android:release
```

Confirm `versionName` 0.5.3, `versionCode` 5, then `apksigner verify --print-certs`.
