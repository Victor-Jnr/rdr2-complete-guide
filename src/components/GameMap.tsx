import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  CircleMarker,
  ImageOverlay,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import type { MapCoordinate, MapManifest, MapMarker, MarkerType } from '@/types';
import { DEFAULT_MANIFEST } from '@/data/mapManifest';
import { categoryFor, DENSE_MARKER_TYPES } from '@/data/markerCategories';
import { fromLeaflet, sourceBounds, tileBounds, toLeaflet } from '@/services/mapCoords';
import { MapMarkerPopup } from './MapMarkerPopup';
import 'leaflet/dist/leaflet.css';
import './GameMap.css';

const FLOOR_ZOOM = 0;
const MARKER_FOCUS_ZOOM = 3;
const DENSE_MIN_ZOOM = 2;
const FIT_PADDING = L.point(16, 16);

const iconCache = new Map<string, L.DivIcon>();

function pinIcon(type: MarkerType, collected: boolean, selected: boolean): L.DivIcon {
  const key = `${type}:${collected ? 1 : 0}:${selected ? 1 : 0}`;
  const cached = iconCache.get(key);
  if (cached) return cached;
  const color = categoryFor(type)?.color ?? '#8b2e2e';
  const icon = L.divIcon({
    className: `map-pin${collected ? ' is-collected' : ''}${selected ? ' is-selected' : ''}`,
    html: `<span class="map-pin__dot" style="background:${color}"></span>`,
    iconSize: selected ? [22, 22] : [18, 18],
    iconAnchor: selected ? [11, 11] : [9, 9],
  });
  iconCache.set(key, icon);
  return icon;
}

function overviewZoom(map: L.Map, bounds: L.LatLngBounds): number {
  const fitted = map.getBoundsZoom(bounds, false, FIT_PADDING);
  return Number.isFinite(fitted) ? fitted : FLOOR_ZOOM;
}

function OverviewCamera({
  bounds,
  followOverview,
}: {
  bounds: [[number, number], [number, number]];
  followOverview: boolean;
}) {
  const map = useMap();
  useEffect(() => {
    const llb = L.latLngBounds(bounds);
    const apply = (lockOverview: boolean) => {
      map.invalidateSize();
      const fitted = overviewZoom(map, llb);
      map.setMinZoom(fitted);
      if (lockOverview && followOverview) {
        map.setView(llb.getCenter(), fitted, { animate: false });
      } else if (map.getZoom() < fitted) {
        map.setZoom(fitted, { animate: false });
      }
    };
    apply(true);
    const onResize = () => apply(false);
    map.on('resize', onResize);
    return () => {
      map.off('resize', onResize);
    };
  }, [map, bounds, followOverview]);
  return null;
}

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

function ZoomGate({ minZoom, children }: { minZoom: number; children: ReactNode }) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());
  useEffect(() => {
    const onZoom = () => setZoom(map.getZoom());
    map.on('zoomend', onZoom);
    return () => {
      map.off('zoomend', onZoom);
    };
  }, [map]);
  if (zoom < minZoom) return null;
  return children;
}

