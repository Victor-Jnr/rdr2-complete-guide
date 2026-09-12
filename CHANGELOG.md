# Changelog

## File roles

- `.github/workflows/ci.yml` — Node 22 CI: validate, typecheck, lint, test, web build
- `.nvmrc` — pins Node 22 for local/nvm use
- `.prettierignore` — skip generated Android, dist, and map tiles
- `capacitor.config.ts` — Capacitor 8 app id/name, `webDir: dist`, System Bars CSS insets
- `eslint.config.js` — ESLint 9 flat config for TypeScript + React
- `index.html` — PWA-capable document shell, viewport-fit, and theme boot script
- `package.json` / `package-lock.json` — local npm scripts and locked dependencies
- `prettier.config.js` — formatting defaults
- `tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json` — strict TS project references
- `vite.config.ts` — React plugin, PWA on web, no SW on `android` mode
- `vitest.config.ts` — jsdom tests with `@` alias
- `scripts/validate-data.ts` — ID, ref, coordinate, source-registry, and list-dataset checks
- `scripts/research/enrich-from-wiki.mjs` — mission Wiki enricher (cached wikitext)
- `scripts/research/fill-lists.mjs` — challenge / collectible list pass
- `scripts/research/finalize-data.mjs` — structured list cleanup
- `scripts/research/fill-remaining.mjs` — remaining Wiki lists (cards, POIs, 100%, compendium)
- `scripts/research/fill-compendium-locations.mjs` — Wiki general locations + species icon map
- `src/services/mapCoords.ts` — 0–1 ↔ Leaflet CRS.Simple scaled to the tile pyramid
- `src/components/GameMap.tsx` — map starts at zoom 0; users zoom in for detail
- `scripts/prepare-map.ts` — Wiki map download + WebP tile pyramid
- `scripts/make-icons.mjs` — PNG app icons and placeholder preview
- `scripts/research/build-seed-data.mjs` — regenerates researched JSON seeds
- `public/favicon.svg` — tab icon
- `public/assets/icons/*` — PWA / launcher icons
- `public/assets/maps/manifest.json` — map pixel size, tile template, attribution
- `public/assets/maps/preview.webp` — overview image used as overlay / fallback
- `public/assets/maps/PROVENANCE.md` — map source, rights, and tile notes
- `src/main.tsx` — React root, fonts, global CSS
- `src/app/router.tsx` — lazy routes for every v1 screen
- `src/layouts/RootLayout.tsx` — flex chrome (header / content / bottom nav), navigation, PWA prompt, toasts, back button, layout-viewport lock
- `src/styles/tokens.css` — Campfire / Parchment CSS variables, safe areas, and scrollbar colors
- `src/styles/base.css` — typography, focus, reduced-motion, controls, themed scrollbars, viewport lock
- `src/styles/textures.css` — journal panel paper noise and stamps
- `src/styles/layout.css` — page gutters with `--safe-left` / `--safe-right`; wrapping labeled search field whose `<input>` is the brass chrome and the tap target
- `src/types/*` — content, availability, research, user-state, export, roadmap types
- `src/data/*.json` — static guide dataset (never write user progress here)
- `src/data/index.ts` — typed loaders and chapter helpers
- `src/data/schemas.ts` — zod schemas for import validation
- `src/data/mapManifest.ts` — default Leaflet manifest constants
- `src/db/db.ts` — Dexie database `rdr2-complete-guide` schema v1
- `src/db/repositories.ts` — mission/treasure/entity/favorite/settings writes
- `src/hooks/useGuideState.ts` — live Dexie hooks
- `src/platform/capacitor.ts` — Browser, Filesystem+Share, SystemBars, back button
- `src/services/availability.ts` — chapter windows and labels
- `src/services/content.ts` — derived map markers
- `src/services/search.ts` — MiniSearch index
- `src/services/progress.ts` — category counts and 100% evaluator
- `src/services/compendium.ts` — kind/region filters and Compendium helpers
- `src/services/exportImport.ts` — transactional backup/restore
- `src/features/**` — Journey, Treasures, Map, Compendium, Search, Progress, Settings, About
- `src/components/**` — shared journal UI, map, dialogs, attribution
- `src/platform/pwaRegisterStub.ts` — no-op PWA register module for Android Vite builds
- `scripts/android-assets.mjs` — launcher icons, splash, and local.properties helper
- `android/` — Capacitor 8 Android project (SDK 36, app id frozen)
- `android/app/build.gradle` — `versionName` / `versionCode`; `signingConfigs.release` from gitignored `android/keystore.properties`
- `android/app/src/main/java/io/github/victorjnr/rdr2guide/MainActivity.java` — Capacitor `BridgeActivity`; WebView overscroll disabled
- `android/keystore.properties.example` — placeholder keys for local release signing (`storeFile`, `storePassword`, `keyAlias`, `keyPassword`)
- `src/services/search-progress.test.ts` — MiniSearch grouping and progress-empty tests
- `public/assets/maps/tiles/` — WebP tile pyramid (zoom 0–5)
- `src/services/treasures.test.ts` — treasure-chain dataset tests
- `src/services/journey.test.ts` — Chapter 1–2 / later-chapter dataset contract tests
- `scripts/research/import-jeanropke.mjs` — cached public-domain RDOMap pin importer
- `scripts/research/jeanropke-transform.mjs` — jeanropke lat/lng affine fit onto 0–1 map space
- `scripts/research/calibration.json` — station-icon control points, fitted matrix, residuals, and `maxRms`
- `scripts/research/calibration.test.ts` — RMS residual test against committed control points
- `src/data/markerCategories.ts` — map layer taxonomy, colours, and mark-entity mapping
- `src/services/mapCalibration.ts` — TypeScript affine apply / residual helpers
- `src/services/mapLayers.ts` — layer URL parse, collected filter, marker search
- `src/services/mapPopup.ts` — popup link and mark-action mapping
- `src/components/Checkbox.tsx` — `role="checkbox"` button; no native `<input>` so Android WebView cannot pan the layout viewport on tap
- `src/platform/viewport.ts` — pin `html`/`body` scroll at (0, 0) when the layout viewport pans
- `src/components/SearchField.tsx` — wrapping `<label>` + in-flow `type=text` search box; the input paints and receives taps on the brass chrome; `size={1}` so the field can shrink
- `src/components/MapLayerPanel.tsx` — grouped map layer controls
- `src/components/GameMap.css` — DivIcon pin and popup chrome; isolate Leaflet stacking
- `src/features/map/MapPage.module.css` — full-height map shell and Layers button stacking
- `src/components/MapLayerPanel.module.css` — bottom-sheet / side layer panel layout and stacking
- `src/services/map-pins.test.ts` — calibration, merge, layer, popup, and pin-progress tests
- `src/services/compendium.test.ts` — kind/region filters, pin lookup, progress-by-kind, search href
- `src/data/regions.json` — six state rows (id, name, description)
- `src/data/speciesIcons.json` — RDOMap habitat/herb icon → Compendium ids
- `src/features/compendium/CompendiumPage.tsx` — kind/region Compendium index
- `src/features/compendium/CompendiumEntryPage.tsx` — entry detail, notes, mini map
- `src/features/compendium/CompendiumPage.module.css` — Compendium list layout
- `documentation/README.md` — index of numbered change documents
- `CHANGELOG.md` — this file
- `README.md` — setup, disclaimer, license split, PWA vs Android

