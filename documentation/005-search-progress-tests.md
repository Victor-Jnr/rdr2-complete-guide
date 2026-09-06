# 005 — Search and progress tests

- **Date:** 2026-09-06
- **Commit subject:** Add search and progress tests
- **Stage:** Stage 1 / Search & Progress

## Summary

Adds tests that MiniSearch hits use the UI group order and that progress categories do not treat empty user state as 100% complete.

## Changes

- Added `src/services/search-progress.test.ts`

## Safety / permissions

- None

## How to verify

```bash
npx vitest run src/services/search-progress.test.ts
```
