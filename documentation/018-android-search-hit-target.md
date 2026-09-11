# 018 — Android search tap target matches the brass box

- **Date:** 2026-09-12
- **Commit subject:** Align search tap targets with the visible brass box
- **Stage:** Stage 1 / MVP

## Summary

0.5.3 kept Search and map-layer pin search inside the phone column by absolutely positioning the `<input>` (`inset: 0`) inside a painted `.search-field__control`. On a real device, tapping the visible brass box did not focus the field; tapping the area above it did. 0.5.4 (`versionCode` 6) paints the chrome on an in-flow input so the hit rectangle matches the box.

## Changes

- The search input is a normal in-flow control: `box-sizing: border-box`, `width` / `max-width: 100%`, `min-width: 0`, `height` / `min-height: 44px` on the input itself. No `position: absolute`.
- Brass border and fill live on `.search-field__input`. `.search-field__control` only constrains and clips width so padding cannot overflow the column. `size={1}` is unchanged.
- The visible label uses `htmlFor` and `width: fit-content` in a column stack on phones, so empty space above/beside the box is not a second hit region.
- Map → Layers “Search pins” uses the same `SearchField`, so it gets the same tap target.
- Version **0.5.4** / `versionCode` **6**. Same application ID and release keystore as 0.5.3. Do not overwrite the v0.5.3 GitHub Release.

## Safety / permissions

- App ID remains frozen: `io.github.victorjnr.rdr2guide`.
- Do not commit `android/keystore.properties`, `*.jks`, or APKs. Signed sideload builds use the same keystore as 0.5.0–0.5.3.
- None of this changes broker / adapter permissions.

## How to verify

Desktop localhost is **not** a substitute for a device, but it does confirm the input rectangle matches the painted box.

```powershell
npm run typecheck
npm run lint
npx vitest run
npm run build
```

In the browser: width **360**, inject `--safe-area-inset-top: 48px`, `--safe-area-inset-bottom: 32px`, `--safe-area-inset-left: 16px`, `--safe-area-inset-right: 16px`. On **Search**, click the **center** of the brass box — `document.activeElement` is the input. Click the page title or the empty space above the box — the input must not focus. `input.getBoundingClientRect()` matches the visible control and its width is ≤ the content column. Repeat on **Map → Layers** for “Search pins”.

```powershell
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.0.12.101-hotspot"
$env:Path = "$env:JAVA_HOME\bin;C:\Program Files\nodejs;$env:Path"
npm run android:release
```

Confirm `versionName` 0.5.4, `versionCode` 6, then `apksigner verify --print-certs`.
