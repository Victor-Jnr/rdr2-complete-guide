import type { MapMarker, MarkerType, Mission, TreasureChain } from '@/types';
import { explicitMapMarkers, locationsById, missions, speciesIcons, treasures } from '@/data';

const missionMarkerType = (mission: Mission): MarkerType => {
  if (mission.tags.includes('stranger') || mission.tags.includes('bounty')) return 'stranger';
  if (mission.tags.includes('camp-activity')) return 'camp-activity';
  if (mission.tags.includes('item-request')) return 'item-request';
  if (mission.tags.includes('robbery')) return 'robbery';
  if (mission.tags.includes('missable')) return 'missable';
  return 'mission-start';
};

const stepMarkerType = (type: TreasureChain['steps'][number]['type']): MarkerType => {
  if (type === 'map-pickup') return 'treasure-map';
  if (type === 'treasure' || type === 'reward') return 'final-treasure';
  return 'treasure-clue';
};

export function derivedMarkers(): MapMarker[] {
  const markers: MapMarker[] = [...explicitMapMarkers];
  const seen = new Set(markers.map((m) => m.id));

  for (const mission of missions) {
    if (!mission.startLocationId) continue;
    const loc = locationsById.get(mission.startLocationId);
    if (!loc?.coordinate) continue;
    const id = `marker-mission-${mission.id}`;
    if (seen.has(id)) continue;
    seen.add(id);
    markers.push({
      id,
      type: missionMarkerType(mission),
      title: mission.title,
      subtitle: loc.name,
      locationId: loc.id,
      x: loc.coordinate.x,
      y: loc.coordinate.y,
      missionId: mission.id,
      chapterIds: [mission.availability.displayChapterId],
      tags: mission.tags,
    });
  }

  for (const chain of treasures) {
    for (const step of chain.steps) {
      if (!step.locationId) continue;
      const loc = locationsById.get(step.locationId);
      if (!loc?.coordinate) continue;
      const id = `marker-treasure-${chain.id}-${step.id}`;
      if (seen.has(id)) continue;
      seen.add(id);
      markers.push({
        id,
        type: stepMarkerType(step.type),
        title: `${chain.name}: ${step.title}`,
        subtitle: loc.name,
        locationId: loc.id,
        x: loc.coordinate.x,
        y: loc.coordinate.y,
        treasureId: chain.id,
        treasureStepId: step.id,
        chapterIds: [chain.availability.displayChapterId],
      });
    }
  }

  return markers;
}

export function markerById(id: string): MapMarker | undefined {
  return derivedMarkers().find((m) => m.id === id);
}

export function explicitExternalKeysUnique(markers: MapMarker[] = explicitMapMarkers): boolean {
  const keys = markers.map((m) => m.externalKey).filter((k): k is string => Boolean(k));
  return new Set(keys).size === keys.length;
}

export function markersForCompendium(entryId: string, markers: MapMarker[] = derivedMarkers()): MapMarker[] {
  const iconKeys = Object.entries(speciesIcons)
    .filter(([, ids]) => ids.includes(entryId))
    .map(([key]) => key);
  return markers.filter((m) => {
    if (m.compendiumId === entryId) return true;
    const icon = m.externalKey?.split(':')[1] ?? m.externalKey;
    return Boolean(icon && iconKeys.includes(icon));
  });
}

export function pinCountsByCompendium(markers: MapMarker[] = derivedMarkers()): Map<string, number> {
  const counts = new Map<string, number>();
  for (const m of markers) {
    const ids = new Set<string>();
    if (m.compendiumId) ids.add(m.compendiumId);
    const icon = m.externalKey?.split(':')[1];
    const mapped = icon ? speciesIcons[icon] : undefined;
    if (mapped) {
      for (const id of mapped) ids.add(id);
    }
    for (const id of ids) counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return counts;
}
