# 007 — Wiki dataset fill and map overview zoom

- **Date:** 2026-09-06
- **Commit subject:** Fill Wiki guide data and start the map at zoom 0
- **Stage:** Stage 1 / MVP

## Summary

Loads Red Dead Wiki-sourced missions, collectibles, challenges, compendium, and the official 100% list into the bundled JSON. Aligns Leaflet coordinates with the tile pyramid so zoom 0 shows the whole world; users zoom in for detail.

## Changes

- Research scripts under `scripts/research/` fetch and parse Wiki wikitext (cached locally, gitignored)
- `src/data/*.json` — filled collectibles, challenges, compendium, 100% criteria, item requests, missables; mission gold/summaries from Wiki
- Progress tab lists the 35 official 100% rows as checkboxes; search indexes collectibles, challenges, and compendium
- `src/services/mapCoords.ts` — divide by `2^maxNativeZoom` so zoom 0 is one 256px tile
- `src/components/GameMap.tsx` — default zoom 0, min zoom 0; marker deep-links still zoom in
- App version `0.2.0`

## Safety / permissions

- None. No invented coordinates or Gold Medal rows; Wiki pages without those lists stay empty
- Map image provenance unchanged

## How to verify

```bash
npx tsx scripts/validate-data.ts
npx vitest run
```

Open `/map`: the full world is visible at zoom 0; use + to zoom in. Open `/progress`: 35 official 100% criteria. Search for “Legendary Beaver”.
