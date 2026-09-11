# 019 — Android search box tap focuses the field

- **Date:** 2026-09-12
- **Commit subject:** Make the search brass box itself focus the field
- **Stage:** Stage 1 / MVP

## Summary

0.5.4 painted the brass chrome on an in-flow `<input>` and used a sibling `htmlFor` caption with `width: fit-content`. On a real device, tapping the visible box still did nothing; only the words “Search” / “Search pins” focused the field. Android WebView was not hit-testing the input, so taps on the box fell through to the page instead of a label. 0.5.5 (`versionCode` 7) wraps the caption and the input in one `<label>` and keeps the painted box on the in-flow input so a tap anywhere on that chrome focuses and opens the keyboard.

## Changes

- `SearchField` is a `<label class="search-field">` around only the caption + the input (not the page `<h1>` or the “Search works fully offline.” helper). The caption remains a `fit-content` span.
- The `<input>` itself is the brass box: `type="text"` `role="searchbox"`, solid `--paper-raised` fill, 2px brass border, `height` / `min-height: 44px`, `width: 100%`, `size={1}`, `min-width: 0`, `box-sizing: border-box`, `appearance: none`, `pointer-events: auto`. No `position: absolute`. The `.search-field__control` wrapper is gone so `overflow: hidden` cannot clip the hit target.
- Map → Layers “Search pins” uses the same `SearchField`.
- Version **0.5.5** / `versionCode` **7**. Same application ID and release keystore as 0.5.4. Do not overwrite the v0.5.4 GitHub Release.

## Safety / permissions

- App ID remains frozen: `io.github.victorjnr.rdr2guide`.
- Do not commit `android/keystore.properties`, `*.jks`, or APKs. Signed sideload builds use the same keystore as 0.5.0–0.5.4.
- None of this changes broker / adapter permissions.

## How to verify

Desktop localhost is **not** a substitute for a device, but it does confirm the box is the focus target and is not a hit region over the title.

```powershell
npm run typecheck
npm run lint
npx vitest run
npm run build
```

In the browser: width **360**, inject `--safe-area-inset-top: 48px`, `--safe-area-inset-bottom: 32px`, `--safe-area-inset-left: 16px`, `--safe-area-inset-right: 16px`. On **Search**, click the **center** of the brass box, the placeholder / empty interior, and the “Search” caption — `document.activeElement` is the input. Click the page title, “Search works fully offline.”, or empty space **above** the field (outside the caption + box) — the input must not focus. `input.getBoundingClientRect()` matches the visible chrome and stays in the content column. Repeat on **Map → Layers** for “Search pins”.

```powershell
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.0.12.101-hotspot"
$env:Path = "$env:JAVA_HOME\bin;C:\Program Files\nodejs;$env:Path"
npm run android:release
```

Confirm `versionName` 0.5.5, `versionCode` 7, then `apksigner verify --print-certs`.
