# 009 — Compendium with general locations

- **Date:** 2026-09-06
- **Commit subject:** Add Compendium with animal, fish and herb locations
- **Stage:** Stage 1 / MVP

## Summary

Adds a sixth primary tab, **Compendium**, with region-level locations for animals, legendary animals, fish, legendary fish, and plants. Wiki prose is attributed and marked `researched`. Habitat and herb map pins now resolve to Compendium entries so “Show on Map” and progress checkboxes stay in sync.

## Changes

- `scripts/research/fill-compendium-locations.mjs` — cached Wiki infobox / Location-section parse; writes `generalLocation` onto matching Compendium rows, `speciesIcons.json`, and `compendiumId` onto habitat/herb/legendary pins.
- `src/data/regions.json` — six states (text only, no coordinates).
- `src/data/speciesIcons.json` — hand-maintained RDOMap icon → Compendium id map used by the importer and by `markersForCompendium`.
- `src/data/compendium.json` / `src/data/mapMarkers.json` — filled location text and tagged pins (249 of 350 entries have `generalLocation`; 162 of 164 animals, all 16 legendary animals, 15 fish, 13 legendary fish, and 43 plants. Weapons, horses, gangs, and equipment correctly have none).
- UI: `/compendium` and `/compendium/:entryId`, 6-column nav, search hrefs, Progress bars by kind, Saved list titles, Location page “Wildlife and herbs recorded here”.
- App version `0.4.0`.

## Known limitations

- Cigarette cards, bounty posters, exotics-as-pins beyond orchids, hunting requests, and shacks stay unpinned.
- Habitat and herb icons are the game’s own Compendium map icons (general areas), not exhaustive spawn points.
- Wiki location prose is community-written and marked `researched`, not `verified`.
- Guarma is an inset on the labelled world map and was not used as a calibration point.
- Some Wiki pages yield empty `regionIds` even when named places are present (for example Legendary Bullgator). Those rows are omitted from region-chip filters until the Wiki text names a state.
- Mule and Standard Donkey have no Wiki location section, so they have no `generalLocation`.

## Safety / permissions

- None. Broker / hard-confirmation / adapter unchanged. Wiki text is attributed via per-page `wiki-*` sources. Pin coordinates remain public-domain jeanropke data from commit 008.

## How to verify

```bash
npx tsx scripts/validate-data.ts
npx vitest run
npm run typecheck
npm run lint
npm run build
```

Open `/compendium?kind=plant&region=lemoyne`, open Yarrow, then **Show on Map**. Progress should list **Animals studied**, **Legendary animals**, **Fish**, **Legendary fish**, and **Plants** as separate bars from the pin categories added in 008.