## 001 — Stage 1 app foundation (2026-09-06)

- `.github/workflows/ci.yml` — added Node 22 validate/typecheck/lint/test/build workflow
- `.gitignore` — ignore Android build outputs, keystores, map cache, venv, PWA `dev-dist`
- `.nvmrc` — added Node 22 pin
- `.prettierignore` — added generated-path ignores
- `capacitor.config.ts` — added frozen app id `io.github.victorjnr.rdr2guide`
- `eslint.config.js` — added flat ESLint config
- `index.html` — added viewport-fit, theme-color, and theme boot script
- `package.json` — added app scripts and local dependencies
- `package-lock.json` — locked npm tree
- `prettier.config.js` — added Prettier options
- `tsconfig.json` — added solution tsconfig
- `tsconfig.app.json` — added strict app compiler options
- `tsconfig.node.json` — added Node/tooling compiler options
- `vite.config.ts` — added React, PWA, and android-mode build
- `vitest.config.ts` — added jsdom test config
- `scripts/validate-data.ts` — added dataset validator
- `scripts/prepare-map.ts` — added tile pyramid generator
- `scripts/make-icons.mjs` — added icon renderer
- `scripts/research/build-seed-data.mjs` — added seed builder
- `public/favicon.svg` — added favicon
- `public/assets/icons/icon-192.png` — added PWA icon
- `public/assets/icons/icon-512.png` — added PWA icon
- `public/assets/icons/icon-512-maskable.png` — added maskable icon
- `public/assets/maps/manifest.json` — added map metadata
- `public/assets/maps/preview.webp` — added overview map image
- `public/assets/maps/PROVENANCE.md` — added map rights notes
- `src/main.tsx` — added application bootstrap
- `src/app/router.tsx` — added lazy routes
- `src/layouts/RootLayout.tsx` — added app shell
- `src/layouts/RootLayout.module.css` — added nav layout
- `src/styles/tokens.css` — added theme tokens
- `src/styles/base.css` — added base styles
- `src/styles/textures.css` — added journal textures
- `src/styles/layout.css` — added page layout
- `src/types/index.ts` — re-exported domain types
- `src/types/content.ts` — added mission/treasure/location types
- `src/types/availability.ts` — added availability types
- `src/types/research.ts` — added verification status
- `src/types/sources.ts` — added source registry types
- `src/types/userState.ts` — added Dexie user-state types
- `src/types/export.ts` — added backup schema version
- `src/types/future.ts` — added collectible/challenge/100% types
- `src/data/index.ts` — added JSON loaders
- `src/data/schemas.ts` — added zod import schemas
- `src/data/mapManifest.ts` — added default map constants
- `src/data/chapters.json` — added eight chapters
- `src/data/missions.json` — added 122 mission records
- `src/data/locations.json` — added location pins
- `src/data/treasures.json` — added seven treasure chains
- `src/data/activities.json` — added camp/companion activities
- `src/data/itemRequests.json` — added item requests
- `src/data/missables.json` — added missable registry (sparse)
- `src/data/mapMarkers.json` — added explicit extra markers
- `src/data/sources.json` — added source registry
- `src/data/collectibles.json` — added empty roadmap file
- `src/data/collectibleSets.json` — added empty roadmap file
- `src/data/challenges.json` — added empty roadmap file
- `src/data/compendium.json` — added empty roadmap file
- `src/data/completionRequirements.json` — added empty 100% file
- `src/db/db.ts` — added Dexie v1 schema
- `src/db/repositories.ts` — added progress writes
- `src/db/index.ts` — re-exported db module
- `src/db/repositories.test.ts` — added repository tests
- `src/hooks/useGuideState.ts` — added live query hooks
- `src/hooks/useOnline.ts` — added online detector
- `src/platform/capacitor.ts` — added native helpers
- `src/services/availability.ts` — added availability helpers
- `src/services/content.ts` — added derived markers
- `src/services/mapCoords.ts` — added coordinate math
- `src/services/search.ts` — added MiniSearch
- `src/services/progress.ts` — added progress aggregation
- `src/services/exportImport.ts` — added backup/restore
- `src/services/guide.test.ts` — added service tests
- `src/features/journey/JourneyPage.tsx` — added chaptered mission list
- `src/features/journey/MissionDetailPage.tsx` — added mission checklists
- `src/features/journey/ChapterDetailPage.tsx` — added chapter checklist
- `src/features/journey/MissablePage.tsx` — added missable detail
- `src/features/treasures/TreasuresPage.tsx` — added treasure list
- `src/features/treasures/TreasureDetailPage.tsx` — added step checkboxes
- `src/features/map/MapPage.tsx` — added Leaflet map
- `src/features/map/LocationPage.tsx` — added location detail
- `src/features/search/SearchPage.tsx` — added grouped search
- `src/features/progress/ProgressPage.tsx` — added category bars
- `src/features/progress/SavedPage.tsx` — added saved/to-do list
- `src/features/settings/SettingsPage.tsx` — added theme, backup, reset
- `src/features/about/AboutPage.tsx` — added disclaimer and attribution
- `src/features/NotFoundPage.tsx` — added 404
- `src/components/*` — added shared journal and map components
- `src/test/setup.ts` — added fake-indexeddb test setup
- `src/vite-env.d.ts` — added Vite/PWA types
- `documentation/README.md` — added document index
- `documentation/001-stage-1-app-foundation.md` — added this change document
- `README.md` — rewrote setup, disclaimer, and license notes
- `CHANGELOG.md` — added file roles and 001 section

