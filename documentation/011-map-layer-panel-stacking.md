# 011 — Map layer panel stacking

- **Date:** 2026-09-06
- **Commit subject:** Keep the map layer panel above Leaflet tiles and controls
- **Stage:** Stage 1 / MVP

## Summary

Leaflet map panes (`z-index` 400) and zoom chrome (`z-index` 1000) painted over the Map page layer panel (`z-index` 8) and Layers button (`z-index` 9) because `.leaflet-container` did not create a stacking context. The panel is now stacked above the map on both the desktop side panel and the phone bottom sheet, without disabling pan/zoom outside the panel.

## Changes

- `src/components/GameMap.css` — set `.leaflet-container { z-index: 0 }` so pane and control z-indexes stay inside the map.
- `src/features/map/MapPage.module.css` — isolate `.mapWrap`; raise `.layersBtn` to `z-index: 1100`.
- `src/components/MapLayerPanel.module.css` — raise `.panel` to `z-index: 1100`.

## Safety / permissions

- None

## How to verify

Open `/map` at a desktop width (≥768) and a phone width (~360). Toggle Layers / Hide layers. The panel (search, Show all / Hide all, per-type rows) must sit fully above the map and remain clickable. Zoom controls stay usable; the Layers button is not under the zoom widget. With the panel closed, pan and zoom still work.
