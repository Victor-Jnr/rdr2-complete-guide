# 008 — Public-domain map pins and layered map

- **Date:** 2026-09-06
- **Commit subject:** Add public-domain map pins and layered map
- **Stage:** Stage 1 / MVP

## Summary

Fills the Map tab with public-domain pins from jeanropke/RDOMap (Unlicense), fitted onto this project's Wiki-labelled tile crop. Adds grouped layer controls, per-pin found/hunted/caught state, and separate Progress categories for the pinned collectible sets.

## Changes

- `scripts/research/import-jeanropke.mjs` — cached fetch of RDOMap `discoverables.json`, `singleplayer.json`, `shops.json`, and `fasttravels.json` at commit `922daf072c3ea027c5d5ed097173ce66d70d65b6` (2026-09-06). Skips RDO-only `honor` / `harriet` / `wardrobe`. Emits `mapMarkers.json` and updates matching `locations.json` coordinates.
- `scripts/research/jeanropke-transform.mjs` and `scripts/research/calibration.json` — eight town control points measured on our tiles; 6-parameter affine fit, RMS **0.00232** (limit 0.004).
- DEV-only `/map?calibrate=1` logs `fromLeaflet(...)` on click.
- `src/data/mapMarkers.json` — 1733 explicit pins (30 dinosaur bones, 20 dreamcatchers on-map of 21 in the dump, 10 rock carvings, 9 graves, 49 POIs, 83 wilderness chests, 187 orchid spawns, 16 legendary animals, 15 legendary fish, 572 habitat icons, 533 herb icons, places, amenities, fast travel).
- `src/data/locations.json` — calibrated replacements where a label matched an existing name (`cross-checked`); new rows for labelled towns/camps not previously present (Annesburg, Armadillo, Tumbleweed, Van Horn, Wapiti, Lagras, MacFarlane's Ranch, Manzanita Post, Butcher Creek, Cornwall Kerosene & Tar, Ewing Basin, and gang hideouts). Unmatched original mission/treasure pins keep their previous coordinates.
- Map UI: `MapLayerPanel`, DivIcon pins, canvas `CircleMarker`s for habitat/herb (hidden below zoom 2), URL `?layers=` / `?hideCollected=` plus Dexie settings. Habitat and herb layers default off.
- Progress: separate bars for bones, dreamcatchers, carvings, graves, POIs, chests, legendary animals, and legendary fish.
- Source `gh-jeanropke-rdomap` (`sourceType: community`, Unlicense). Not copied from rdr2map.com / Map Genie.
- App version `0.3.0`.

## Numbering and gaps

- Dinosaur bones are titled "Dinosaur Bone (map #N)" using RDOMap dump order. That order is **not** proven to match Wiki `col-bone-N` numbering, so pins link to the set, not individual Wiki rows.
- Dreamcatchers: RDOMap lists 21; one spawn is outside this map crop, so 20 pins are shown. The Wiki strand lists 20.
- Legendary Channel Catfish and Legendary Northern Pike have pins but no matching legendary-fish compendium rows yet (regular fish rows exist). They use `map-marker` entity state.

## Known limitations

- Cigarette cards, bounty posters, exotics (beyond orchid pins), hunting requests, and shacks stay unpinned; no license-compatible coordinate source was used.
- Habitat and herb icons are the game's own compendium map icons (general areas), not exhaustive spawn points.
- Guarma is an inset on the labelled world map and was not used as a control point.

## Safety / permissions

- None. Broker / hard-confirmation / adapter unchanged. Pin coordinates are public-domain game-extracted data, attributed, and not taken from commercial map sites.

## How to verify

```bash
npx tsx scripts/validate-data.ts
npx vitest run
npm run typecheck
npm run lint
npm run build
```

Open `/map`: Valentine, Rhodes, Saint Denis, and Tumbleweed pins should sit on those town labels at zoom 3+. Toggle layers, search pins, and open `/map?marker=marker-jr-fasttravel-valentine`. On Progress, the new pin categories should list non-zero totals.
