# 010 — Map pin calibration fix

- **Date:** 2026-09-06
- **Commit subject:** Recalibrate map pins against station icons and fix hand-placed locations
- **Stage:** Stage 1 / MVP

## Summary

The affine transform from commit 008 was fitted to eight coarse, eyeballed town positions and carried a systematic south-west drift (up to ~115 px at Benedict Point, ~30–45 px around Valentine/Rhodes). Every jeanropke pin inherited that offset. The transform is now fitted to eight train-station icons printed on our own tiles, cutting the residual RMS from 0.0086 to 0.0015 against that ground truth. Sixty-one hand-placed `locations.json` coordinates (used by mission-start and treasure pins) that were off by up to ~1700 px are now imported from RDOMap labels or measured directly on the tiles.

## What was wrong

| Landmark (station icon on our tiles) | Old pin offset (px) | Old dist | New pin offset (px) | New dist |
| --- | --- | --- | --- | --- |
| Benedict Point | −96, −64 | 0.01789 | −7, −9 | 0.00195 |
| Armadillo | −69, −30 | 0.01101 | 3, 16 | 0.00301 |
| Wallace Station | −22, −21 | 0.00497 | 5, 3 | 0.00092 |
| Riggs Station | −29, −34 | 0.00755 | 5, −7 | 0.00142 |
| Valentine | −20, −25 | 0.00539 | −4, −5 | 0.00105 |
| Rhodes | −22, −24 | 0.00547 | 4, −2 | 0.00065 |
| Emerald Station | −7, −15 | 0.00301 | 0, −1 | 0.00024 |
| Annesburg | 4, −1 | 0.00057 | −6, 4 | 0.00122 |
| **RMS (8 points)** | | **0.00860** | | **0.00153** |

Distances are normalized 0–1 map units (0.004 ≈ 30 px on the 7200 px source). Saint Denis and Van Horn post offices are not at their station icons in RDOMap and were held out of the fit.

## Changes

- `scripts/research/calibration.json` — eight station-icon control points (`method` documents how icon centres were measured), refitted affine matrix (RMS 0.00153, max 0.00301), `maxRms` tightened from 0.004 to 0.0025.
- `scripts/research/import-jeanropke.mjs` — reads `maxRms` from the calibration file; `LOCATION_ALIASES` map RDOMap labels/shops/fast-travel keys to existing `locations.json` ids (Adler Ranch, Flatneck Station, Carmody Dell, Limpany, Manito Glade, Old Trail Rise, Face Rock, Serpent Mound, Greenhollow, Tiny Church, Obelisk, Little Creek hermit, …); `TILE_MEASURED` holds source-pixel positions for 19 places RDOMap has no pin for (Caliban's Seat, Cotorra Springs, Elysian Pool, Fort Wallace, Mount Shann, Saint Denis docks/graveyard, …), attributed to `wiki-full-world-map`; `sp_areas` label for Pronghorn Ranch imported as a town pin.
- `src/data/mapMarkers.json` — all 1733 pins regenerated with the new transform.
- `src/data/locations.json` — 61 coordinates updated (23 imported towns/camps moved 12–120 px; 38 hand-placed places moved 540–1750 px); `loc-guarma` coordinate removed because Guarma is not drawn on the world map tiles.
- `src/data/sources.json` — added `wiki-full-world-map` for tile-measured positions.
- `package.json`, `src/features/about/AboutPage.tsx` — version 0.4.1.

## Known limitations

- Van Horn shops sit ~66 px east of the Van Horn station icon in RDOMap's own data (the post office there is at the trading post, not the station); the pins follow RDOMap and were not adjusted.
- `shop_van_fence`, `shop_lag_bait_store`, and the Van Horn wardrobe fall on water-coloured pixels in a land/water check; all three are dockside shops in-game, so they were left as-is.
- Guarma has no pin on the world map.

## Safety / permissions

- None. Broker / hard-confirmation / adapter unchanged. Pin coordinates remain public-domain jeanropke data; tile-measured positions are attributed to the project map source.

## How to verify

```bash
node scripts/research/import-jeanropke.mjs   # idempotent, regenerates the same files
npm run validate:data
npx vitest run
npm run typecheck
npm run lint
npm run build
```

Open `/map?marker=marker-jr-fasttravel-valentine&layers=town,fast-travel,gunsmith,saloon,general-store,post-office` and zoom to 5: the shops sit on Valentine's main street and the post office on the station icon. Repeat for Armadillo, Rhodes, and Saint Denis. `/map?layers=legendary-fish` shows every legendary fish in water; `/map?layers=legendary-animal` puts the Bharati Grizzly north of O'Creagh's Run, the Beaver at Elysian Pool, and the Bullgator in Bayou Nwa.
