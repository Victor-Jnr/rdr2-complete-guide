# 001 — Stage 1 app foundation

- **Date:** 2026-09-06
- **Commit subject:** Add Stage 1 app foundation
- **Stage:** Stage 1 / MVP foundation

## Summary

Bootstraps the Android-first RDR2 companion as a Vite + React 19 + TypeScript app with Dexie checklists, CSS token themes, a data validator, CI, and the full v1 UI shell. Guide JSON is loaded statically; user progress stays in IndexedDB. npm packages install into local `node_modules` (no global app deps; Python is unused).

## Changes

- Scaffolded Vite, strict TypeScript, ESLint, Prettier, Vitest, and GitHub Actions CI on Node 22
- Added Campfire / Parchment tokens, journal textures, reduced-motion, and a responsive shell (bottom nav / rail / sidebar) with safe-area insets
- Added the data router, Dexie schema v1, repositories, hooks, and zod export/import types
- Seeded chapters, missions (Chapter 1–2 deep; later chapters as a title skeleton), locations, treasures, activities, item requests, and source registry
- Wired `scripts/validate-data.ts` as `pretest`
- Documented MIT vs Rockstar/Wiki material in the root README

## Safety / permissions

- Capacitor app ID is documented as frozen `io.github.victorjnr.rdr2guide` (Android project added in a later commit)
- No keystore or `local.properties` in git
- Map source JPG stays in gitignored `scripts/.cache/`

## How to verify

```bash
npm ci
npm run validate:data
npm run typecheck
npm run lint
npm test
npm run dev
```
