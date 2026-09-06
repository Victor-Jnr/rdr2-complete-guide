# Changelog

## File roles

- `.github/workflows/ci.yml` — Node 22 CI: validate, typecheck, lint, test, web build
- `.nvmrc` — pins Node 22 for local/nvm use
- `.prettierignore` — skip generated Android, dist, and map tiles
- `capacitor.config.ts` — Capacitor 8 app id/name, `webDir: dist`, System Bars CSS insets
- `eslint.config.js` — ESLint 9 flat config for TypeScript + React
- `index.html` — PWA-capable document shell and theme boot script
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
- `src/layouts/RootLayout.tsx` — chrome, navigation, PWA prompt, toasts, back button
- `src/styles/tokens.css` — Campfire / Parchment CSS variables and safe areas
- `src/styles/base.css` — typography, focus, reduced-motion, controls
- `src/styles/textures.css` — journal panel paper noise and stamps
- `src/styles/layout.css` — page gutters for phone / tablet / desktop
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
- `src/services/exportImport.ts` — transactional backup/restore
- `src/features/**` — Journey, Treasures, Map, Search, Progress, Settings, About
- `src/components/**` — shared journal UI, map, dialogs, attribution
- `src/platform/pwaRegisterStub.ts` — no-op PWA register module for Android Vite builds
- `scripts/android-assets.mjs` — launcher icons, splash, and local.properties helper
- `android/` — Capacitor 8 Android project (SDK 36, app id frozen)
- `src/services/search-progress.test.ts` — MiniSearch grouping and progress-empty tests
- `public/assets/maps/tiles/` — WebP tile pyramid (zoom 0–5)
- `src/services/treasures.test.ts` — treasure-chain dataset tests
- `src/services/journey.test.ts` — Chapter 1–2 / later-chapter dataset contract tests
- `scripts/research/import-jeanropke.mjs` — cached public-domain RDOMap pin importer
- `scripts/research/jeanropke-transform.mjs` — jeanropke lat/lng affine fit onto 0–1 map space
- `scripts/research/calibration.json` — town control points, fitted matrix, and residuals
- `scripts/research/calibration.test.ts` — RMS residual test against committed control points
- `src/data/markerCategories.ts` — map layer taxonomy, colours, and mark-entity mapping
- `src/services/mapCalibration.ts` — TypeScript affine apply / residual helpers
- `src/services/mapLayers.ts` — layer URL parse, collected filter, marker search
- `src/services/mapPopup.ts` — popup link and mark-action mapping
- `src/components/MapLayerPanel.tsx` — grouped map layer controls
- `src/components/GameMap.css` — DivIcon pin and popup chrome
- `src/features/map/MapPage.module.css` — full-height map shell
- `src/components/MapLayerPanel.module.css` — bottom-sheet / side layer panel layout
- `src/services/map-pins.test.ts` — calibration, merge, layer, popup, and pin-progress tests
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





