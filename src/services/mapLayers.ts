import {
  categoryFor,
  DEFAULT_HIDDEN_MARKER_TYPES,
  MARKER_CATEGORY_BY_TYPE,
  MARKER_TYPES,
} from '@/data/markerCategories';
import { markersForCompendium } from '@/services/content';
import type { MapMarker, MarkerType, UserEntityState, UserMissionState, UserTreasureState } from '@/types';

export function parseLayersParam(
  raw: string | null | undefined,
  fallbackHidden: readonly string[] = DEFAULT_HIDDEN_MARKER_TYPES,
): Set<MarkerType> {
  if (raw == null) {
    const hidden = new Set(fallbackHidden);
    return new Set(MARKER_TYPES.filter((t) => !hidden.has(t)));
  }
  if (!raw.trim()) return new Set();
  return new Set(
    raw
      .split(',')
      .map((s) => s.trim())
      .filter((s): s is MarkerType => MARKER_TYPES.includes(s as MarkerType)),
  );
}

export function serializeLayersParam(visible: Set<MarkerType>): string {
  return MARKER_TYPES.filter((t) => visible.has(t)).join(',');
}

export function hiddenFromVisible(visible: Set<MarkerType>): MarkerType[] {
  return MARKER_TYPES.filter((t) => !visible.has(t));
}

export function markerIsCollected(
  marker: MapMarker,
  entityStates: Map<string, UserEntityState>,
  missionStates?: Map<string, UserMissionState>,
  treasureStates?: Map<string, UserTreasureState>,
): boolean {
  const cat = categoryFor(marker.type);
  if (cat?.markEntity === 'compendium' && marker.compendiumId) {
    return Boolean(entityStates.get(`compendium:${marker.compendiumId}`)?.completed);
  }
  if (cat?.markEntity === 'compendium' || cat?.markEntity === 'map-marker') {
    return Boolean(entityStates.get(`map-marker:${marker.id}`)?.completed);
  }
  if (marker.missionId && missionStates?.get(marker.missionId)?.completed) return true;
  if (marker.treasureId && marker.treasureStepId) {
    const steps = treasureStates?.get(marker.treasureId)?.stepsCompleted ?? [];
    return steps.includes(marker.treasureStepId);
  }
  return false;
}

export function markerSearchHaystack(marker: MapMarker): string {
  const cat = MARKER_CATEGORY_BY_TYPE.get(marker.type);
  return [marker.title, marker.subtitle, marker.type, cat?.label, cat?.group]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function filterMapMarkers(opts: {
  markers: MapMarker[];
  visibleTypes: Set<MarkerType>;
  query?: string;
  hideCollected?: boolean;
  collectedIds?: Set<string>;
  forceMarkerId?: string;
  compendiumId?: string;
}): MapMarker[] {
  const q = opts.query?.trim().toLowerCase() ?? '';
  const searching = q.length > 0;
  const forced = opts.forceMarkerId ? opts.markers.find((m) => m.id === opts.forceMarkerId) : undefined;
  const visible = new Set(opts.visibleTypes);
  if (forced) visible.add(forced.type);
  const relatedIds = opts.compendiumId
    ? new Set(markersForCompendium(opts.compendiumId, opts.markers).map((m) => m.id))
    : null;

  return opts.markers.filter((m) => {
    if (opts.forceMarkerId && m.id === opts.forceMarkerId) return true;
    if (relatedIds) {
      return relatedIds.has(m.id);
    }
    if (searching) {
      if (!markerSearchHaystack(m).includes(q)) return false;
    } else if (!visible.has(m.type)) {
      return false;
    }
    if (opts.hideCollected && opts.collectedIds?.has(m.id)) return false;
    return true;
  });
}

export function countMarkersByType(markers: MapMarker[]): Map<MarkerType, number> {
  const counts = new Map<MarkerType, number>();
  for (const m of markers) {
    counts.set(m.type, (counts.get(m.type) ?? 0) + 1);
  }
  return counts;
}
