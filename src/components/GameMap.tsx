import { useEffect, useMemo } from 'react';
import { CircleMarker, ImageOverlay, MapContainer, TileLayer, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { MapCoordinate, MapManifest, MapMarker } from '@/types';
import { DEFAULT_MANIFEST } from '@/data/mapManifest';
import { sourceBounds, tileBounds, toLeaflet } from '@/services/mapCoords';
import { MapMarkerPopup } from './MapMarkerPopup';
import 'leaflet/dist/leaflet.css';

const OVERVIEW_ZOOM = 0;
const MARKER_FOCUS_ZOOM = 3;

function Focus({
  marker,
  manifest,
}: {
  marker?: MapMarker;
  manifest: MapManifest;
}) {
  const map = useMap();
  useEffect(() => {
    if (!marker) return;
    const [y, x] = toLeaflet({ x: marker.x, y: marker.y }, manifest);
    map.flyTo([y, x], Math.max(map.getZoom(), MARKER_FOCUS_ZOOM), { duration: 0.8 });
  }, [marker, map, manifest]);
  return null;
}

interface Props {
  markers?: MapMarker[];
  focusId?: string;
  staticPreview?: boolean;
  center?: MapCoordinate;
  height?: number;
  onSelect?: (marker: MapMarker) => void;
  selectedId?: string;
  manifest?: MapManifest;
}

export function GameMap({
  markers = [],
  focusId,
  staticPreview,
  center,
  height = 360,
  onSelect,
  selectedId,
  manifest = DEFAULT_MANIFEST,
}: Props) {
  const imageBounds = useMemo(() => sourceBounds(manifest), [manifest]);
  const worldBounds = useMemo(() => tileBounds(manifest), [manifest]);
  const focus = markers.find((m) => m.id === focusId);
  const start = center
    ? toLeaflet(center, manifest)
    : focus
      ? toLeaflet({ x: focus.x, y: focus.y }, manifest)
      : toLeaflet({ x: 0.5, y: 0.5 }, manifest);
  const maxZoom = manifest.maxNativeZoom + 2;
  const startZoom = focus || center ? MARKER_FOCUS_ZOOM : OVERVIEW_ZOOM;

  return (
    <div style={{ height, border: '1px solid var(--rule)' }}>
      <MapContainer
        crs={L.CRS.Simple}
        center={start}
        zoom={startZoom}
        minZoom={OVERVIEW_ZOOM}
        maxZoom={maxZoom}
        zoomSnap={1}
        zoomDelta={1}
        style={{ height: '100%', width: '100%', background: '#cbb892' }}
        maxBounds={worldBounds}
        maxBoundsViscosity={0.6}
        attributionControl={!staticPreview}
        zoomControl={!staticPreview}
        dragging={!staticPreview}
        scrollWheelZoom={!staticPreview}
      >
        <ImageOverlay url={manifest.previewUrl} bounds={imageBounds} opacity={0.95} />
        {!staticPreview ? (
          <TileLayer
            url={manifest.tileUrlTemplate}
            tileSize={manifest.tileSize}
            noWrap
            maxNativeZoom={manifest.maxNativeZoom}
            maxZoom={maxZoom}
            minZoom={OVERVIEW_ZOOM}
            bounds={worldBounds}
            errorTileUrl={manifest.previewUrl}
          />
        ) : null}
        {markers.map((m) => {
          const latlng = toLeaflet({ x: m.x, y: m.y }, manifest);
          const selected = m.id === selectedId || m.id === focusId;
          return (
            <CircleMarker
              key={m.id}
              center={latlng}
              radius={selected ? 10 : 6}
              pathOptions={{
                color: selected ? '#8b2e2e' : '#3d2a1f',
                fillColor: selected ? '#c4a35a' : '#8b2e2e',
                fillOpacity: 0.9,
                weight: 2,
              }}
              eventHandlers={{
                click: () => onSelect?.(m),
              }}
            >
              <Tooltip>{m.title}</Tooltip>
              {selected ? (
                <Tooltip permanent>
                  <MapMarkerPopup marker={m} />
                </Tooltip>
              ) : null}
            </CircleMarker>
          );
        })}
        <Focus marker={focus} manifest={manifest} />
      </MapContainer>
    </div>
  );
}
