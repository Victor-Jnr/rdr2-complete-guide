import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

interface CalibrationFile {
  image: { width: number; height: number; tileSize: number };
  maxRms: number;
  transform: { a: number; b: number; c: number; d: number; e: number; f: number };
  controlPoints: {
    id: string;
    jeanropke: { lat: number; lng: number };
    tile: { x: number; y: number };
  }[];
}

const calib = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'calibration.json'), 'utf8'),
) as CalibrationFile;

function tileToNormalized(tileX: number, tileY: number, image: CalibrationFile['image']) {
  return {
    x: (tileX * image.tileSize) / image.width,
    y: (tileY * image.tileSize) / image.height,
  };
}

describe('jeanropke calibration.json', () => {
  it('keeps RMS residual at or below 0.004', () => {
    const residuals = calib.controlPoints.map((p) => {
      const expected = tileToNormalized(p.tile.x, p.tile.y, calib.image);
      const got = {
        x: calib.transform.a * p.jeanropke.lng + calib.transform.b * p.jeanropke.lat + calib.transform.c,
        y: calib.transform.d * p.jeanropke.lng + calib.transform.e * p.jeanropke.lat + calib.transform.f,
      };
      return Math.hypot(got.x - expected.x, got.y - expected.y);
    });
    expect(residuals).toHaveLength(calib.controlPoints.length);
    expect(residuals.length).toBeGreaterThanOrEqual(8);
    const rms = Math.sqrt(residuals.reduce((s, d) => s + d * d, 0) / residuals.length);
    expect(rms).toBeLessThanOrEqual(calib.maxRms);
    expect(rms).toBeLessThanOrEqual(0.004);
  });
});
