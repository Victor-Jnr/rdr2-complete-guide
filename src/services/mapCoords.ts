/**
 * Normalized coordinates (0–1) are relative to the source map image
 * (manifest.width × manifest.height), origin top-left, x right, y down.
 *
 * Tiles are a 2^maxNativeZoom × tileSize padded square. Leaflet CRS.Simple
 * scale is 2^zoom, so coordinates are divided by 2^maxNativeZoom:
 *   zoom 0 → one 256px tile (whole map)
 *   zoom maxNativeZoom → 1 source pixel per CSS pixel
 *
 * Padding sits on the bottom and right and is not part of the 0–1 space.
 */
import type { MapCoordinate, MapManifest } from '@/types';

export function nativeScale(manifest: MapManifest): number {
  return 2 ** manifest.maxNativeZoom;
}

export function toLeaflet(coord: MapCoordinate, manifest: MapManifest): [number, number] {
  const scale = nativeScale(manifest);
  const leafletY = -(coord.y * manifest.height) / scale;
  const leafletX = (coord.x * manifest.width) / scale;
  return [leafletY, leafletX];
}

export function fromLeaflet(
  latlng: { lat: number; lng: number },
  manifest: MapManifest,
): MapCoordinate {
  const scale = nativeScale(manifest);
  return {
    x: (latlng.lng * scale) / manifest.width,
    y: (-latlng.lat * scale) / manifest.height,
  };
}

export function paddedMapSize(manifest: MapManifest): number {
  return manifest.tileSize * 2 ** manifest.maxNativeZoom;
}

/** Source-image bounds in Leaflet units (no padding). */
export function sourceBounds(manifest: MapManifest): [[number, number], [number, number]] {
  const scale = nativeScale(manifest);
  return [
    [-manifest.height / scale, 0],
    [0, manifest.width / scale],
  ];
}

/** Padded tile-pyramid bounds in Leaflet units (zoom 0 is one tile). */
export function tileBounds(manifest: MapManifest): [[number, number], [number, number]] {
  const units = manifest.tileSize;
  return [
    [-units, 0],
    [0, units],
  ];
}

export function isNormalized(coord: MapCoordinate): boolean {
  return coord.x >= 0 && coord.x <= 1 && coord.y >= 0 && coord.y <= 1;
}
