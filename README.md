# RDR2 Complete Guide

An **unofficial**, Android-first, offline companion for *Red Dead Redemption 2*. v1 tracks the story **journey**, **missables**, **treasure maps**, and **personal progress**. It is not a walkthrough dump of every collectible.

## Disclaimer

This is a fan-made project. It is **not affiliated with, endorsed by, or associated with** Rockstar Games, Take-Two Interactive, Fandom, or the Red Dead Wiki.

*Red Dead Redemption*, *Red Dead Redemption 2*, and related names, characters, locations, artwork, and other properties belong to their respective rights holders.

## License vs third-party material

- **Application source code** and original project assets (UI, icons we drew, TypeScript, JSON structure we authored) are licensed under the [MIT License](LICENSE).
- **Rockstar / Take-Two** material (including in-game map art) is **not** covered by MIT.
- **Red Dead Wiki text** is referenced during research; Wiki page text is typically CC-BY-SA on Fandom. That license **does not** cover the in-game map image, which has **no license tag** on the file page.
- Rockstar’s published comments about fan projects are **not a license**.

Use this companion for personal, non-commercial play. Replace the map tiles if you cannot accept those terms.

## What v1 includes

- Story mission list for all eight chapters/epilogues
- Full checklist depth (objectives, Gold Medal, missables, original summaries) for **Chapter 1–2**
- Title/order skeleton for later chapters (researched, not fully annotated)
- Seven treasure-map chains from the Wiki
- Offline Leaflet map (`CRS.Simple`, normalized 0–1 coordinates)
- MiniSearch, Dexie checklists, export/import, Campfire and Parchment themes
- Web **PWA** (service worker on web builds only) and **Capacitor 8** Android app

## Roadmap (schemas now, data later)

Collectibles, challenges, the compendium, and official **100% Total Completion** rows are typed and stored as empty-but-valid JSON. The Progress tab shows a placeholder until that research is filled in.

## Requirements

| Tool | Version | Notes |
| --- | --- | --- |
| Node.js | **22+** (see `.nvmrc`) | Keep packages in local `node_modules`. Do not install project deps globally. |
| npm | Comes with Node | `npm ci` / `npm install` in the repo root |
| JDK | **21** | Android builds only |
| Android SDK | Platform **36**, build-tools | `ANDROID_HOME` / `ANDROID_SDK_ROOT` |
| Python | Not required | If you add helper scripts, use a local `.venv` (gitignored) |

This stack is Node/TypeScript. There is no application Python environment. A `.venv` folder is ignored so optional helper tools stay isolated if you create one.

## Setup

```bash
npm ci
npm run validate:data
npm test
npm run dev
```

Web production build (registers a service worker):

```bash
npm run build
npm run preview
```

Native-resolution map tiles (downloads the Wiki JPG into `scripts/.cache/`, gitignored, then writes WebP tiles):

```bash
npm run prepare:map
```

Android debug APK (no service worker; tiles bundled):

```bash
npm run android:debug
```

The Android application ID is frozen as **`io.github.victorjnr.rdr2guide`**. Changing it later installs as a different app.

Release signing: create a keystore **outside git**, then a local `keystore.properties` (gitignored). Do not commit `.jks` / `.keystore` files.

## PWA vs Android

- **Web:** `vite-plugin-pwa` precaches the app shell, icons, and map zoom **0–3**. Zoom **4–5** use a CacheFirst runtime cache. Settings → “Download full-resolution map” fetches those tiles for offline use.
- **Android:** `vite build --mode android` omits the service worker. Capacitor loads `dist/`. System Bars insets are applied as CSS `env()` / `--safe-area-inset-*`. Hardware back closes dialogs, then history, then exits.

## Data and research status

Guide content is static JSON under `src/data/`. User checklists live in IndexedDB (`rdr2-complete-guide`, Dexie schema v1) and are **never** mixed into content files.

Each record carries `research.verificationStatus`: `unresearched` | `researched` | `cross-checked` | `verified` | `needs-review`, plus `sourceIds`. `scripts/validate-data.ts` (also `pretest`) checks IDs, refs, coordinates, checklist uniqueness, and unused sources.

## Documentation

Numbered change documents live in [`documentation/`](documentation/README.md). Latest:

- [004 — Native-resolution world map tiles](documentation/004-native-map-tiles.md)
- [003 — Treasure chain tests](documentation/003-treasure-chain-tests.md)
- [002 — Journey checklists and Chapter 1–2 data tests](documentation/002-journey-checklist-tests.md)
- [001 — Stage 1 app foundation](documentation/001-stage-1-app-foundation.md)

See also [CHANGELOG.md](CHANGELOG.md).
