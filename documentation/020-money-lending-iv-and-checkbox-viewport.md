# 020 — Money Lending IV and checklist viewport lock

- **Date:** 2026-09-13
- **Commit subject:** Restore Money Lending IV and stop checklist taps from panning the app
- **Stage:** Stage 1 / MVP

## Summary

Chapter 3 was missing **Money Lending and Other Sins IV** because the seed list jumped from III to V. Tapping a mission or Gold Medal checkbox on Android WebView also panned the whole layout viewport so chrome slid off the top. This release adds the missing mission and stops checklists from using a native `<input>` that WebView tries to scroll into view.

## Changes

- Add `mission-money-lending-and-other-sins-iv` (Chapter 3, Clemens Point, Gwyn Hughes / Winton Holmes), wiki source, missable row, and III → IV → V links.
- Replace the custom checkbox’s hidden native input with a `role="checkbox"` button.
- Pin `html`/`body` scroll at (0, 0) on layout-viewport pan; disable scroll anchoring on the shell.
- Version **0.5.6** / `versionCode` **8**.

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

In the app: Search for “Money Lending and Other Sins IV”; it appears under Journey → Chapter 3. Open any mission with Gold Medal requirements, tap **Mark mission complete** and a gold row — header and bottom nav stay on screen; content must not jump off the top.
