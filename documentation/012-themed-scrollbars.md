# 012 — Themed scrollbars

- **Date:** 2026-09-06
- **Commit subject:** Theme native scrollbars to Campfire and Parchment
- **Stage:** Stage 1 / MVP

## Summary

Default grey OS scrollbars clashed with the journal chrome, especially on the Map pin-type panel. Scrollbars are now 8px theme tokens (brass/leather on Campfire, leather/parchment on Parchment) for both the document and overflow panels, without hiding overflow or disabling scroll.

## Changes

- `src/styles/tokens.css` — `--scrollbar-track`, `--scrollbar-thumb`, `--scrollbar-thumb-hover` per theme; shared `--scrollbar-size`.
- `src/styles/base.css` — Chromium `::-webkit-scrollbar*` rules; Firefox `scrollbar-width` / `scrollbar-color` behind `@supports (-moz-appearance: none)` so Chromium does not fall back to the grey overlay bar.
- `package.json`, `src/features/about/AboutPage.tsx` — version 0.4.2.

## Safety / permissions

- None

## How to verify

Open `/map` at ≥768px (side panel) and ~360px (bottom sheet). The layer list scrollbar should be brass/leather (Campfire) or leather on cream (Parchment), not grey. Show all types and scroll to Other. Spot-check Journey and Compendium page scroll. Toggle theme in Settings and re-check the map panel.