## 002 — Journey checklists and Chapter 1–2 data tests (2026-09-06)

- `src/services/journey.test.ts` — added Chapter 1 gold and later-chapter skeleton tests
- `documentation/002-journey-checklist-tests.md` — added this change document
- `documentation/README.md` — linked 002
- `README.md` — listed 002 in Documentation
- `CHANGELOG.md` — added 002 section

## 003 — Treasure chain tests (2026-09-06)

- `src/services/treasures.test.ts` — added seven-chain and pre-order tests
- `documentation/003-treasure-chain-tests.md` — added this change document
- `documentation/README.md` — linked 003
- `README.md` — listed 003 in Documentation
- `CHANGELOG.md` — added 003 section

## 004 — Native-resolution map tile pyramid (2026-09-06)

- `public/assets/maps/tiles/**` — added 1365 WebP tiles (zoom 0–5, ~4 MB)
- `documentation/004-native-map-tiles.md` — added this change document
- `documentation/README.md` — linked 004
- `README.md` — listed 004 in Documentation
- `CHANGELOG.md` — added 004 section

## 005 — Search and progress tests (2026-09-06)

- `src/services/search-progress.test.ts` — added grouped search and empty-progress tests
- `documentation/005-search-progress-tests.md` — added this change document
- `documentation/README.md` — linked 005
- `README.md` — listed 005 in Documentation
- `CHANGELOG.md` — added 005 section

