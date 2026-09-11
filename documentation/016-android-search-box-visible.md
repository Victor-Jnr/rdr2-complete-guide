# 016 — Android search boxes actually visible

- **Date:** 2026-09-12
- **Commit subject:** Make search boxes visible on Android WebView
- **Stage:** Stage 1 / MVP

## Summary

0.5.1 (`versionCode` 3) tried to unhide Search and map-layer pin search by resetting `input[type=search]` with `-webkit-appearance: none` and pinning the field in a flex pane. On a real Android WebView that reset still paints a zero-size or transparent control, so the box stays missing. 0.5.2 (`versionCode` 4) stops using native search inputs, draws a labeled 44px text field with contrast, and uses Capacitor’s `--safe-area-inset-*` fallback the way SystemBars documents it.

## Changes

- Replace Search tab, Compendium filter, and map-layer pin search with a shared `SearchField`: `type="text"`, visible “Search” / “Search pins” label, `role="searchbox"`.
- Style the field with a 2px brass border, `--paper-raised` fill, `--ink` text, placeholder `--ink-muted`, and **min-height 44px**. Do not use `appearance: none` or hide `::-webkit-search-*` decorations.
- Keep map pin search in a non-scrolling panel toolbar above the category list; give the sheet an opaque raised background so it is not lost under Leaflet.
- Prefer Capacitor-injected `--safe-area-inset-*` over `max(..., env())`, which can pick a wrong WebView `env()` value.
- Version **0.5.2** / `versionCode` **4**. Same application ID and release keystore as 0.5.1. Do not overwrite the v0.5.1 GitHub Release.

## Safety / permissions

- App ID remains frozen: `io.github.victorjnr.rdr2guide`.
- Do not commit `android/keystore.properties`, `*.jks`, or APKs. Signed sideload builds use the same keystore as 0.5.0 / 0.5.1.
- None of this changes broker / adapter permissions.

## How to verify

Desktop localhost is **not** proof of the Android WebView bug, but it does confirm the field is a labeled 44px text box in the content flow.

```powershell
npm run typecheck
npm run lint
npx vitest run
npm run build
```

On a 360×800 viewport with `--safe-area-inset-top: 48px` and `--safe-area-inset-bottom: 32px`: Search shows a “Search” label and a contrasting box below the header; Map → Layers shows “Search pins” in the sheet header. Dragging the page must not move the header or bottom nav.

Install the **0.5.2** APK on a device (uninstall 0.5.1 first if the installer asks). Open Search and Map → Layers and confirm both boxes are visible and usable.

```powershell
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.0.12.101-hotspot"
$env:Path = "$env:JAVA_HOME\bin;C:\Program Files\nodejs;$env:Path"
npm run android:release
```

Confirm `versionName` 0.5.2, `versionCode` 4, then `apksigner verify --print-certs`.
