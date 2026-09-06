# 004 — Native-resolution map tile pyramid

- **Date:** 2026-09-06
- **Commit subject:** Add native-resolution world map tiles
- **Stage:** Stage 1 / Map

## Summary

Commits the WebP tile pyramid generated from the Red Dead Wiki world map (7200×5400 padded to 8192, zoom 0–5). Coordinates stay normalized 0–1 against the source image, not the padded square. The Wiki file page has no license tag; the image is Rockstar/Take-Two art included for this non-commercial fan project.

## Changes

- Added `public/assets/maps/tiles/**` (1365 WebP tiles, ~4 MB)
- `public/assets/maps/PROVENANCE.md` and `manifest.json` already describe the source (written by `npm run prepare:map`)

## Safety / permissions

- Source JPG remains in gitignored `scripts/.cache/`
- Not a redistribution license; replaceable without changing marker JSON

## How to verify

```bash
npm run prepare:map
npm run dev
# Open /map and zoom to native detail
```