## 006 — Android shell, PWA verify, and v1 close-out (2026-09-06)

- `android/**` — added Capacitor Android project (compile/target SDK 36)
- `android/app/src/main/AndroidManifest.xml` — disabled cleartext traffic
- `android/app/src/main/res/values/colors.xml` — added Campfire colors
- `android/app/src/main/res/values/ic_launcher_background.xml` — set launcher background
- `android/app/src/main/res/mipmap-*/**` — replaced default launcher icons
- `android/app/src/main/res/drawable*/splash.png` — replaced splash screens
- `android/gradle.properties` — raised Gradle heap
- `scripts/android-assets.mjs` — added icon/splash/`local.properties` generator
- `src/platform/pwaRegisterStub.ts` — added Android-mode PWA stub
- `vite.config.ts` — alias `virtual:pwa-register` on android builds
- `package.json` — added `android:assets` script
- `documentation/006-android-and-verification.md` — added this change document
- `documentation/README.md` — linked 006
- `README.md` — listed 006 and release-signing notes
- `CHANGELOG.md` — added 006 section

## 007 — Wiki dataset fill and map overview zoom (2026-09-06)

- `scripts/research/fill-remaining.mjs` — added Wiki list filler for remaining datasets
- `scripts/research/enrich-from-wiki.mjs` — added mission Wiki enricher
- `scripts/research/fill-lists.mjs` — added challenge/collectible list pass
- `scripts/research/finalize-data.mjs` — added structured list cleanup
- `scripts/validate-data.ts` — validate collectibles, challenges, and compendium source use
- `src/data/missions.json` — Wiki gold, summaries, and givers for story missions
- `src/data/itemRequests.json` — 22 companion item requests
- `src/data/missables.json` — missable missions and item requests
- `src/data/collectibles.json` — cards, bones, dreamcatchers, carvings, POIs, hunts, exotics, graves
- `src/data/collectibleSets.json` — collectible set groupings
- `src/data/challenges.json` — nine challenge trees with ten ranks each
- `src/data/compendium.json` — animals, fish, plants, weapons, horses, gangs, satchels
- `src/data/completionRequirements.json` — official 35 100% rows plus non-required extras
- `src/data/sources.json` — Wiki article sources for filled records
- `src/services/mapCoords.ts` — scale CRS units so zoom 0 is the full tile world
- `src/components/GameMap.tsx` — open at zoom 0; marker focus still zooms in
- `src/features/map/MapPage.tsx` — taller map panel
- `src/features/progress/ProgressPage.tsx` — checkable official 100% list
- `src/features/about/AboutPage.tsx` — research counts and version 0.2.0
- `src/services/search.ts` — index collectibles, challenges, and compendium
- `src/features/search/SearchPage.tsx` — search group labels for those kinds
- `src/services/progress.ts` — 100% rows track against their own entity id
- `src/services/guide.test.ts` — zoom-0 tile-scale assertion
- `package.json` — version 0.2.0
- `documentation/007-wiki-data-and-map-zoom.md` — added this change document
- `documentation/README.md` — linked 007
- `README.md` — listed 007 in Documentation
- `CHANGELOG.md` — added 007 section

