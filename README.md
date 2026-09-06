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

World map tiles are generated from a source image. **Settings → Download full-resolution map** only caches existing tiles in the browser; it does not write a new image into `public/assets/maps/`.

Place your own map (JPG, PNG, or WebP) at:

```text
map-source/world-map.jpg
```

Then regenerate tiles (this also downloads the Wiki map into `scripts/.cache/` if that folder is empty and you did not provide a file):

```bash
npm run prepare:map
```

Coordinates stay normalized 0–1 against the source image, so a replacement should be the same crop of the world map. A larger file can add extra zoom levels (up to 16384px). Do not commit the source image.

Android debug APK (no service worker; tiles bundled):

```bash
npm run android:debug
```

The Android application ID is frozen as **`io.github.victorjnr.rdr2guide`**. Changing it later installs as a different app.

**0.5.0 sideload APKs**, when signed, are published as [GitHub Releases](https://github.com/Victor-Jnr/rdr2-complete-guide/releases) (not committed in git). See Release signing below.

## PWA vs Android

- **Web:** `vite-plugin-pwa` precaches the app shell, icons, and map zoom **0–3**. Higher zooms use a CacheFirst runtime cache. Settings → “Download full-resolution map” only caches those tiles for offline use; it does not change the image.
- **Android:** `vite build --mode android` omits the service worker. Capacitor loads `dist/`. System Bars insets are applied as CSS `env()` / `--safe-area-inset-*`. Hardware back closes dialogs, then history, then exits.

## Data and research status

Guide content is static JSON under `src/data/`. User checklists live in IndexedDB (`rdr2-complete-guide`, Dexie schema v1) and are **never** mixed into content files.

Each record carries `research.verificationStatus`: `unresearched` | `researched` | `cross-checked` | `verified` | `needs-review`, plus `sourceIds`. `scripts/validate-data.ts` (also `pretest`) checks IDs, refs, coordinates, checklist uniqueness, and unused sources.

## Release signing

`android/app/build.gradle` reads a **gitignored** `android/keystore.properties` (see `android/keystore.properties.example`). If that file exists, `npm run android:release` produces a **signed** release APK. If it is missing, the release build stays unsigned (`signingConfig` null). The Android Debug key is never used for release.

Do not commit keystores or `android/keystore.properties`. Keep the `.jks` **outside** this repo.

Create `android/keystore.properties` locally with these keys (no extras required):

```properties
storeFile=C:/Users/YOU/keys/your-release.jks
storePassword=YOUR_STORE_PASSWORD
keyAlias=rdr2guide
keyPassword=YOUR_KEY_PASSWORD
```

`storeFile` must be an **absolute** path. `keyAlias` is whatever you chose when creating the keystore (the suggested alias was `rdr2guide`). Then:

```powershell
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.0.12.101-hotspot"
$env:Path = "$env:JAVA_HOME\bin;C:\Program Files\nodejs;$env:Path"
npm run android:release
```

Signed sideload APKs are attached to [GitHub Releases](https://github.com/Victor-Jnr/rdr2-complete-guide/releases), not committed in git. This is **not** a Play Store listing. Keep the same keystore for updates.

The application ID **`io.github.victorjnr.rdr2guide`** is frozen. Changing it installs a second app and will not update existing users.

## Documentation

Numbered change documents live in [`documentation/`](documentation/README.md). Latest:

- [014 — Wire release signing from keystore.properties](documentation/014-wire-release-signing.md)
- [013 — Unsigned Android 0.5.0 release](documentation/013-unsigned-android-050-release.md)
- [012 — Themed scrollbars](documentation/012-themed-scrollbars.md)
- [011 — Map layer panel stacking](documentation/011-map-layer-panel-stacking.md)
- [010 — Map pin calibration fix](documentation/010-map-pin-calibration-fix.md)
- [009 — Compendium with general locations](documentation/009-compendium-general-locations.md)
- [008 — Public-domain map pins and layered map](documentation/008-public-domain-map-pins.md)
- [007 — Wiki dataset fill and map overview zoom](documentation/007-wiki-data-and-map-zoom.md)
- [006 — Android shell, PWA verify, and v1 close-out](documentation/006-android-and-verification.md)
- [005 — Search and progress tests](documentation/005-search-progress-tests.md)
- [004 — Native-resolution world map tiles](documentation/004-native-map-tiles.md)
- [003 — Treasure chain tests](documentation/003-treasure-chain-tests.md)
- [002 — Journey checklists and Chapter 1–2 data tests](documentation/002-journey-checklist-tests.md)
- [001 — Stage 1 app foundation](documentation/001-stage-1-app-foundation.md)

See also [CHANGELOG.md](CHANGELOG.md).

## Sources and Attribution

- **Red Dead Wiki** — mission, collectible, challenge, and 100% reference pages used during research. Individual entries link to their source articles where practical.
- **[jeanropke/RDOMap](https://github.com/jeanropke/RDOMap)** — public-domain (Unlicense) story-mode collectible, place, shop, habitat, and herb coordinates at commit `922daf072c3ea027c5d5ed097173ce66d70d65b6`. Those coordinates derive from Rockstar game data in the same way the in-game map image does. They are **not** copied from rdr2map.com (Map Genie, commercial, no license).
- **Rockstar Games / Take-Two Interactive** — in-game map artwork stored locally for offline use; not covered by this project's MIT license. See `public/assets/maps/PROVENANCE.md`.