function CalibrateLogger({ manifest, enabled }: { manifest: MapManifest; enabled: boolean }) {
  useMapEvents({
    click(e) {
      if (!enabled) return;
      const n = fromLeaflet(e.latlng, manifest);
      console.info('fromLeaflet(...)', n, { lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function MapPin({
  marker,
  latlng,
  selected,
  collected,
  onSelect,
}: {
  marker: MapMarker;
  latlng: [number, number];
  selected: boolean;
  collected: boolean;
  onSelect?: (m: MapMarker) => void;
}) {
  const ref = useRef<L.Marker>(null);
  useEffect(() => {
    const layer = ref.current;
    if (!layer) return;
    if (selected) {
      const id = window.setTimeout(() => layer.openPopup(), 0);
      return () => window.clearTimeout(id);
    }
    layer.closePopup();
    return undefined;
  }, [selected]);
  return (
    <Marker
      ref={ref}
      position={latlng}
      icon={pinIcon(marker.type, collected, selected)}
      eventHandlers={{ click: () => onSelect?.(marker) }}
    >
      <Tooltip>{marker.title}</Tooltip>
      {selected ? (
        <Popup>
          <MapMarkerPopup marker={marker} collected={collected} />
        </Popup>
      ) : null}
    </Marker>
  );
}

interface Props {
  markers?: MapMarker[];
  focusId?: string;
  staticPreview?: boolean;
  center?: MapCoordinate;
  height?: number | string;
  onSelect?: (marker: MapMarker) => void;
  selectedId?: string;
  manifest?: MapManifest;
  collectedIds?: Set<string>;
  calibrate?: boolean;
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
  collectedIds,
  calibrate = false,
}: Props) {
  const imageBounds = useMemo(() => sourceBounds(manifest), [manifest]);
  const worldBounds = useMemo(() => tileBounds(manifest), [manifest]);
  const focus = markers.find((m) => m.id === focusId);
  const start = center
    ? toLeaflet(center, manifest)
    : focus
      ? toLeaflet({ x: focus.x, y: focus.y }, manifest)
      : toLeaflet({ x: 0.5, y: 0.5 }, manifest);
  const maxZoom = manifest.maxNativeZoom;
  const startZoom = focus || center ? MARKER_FOCUS_ZOOM : 2;
  const followOverview = !staticPreview && !focus && !center;
  const size = typeof height === 'number' ? `${height}px` : height;
  const sparse = useMemo(() => markers.filter((m) => !DENSE_MARKER_TYPES.has(m.type)), [markers]);
  const dense = useMemo(() => markers.filter((m) => DENSE_MARKER_TYPES.has(m.type)), [markers]);

  return (
    <div style={{ height: size, border: '1px solid var(--rule)' }}>
      <MapContainer
        crs={L.CRS.Simple}
        center={start}
        zoom={startZoom}
        minZoom={FLOOR_ZOOM}
        maxZoom={maxZoom}
        zoomSnap={0}
        zoomDelta={1}
        zoomAnimation={false}
        preferCanvas
        style={{ height: '100%', width: '100%', background: '#cbb892' }}
        maxBounds={imageBounds}
        maxBoundsViscosity={1}
        attributionControl={!staticPreview}
        zoomControl={!staticPreview}
        dragging={!staticPreview}
        scrollWheelZoom={!staticPreview}
      >
        {staticPreview ? (
          <ImageOverlay url={manifest.previewUrl} bounds={imageBounds} />
        ) : (
          <TileLayer
            url={manifest.tileUrlTemplate}
            tileSize={manifest.tileSize}
            noWrap
            detectRetina={false}
            maxNativeZoom={manifest.maxNativeZoom}
            maxZoom={maxZoom}
            minZoom={FLOOR_ZOOM}
            bounds={worldBounds}
          />
        )}
        {sparse.map((m) => {
          const latlng = toLeaflet({ x: m.x, y: m.y }, manifest);
          const selected = m.id === selectedId || m.id === focusId;
          const collected = collectedIds?.has(m.id) ?? false;
          return (
            <MapPin
              key={m.id}
              marker={m}
              latlng={latlng}
              selected={selected}
              collected={collected}
              onSelect={onSelect}
            />
          );
        })}
        <ZoomGate minZoom={DENSE_MIN_ZOOM}>
          {dense.map((m) => {
            const latlng = toLeaflet({ x: m.x, y: m.y }, manifest);
            const selected = m.id === selectedId || m.id === focusId;
            const collected = collectedIds?.has(m.id) ?? false;
            const color = categoryFor(m.type)?.color ?? '#6a8f4e';
            return (
              <CircleMarker
                key={m.id}
                center={latlng}
                radius={selected ? 7 : 4}
                pathOptions={{
                  color: selected ? '#8b2e2e' : color,
                  fillColor: color,
                  fillOpacity: collected ? 0.25 : 0.7,
                  weight: selected ? 2 : 1,
                  opacity: collected ? 0.4 : 0.9,
                }}
                eventHandlers={{
                  click: () => onSelect?.(m),
                }}
              >
                <Tooltip>{m.title}</Tooltip>
                {selected ? (
                  <Popup>
                    <MapMarkerPopup marker={m} collected={collected} />
                  </Popup>
                ) : null}
              </CircleMarker>
            );
          })}
        </ZoomGate>
        {!staticPreview ? <OverviewCamera bounds={imageBounds} followOverview={followOverview} /> : null}
        <Focus marker={focus} manifest={manifest} />
        {calibrate ? <CalibrateLogger manifest={manifest} enabled /> : null}
      </MapContainer>
    </div>
  );
}