## 008 — Public-domain map pins and layered map (2026-09-06)

- `scripts/research/import-jeanropke.mjs` — added cached RDOMap pin importer at pinned SHA
- `scripts/research/jeanropke-transform.mjs` — added affine / residual helpers for jeanropke coords
- `scripts/research/calibration.json` — added eight town control points (RMS 0.00232)
- `scripts/research/calibration.test.ts` — added RMS residual assertion
- `scripts/validate-data.ts` — check marker types, unique externalKey, refs, and calibration RMS
- `src/data/mapMarkers.json` — 1733 public-domain pins
- `src/data/locations.json` — calibrated matching towns/camps; added labelled places
- `src/data/sources.json` — added `gh-jeanropke-rdomap` (Unlicense)
- `src/data/markerCategories.ts` — added grouped layer taxonomy
- `src/data/schemas.ts` — added `map-marker` entity type and map layer settings defaults
- `src/types/content.ts` — widened MarkerType and MapMarker link fields
- `src/types/userState.ts` — added `map-marker` entity type and map settings
- `src/services/mapCalibration.ts` — added TypeScript residual check
- `src/services/mapLayers.ts` — added layer URL, search, and collected filtering
- `src/services/mapPopup.ts` — added popup link/mark mapping
- `src/services/content.ts` — added explicit externalKey uniqueness helper
- `src/services/progress.ts` — added pinned collectible/legendary categories
- `src/components/GameMap.tsx` — DivIcon pins, canvas habitat/herb, calibrate click logger
- `src/components/GameMap.css` — pin and popup styling
- `src/components/MapLayerPanel.tsx` — grouped layer panel
- `src/components/MapLayerPanel.module.css` — bottom sheet / side panel layout
- `src/components/MapMarkerPopup.tsx` — typed links and mark-found actions
- `src/features/map/MapPage.tsx` — full-height map, URL + settings layer state
- `src/features/map/MapPage.module.css` — map page chrome
- `src/features/map/LocationPage.tsx` — list pins that share a locationId
- `src/features/progress/ProgressPage.tsx` — show pinned map categories
- `src/features/about/AboutPage.tsx` — jeanropke attribution and version 0.3.0
- `src/services/map-pins.test.ts` — calibration, merge, layers, popup, progress tests
- `package.json` — version 0.3.0
- `documentation/008-public-domain-map-pins.md` — added this change document
- `documentation/README.md` — linked 008
- `README.md` — listed 008 and jeanropke Sources entry
- `CHANGELOG.md` — added 008 section

## 009 — Compendium with general locations (2026-09-06)

- `scripts/research/fill-compendium-locations.mjs` — added Wiki general-location enricher and species icon map
- `scripts/validate-data.ts` — check region ids, locationIds, speciesIcons, and generalLocation sources
- `src/types/future.ts` — added Region, GeneralLocation, and CompendiumEntry location fields
- `src/types/index.ts` — exported Region
- `src/data/regions.json` — added six states
- `src/data/speciesIcons.json` — added habitat/herb icon → Compendium ids
- `src/data/compendium.json` — filled familyTitle, wikiPageTitle, and generalLocation on animals/fish/plants
- `src/data/mapMarkers.json` — tagged habitat/herb/legendary pins with compendiumId
- `src/data/sources.json` — added per-page Wiki sources for location-filled entries
- `src/data/index.ts` — added regions, speciesIcons, and Compendium loaders
- `src/data/markerCategories.ts` — habitat/herb pins mark Compendium entries
- `src/db/repositories.ts` — merge existing entity notes when toggling completion
- `src/db/repositories.test.ts` — Compendium entity toggle keeps notes
- `src/services/content.ts` — added markersForCompendium and pinCountsByCompendium
- `src/services/compendium.ts` — kind/region filters and labels
- `src/services/compendium.test.ts` — filters, pin lookup, progress-by-kind, search href
- `src/services/mapLayers.ts` — `?compendium=` matches icon-mapped pins
- `src/services/mapPopup.ts` — Compendium popup links to `/compendium/:id`
- `src/services/progress.ts` — separate Animals/Fish/Plants progress bars
- `src/services/search.ts` — Compendium hits link to entry pages
- `src/services/map-pins.test.ts` — popup href assertion
- `src/app/router.tsx` — `/compendium` and `/compendium/:entryId`
- `src/layouts/RootLayout.tsx` — sixth Compendium tab
- `src/layouts/RootLayout.module.css` — six-column bottom nav
- `src/features/compendium/CompendiumPage.tsx` — kind, region, incomplete, family groups
- `src/features/compendium/CompendiumEntryPage.tsx` — location, mini map, notes
- `src/features/compendium/CompendiumPage.module.css` — list row layout
- `src/features/progress/ProgressPage.tsx` — include Compendium kind counts
- `src/features/progress/SavedPage.tsx` — Compendium favourite titles
- `src/features/map/LocationPage.tsx` — wildlife and herbs recorded here
- `src/features/map/MapPage.tsx` — center on species pins for `?compendium=`
- `src/features/about/AboutPage.tsx` — version 0.4.0
- `package.json` — version 0.4.0
- `documentation/009-compendium-general-locations.md` — added this change document
- `documentation/README.md` — linked 009
- `README.md` — listed 009
- `CHANGELOG.md` — added 009 section

