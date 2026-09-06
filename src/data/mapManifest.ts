import type { MapManifest } from '@/types';

export const DEFAULT_MANIFEST: MapManifest = {
  width: 7200,
  height: 5400,
  tileSize: 256,
  maxNativeZoom: 5,
  tileUrlTemplate: '/assets/maps/tiles/{z}/{x}/{y}.webp',
  previewUrl: '/assets/maps/preview.webp',
  attribution:
    'In-game map imagery © Rockstar Games / Take-Two Interactive. Sourced from the Red Dead Wiki for this non-commercial fan project.',
};
