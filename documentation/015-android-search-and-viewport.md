# 015 — Android search fields and viewport fit

- **Date:** 2026-09-12
- **Commit subject:** Fix Android search fields and lock the app viewport
- **Stage:** Stage 1 / MVP

## Summary

Fixes three Capacitor Android WebView layout bugs in **0.5.1** (`versionCode` 3): the Search tab box and map-layer pin search were missing or off-screen, and the document was slightly oversized so the app chrome could be panned. Leaflet map pan is unchanged. Sideload APKs stay on GitHub Releases; the application ID remains frozen.

## Changes

- Lock `html` / `body` / `#root` to the WebView (`position: fixed`, `overflow: hidden`) so the document cannot rubber-band or pan.
- Make the app shell a column flex: header, scrollable content, bottom nav. Safe-area padding lives on the header and nav only (not doubled on `.page`).
- Map page fills the content pane (`height: 100%`) instead of `100dvh` minus guessed chrome, which overflowed status/nav bar insets.
- Reset `input[type=search]` appearance and pin the layer-panel search outside the scrolling category list so Android WebView cannot collapse or clip those fields.
- `adjustResize` + `interactive-widget=resizes-content` so the keyboard does not cover the focused field.
- Disable WebView overscroll in `MainActivity` and `activity_main.xml`.
- Version **0.5.1** / `versionCode` **3**.

## Safety / permissions

- App ID remains frozen: `io.github.victorjnr.rdr2guide`.
- Do not commit `android/keystore.properties`, `*.jks`, or APKs. Signed sideload builds use the same keystore as 0.5.0.
- None of this changes broker / adapter permissions.

## How to verify

Desktop localhost is **not** proof. Use a 360×800 viewport and non-zero safe-area insets (Capacitor `--safe-area-inset-*` and/or `env(safe-area-inset-*)`):

```powershell
npm run typecheck
npm run lint
npx vitest run
npm run build
```

In the browser (or WebView): set width 360, inject `--safe-area-inset-top: 48px` and `--safe-area-inset-bottom: 32px`. On **Search**, the search box must be fully visible below the header. On **Map → Layers**, the pin search box must stay at the top of the panel. Dragging the page must not move the header or bottom nav; the Leaflet map may still pan.

```powershell
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.0.12.101-hotspot"
$env:Path = "$env:JAVA_HOME\bin;C:\Program Files\nodejs;$env:Path"
npm run android:release
```

Confirm `versionName` 0.5.1 and a signed APK, then `apksigner verify --print-certs`.