## 010 — Map pin calibration fix (2026-09-06)

- `scripts/research/calibration.json` — replaced eyeballed town control points with eight station-icon points; RMS 0.00232 → 0.00153 (0.0086 → 0.0015 against icon ground truth); `maxRms` 0.0025
- `scripts/research/import-jeanropke.mjs` — `maxRms` from calibration file; `LOCATION_ALIASES` and `TILE_MEASURED` update hand-placed `locations.json` coordinates; imports the Pronghorn Ranch area label
- `src/data/mapMarkers.json` — regenerated all 1733 pins with the refitted transform
- `src/data/locations.json` — 61 coordinates corrected; removed the off-map Guarma coordinate
- `src/data/sources.json` — added `wiki-full-world-map` for tile-measured positions
- `src/features/about/AboutPage.tsx` — version 0.4.1
- `package.json` — version 0.4.1
- `documentation/010-map-pin-calibration-fix.md` — added this change document
- `documentation/README.md` — linked 010
- `README.md` — listed 010
- `CHANGELOG.md` — added 010 section

## 011 — Map layer panel stacking (2026-09-06)

- `src/components/GameMap.css` — isolate Leaflet panes/controls with `.leaflet-container { z-index: 0 }`
- `src/features/map/MapPage.module.css` — isolate `.mapWrap`; raise Layers button above Leaflet (`z-index: 1100`)
- `src/components/MapLayerPanel.module.css` — raise layer panel above Leaflet (`z-index: 1100`)
- `documentation/011-map-layer-panel-stacking.md` — added this change document
- `documentation/README.md` — linked 011
- `README.md` — listed 011
- `CHANGELOG.md` — added 011 section

## 012 — Themed scrollbars (2026-09-06)

- `src/styles/tokens.css` — Campfire/Parchment `--scrollbar-*` colors and 8px `--scrollbar-size`
- `src/styles/base.css` — global `::-webkit-scrollbar` theming; Firefox `scrollbar-color` only inside a Mozilla `@supports` query
- `src/features/about/AboutPage.tsx` — version 0.4.2
- `package.json` — version 0.4.2
- `documentation/012-themed-scrollbars.md` — added this change document
- `documentation/README.md` — linked 012
- `README.md` — listed 012
- `CHANGELOG.md` — added 012 section

## 013 — Unsigned Android 0.5.0 release (2026-09-06)

- `package.json` — version 0.5.0
- `src/features/about/AboutPage.tsx` — Version 0.5.0
- `android/app/build.gradle` — `versionName "0.5.0"`, `versionCode 2`, unsigned release (`signingConfig null`)
- `README.md` — 0.5.0 ships unsigned by choice; listed 013
- `documentation/013-unsigned-android-050-release.md` — added this change document
- `documentation/README.md` — linked 013
- `CHANGELOG.md` — added 013 section

## 014 — Wire release signing from keystore.properties (2026-09-06)

