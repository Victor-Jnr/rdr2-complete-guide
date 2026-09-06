# 002 — Journey checklists and Chapter 1–2 data tests

- **Date:** 2026-09-06
- **Commit subject:** Add Journey checklist tests
- **Stage:** Stage 1 / Journey

## Summary

Locks the Journey dataset contract in tests: Chapter 1 Colter missions include Gold Medal rows, and later chapters remain a researched title skeleton rather than invented walkthroughs.

## Changes

- Added `src/services/journey.test.ts` covering Chapter 1 gold coverage and Chapter 6 skeleton status

## Safety / permissions

- None

## How to verify

```bash
npx vitest run src/services/journey.test.ts
npm run validate:data
```
