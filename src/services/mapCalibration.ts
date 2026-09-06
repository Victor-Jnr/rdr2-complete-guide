/** Affine jeanropke Leaflet (lat, lng) → normalized 0–1 map coords. */

export interface AffineTransform {
  kind?: string;
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
}

export interface CalibrationImage {
  width: number;
  height: number;
  tileSize: number;
  maxNativeZoom: number;
}

export interface CalibrationControlPoint {
  id: string;
  jeanropke: { lat: number; lng: number };
  tile: { z: number; x: number; y: number };
}

export interface CalibrationFile {
  image: CalibrationImage;
  controlPoints: CalibrationControlPoint[];
  maxRms: number;
  transform: AffineTransform;
}

export function tileToNormalized(
  tileX: number,
  tileY: number,
  image: CalibrationImage,
): { x: number; y: number } {
  return {
    x: (tileX * image.tileSize) / image.width,
    y: (tileY * image.tileSize) / image.height,
  };
}

/** x = a*lng + b*lat + c ; y = d*lng + e*lat + f */
export function applyJeanropkeTransform(
  lat: number,
  lng: number,
  t: AffineTransform,
): { x: number; y: number } {
  return {
    x: t.a * lng + t.b * lat + t.c,
    y: t.d * lng + t.e * lat + t.f,
  };
}

export function calibrationResiduals(calib: CalibrationFile) {
  return calib.controlPoints.map((p) => {
    const expected = tileToNormalized(p.tile.x, p.tile.y, calib.image);
    const got = applyJeanropkeTransform(p.jeanropke.lat, p.jeanropke.lng, calib.transform);
    const dx = got.x - expected.x;
    const dy = got.y - expected.y;
    return { id: p.id, dx, dy, distance: Math.hypot(dx, dy), got, expected };
  });
}

export function rmsDistance(residuals: { distance: number }[]): number {
  if (!residuals.length) return 0;
  return Math.sqrt(residuals.reduce((s, r) => s + r.distance * r.distance, 0) / residuals.length);
}