- `android/app/build.gradle` — `signingConfigs.release` from gitignored `android/keystore.properties`; unsigned if that file is missing
- `android/keystore.properties.example` — dummy `storeFile`, `storePassword`, `keyAlias`, `keyPassword`
- `README.md` — local signing steps; GitHub Releases for sideload APKs; listed 014
- `src/features/about/AboutPage.tsx` — Android id, GitHub Releases link, same-keystore note
- `documentation/014-wire-release-signing.md` — added this change document
- `documentation/README.md` — linked 014
- `CHANGELOG.md` — file roles and 014 section

## 015 — Android search fields and viewport fit (2026-09-12)

- `index.html` — `interactive-widget=resizes-content` so the Android keyboard resizes the layout viewport
- `android/app/src/main/AndroidManifest.xml` — `windowSoftInputMode=adjustResize`
- `android/app/src/main/res/layout/activity_main.xml` — WebView `overScrollMode=never`
- `android/app/src/main/java/io/github/victorjnr/rdr2guide/MainActivity.java` — disable WebView overscroll after Capacitor init
- `android/app/build.gradle` — `versionName "0.5.1"`, `versionCode` 3
- `package.json` — version 0.5.1
- `src/features/about/AboutPage.tsx` — Version 0.5.1
- `src/styles/tokens.css` — safe-area tokens take the max of Capacitor CSS vars and `env()`
- `src/styles/base.css` — lock html/body/#root to the WebView; reset `input[type=search]` for Android WebView
- `src/styles/layout.css` — page padding no longer doubles safe-area; `.search-field` wrapper
- `src/layouts/RootLayout.tsx` — outlet in a flex content pane so chrome does not overlay pages
- `src/layouts/RootLayout.module.css` — column flex shell; header/nav in flow; content scrolls
- `src/features/search/SearchPage.tsx` — visible `type=search` field with WebView-safe attributes
- `src/features/compendium/CompendiumPage.tsx` — same search-field treatment as Search
- `src/features/map/MapPage.module.css` — map fills the content pane instead of `100dvh` minus guessed chrome
- `src/components/MapLayerPanel.tsx` — pin search stays outside the scrolling category list
- `src/components/MapLayerPanel.module.css` — flex panel; search `flex-shrink: 0`; list scrolls
- `documentation/015-android-search-and-viewport.md` — added this change document
- `documentation/README.md` — linked 015
- `README.md` — 0.5.1 sideload note; listed 015
- `CHANGELOG.md` — file roles and 015 section

## 016 — Android search boxes actually visible (2026-09-12)

- `src/components/SearchField.tsx` — shared labeled text search field (`role=searchbox`, not `type=search`)
- `src/components/SearchField.test.tsx` — asserts visible label and `type=text`
- `src/features/search/SearchPage.tsx` — Search tab uses `SearchField` with a visible “Search” label
- `src/features/search/SearchPage.test.tsx` — Search tab has no `input[type=search]`
- `src/features/compendium/CompendiumPage.tsx` — filter uses the same text field
- `src/components/MapLayerPanel.tsx` — “Search pins” lives in a non-scrolling toolbar
- `src/components/MapLayerPanel.test.tsx` — pin search is `type=text`
- `src/components/MapLayerPanel.module.css` — opaque sheet; toolbar `flex-shrink: 0`; drop `appearance: none` on the field
- `src/styles/layout.css` — 44px min-height, brass border, `--ink` / `--paper-raised` contrast, visible label
- `src/styles/base.css` — removed `type=search` + `appearance: none` reset that hid the control on Android WebView
- `src/styles/tokens.css` — `--safe-*` uses Capacitor `--safe-area-inset-*` then `env()`, not `max()`
- `package.json` — version 0.5.2
- `src/features/about/AboutPage.tsx` — Version 0.5.2
- `android/app/build.gradle` — `versionName "0.5.2"`, `versionCode` 4
- `documentation/016-android-search-box-visible.md` — added this change document
- `documentation/README.md` — linked 016
- `README.md` — 0.5.2 sideload note; listed 016
- `CHANGELOG.md` — file roles and 016 section

## 017 — Android search fields fit the phone width (2026-09-12)

