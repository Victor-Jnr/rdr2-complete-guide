# 021 — Journey filters, mission scroll, strangers, bounties, map search

- **Date:** 2026-09-13
- **Commit subject:** Restore Journey theme, add missing strangers and bounties, and make map pin search work
- **Stage:** Stage 1 / MVP

## Summary

The 0.5.6 checkbox change left Journey filter boxes as native Android controls, duplicated “incomplete”, and did not reset the content pane when opening a mission. Stranger and bounty lists were almost empty because they were never seeded. Map pin search only looked at already-visible layers. This release restores the Campfire checkboxes, fills those journal rows, and searches pins by name or category even when the layer is off.

## Changes

- Theme Saved / Checklist mode / Settings / Compendium / chapter “incomplete” with the existing button checkbox; do not bring back native `<input type="checkbox">` on mission Gold rows.
- Drop Journey’s extra “Show incomplete only” checkbox; **Not Completed** is the filter. Settings → Hide completed by default selects that chip until the user picks another.
- Reset the scrolling `.content` pane on pathname change so mission details open at the top.
- Add stranger strands and sheriff-board bounties in `src/data/sideMissions.ts`. Tag existing Snake Oil as bounty (Benedict Allbright) instead of duplicating it.
- Map “Search pins” matches title, subtitle, type, and category label and does not require the layer to be toggled on. Matching herb/habitat pins still draw at overview zoom when the result set is small.
- Version **0.5.7** / `versionCode` **9**.

## Safety / permissions

- App ID remains frozen: `io.github.victorjnr.rdr2guide`.
- Do not commit `android/keystore.properties`, `*.jks`, or APKs.

## How to verify

```powershell
npm run typecheck
npm run lint
npx vitest run
npm run build
```

On Journey: Saved and Checklist mode use brass boxes like Done; there is no second “Show incomplete only” row; Stranger lists more than Snake Oil; Bounty lists sheriff posters. Open a mission from midway down the list — the detail starts at the title. On Map → Layers, hide Herbs and search `yarrow` — the pin still appears.
