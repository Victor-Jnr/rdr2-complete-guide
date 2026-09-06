import type { MapMarker, MarkerType, Mission, TreasureChain } from '@/types';
import { explicitMapMarkers, locationsById, missions, treasures } from '@/data';

const missionMarkerType = (mission: Mission): MarkerType => {
  if (mission.tags.includes('stranger')) return 'stranger';
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