- `src/styles/layout.css` — page padding includes `--safe-left` / `--safe-right`; wrapping search row; brass chrome on `.search-field__control`; input fills with `inset: 0` instead of `width: 100%`
- `src/components/SearchField.tsx` — control wrapper and `size={1}` so the UA min-width cannot overflow
- `src/components/SearchField.test.tsx` — asserts `size="1"` and the control wrapper
- `src/features/search/SearchPage.tsx` — offline hint `min-width: 0` so it cannot peek beside the box
- `src/styles/base.css` — inputs `box-sizing: border-box`, `min-width: 0`, `max-width: 100%`
- `src/layouts/RootLayout.module.css` — header 16px + `--safe-*` longhands; content `overflow-x: hidden`
- `src/components/MapLayerPanel.module.css` — sheet `left`/`right` include safe insets; toolbar `min-width: 0`
- `src/features/map/MapPage.module.css` — Layers button `right` includes `--safe-right`
- `package.json` — version 0.5.3
- `src/features/about/AboutPage.tsx` — Version 0.5.3
- `android/app/build.gradle` — `versionName "0.5.3"`, `versionCode` 5
- `documentation/017-android-search-width.md` — added this change document
- `documentation/README.md` — linked 017
- `README.md` — 0.5.3 sideload note; listed 017
- `CHANGELOG.md` — file roles and 017 section

## 018 — Android search tap target matches the brass box (2026-09-12)

- `src/styles/layout.css` — search input is in-flow at 44px with chrome on the field; label is `fit-content` so empty space above the box is not a hit target
- `src/components/SearchField.tsx` — comment: chrome is on the input, not an absolutely positioned overlay
- `src/components/SearchField.test.tsx` — label does not wrap the input
- `package.json` — version 0.5.4
- `src/features/about/AboutPage.tsx` — Version 0.5.4
- `android/app/build.gradle` — `versionName "0.5.4"`, `versionCode` 6
- `documentation/018-android-search-hit-target.md` — added this change document
- `documentation/README.md` — linked 018
- `README.md` — 0.5.4 sideload note; listed 018
- `CHANGELOG.md` — file roles and 018 section

## 019 — Android search box tap focuses the field (2026-09-12)

- `src/components/SearchField.tsx` — wrapping `<label>` around caption + in-flow input; removed `.search-field__control`
- `src/styles/layout.css` — brass chrome, 44px min-height, solid `--paper-raised`, `appearance: none`, and `pointer-events: auto` on the input; no absolute positioning
- `src/components/SearchField.test.tsx` — label wraps the input; click focuses the field
- `package.json` — version 0.5.5
- `src/features/about/AboutPage.tsx` — Version 0.5.5
- `android/app/build.gradle` — `versionName "0.5.5"`, `versionCode` 7
- `documentation/019-android-search-box-tap.md` — added this change document
- `documentation/README.md` — linked 019
- `README.md` — 0.5.5 sideload note; listed 019
- `CHANGELOG.md` — file roles and 019 section

## 020 — Money Lending IV and checklist viewport lock (2026-09-13)

- `src/data/missions.json` — add Money Lending and Other Sins IV (Chapter 3); link III → IV → V and The New South → IV
- `src/data/missables.json` — Chapter 3 missable row for IV
- `src/data/sources.json` — `wiki-money-lending-and-other-sins-iv`
- `scripts/research/build-seed-data.mjs` — include IV on the Chapter 3 seed list
- `src/components/Checkbox.tsx` / `Checkbox.module.css` — button checkbox, no hidden native input
- `src/components/Checkbox.test.tsx` — toggle uses `role="checkbox"` button
- `src/platform/viewport.ts` — lock layout viewport scroll at (0, 0)
- `src/layouts/RootLayout.tsx` — install the viewport lock
- `src/layouts/RootLayout.module.css` — `overflow-anchor: none` on the content pane
- `src/styles/base.css` — `overflow-anchor: none` on html/body/#root
- `src/services/journey.test.ts` — I–VII present; IV is Chapter 3
- `src/features/journey/MissionDetailPage.test.tsx` — checklist taps use button checkboxes; IV page renders
- `package.json` — version 0.5.6
- `src/features/about/AboutPage.tsx` — Version 0.5.6
- `android/app/build.gradle` — `versionName "0.5.6"`, `versionCode` 8
- `documentation/020-money-lending-iv-and-checkbox-viewport.md` — added this change document
- `documentation/README.md` — linked 020
- `README.md` — 0.5.6 sideload note; listed 020
- `CHANGELOG.md` — file roles and 020 section

