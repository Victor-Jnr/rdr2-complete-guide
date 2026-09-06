import { describe, expect, it } from 'vitest';
import { explicitMapMarkers } from '@/data';
import { derivedMarkers, explicitExternalKeysUnique } from '@/services/content';
import {
  DEFAULT_HIDDEN_MARKER_TYPES,
  MARKER_TYPES,
} from '@/data/markerCategories';
import {
  filterMapMarkers,
  hiddenFromVisible,
  markerIsCollected,
  parseLayersParam,
  serializeLayersParam,
} from '@/services/mapLayers';
import { markerMarkAction, markerPopupLinks } from '@/services/mapPopup';
import { overallCategories, pinnedMapCategories } from '@/services/progress';
import { missions, treasures } from '@/data';
import { parseExport } from '@/services/exportImport';
import type { MapMarker, UserEntityState } from '@/types';

function sampleMarker(partial: Partial<MapMarker> & Pick<MapMarker, 'id' | 'type' | 'title'>): MapMarker {
  return { x: 0.5, y: 0.5, ...partial };
}

describe('map markers', () => {
  it('merges explicit pins with derived mission/treasure markers', () => {
    const all = derivedMarkers();
    expect(explicitMapMarkers.length).toBeGreaterThan(1000);
    expect(all.length).toBeGreaterThan(explicitMapMarkers.length);
    expect(all.some((m) => m.id.startsWith('marker-jr-'))).toBe(true);
    expect(all.some((m) => m.id.startsWith('marker-mission-'))).toBe(true);
    expect(explicitExternalKeysUnique()).toBe(true);
  });
});

describe('layer filtering', () => {
  it('round-trips visible types through the layers query param', () => {
    const visible = parseLayersParam(undefined, DEFAULT_HIDDEN_MARKER_TYPES);
    expect(visible.has('dinosaur-bone')).toBe(true);
    expect(visible.has('animal-habitat')).toBe(false);
    const raw = serializeLayersParam(visible);
    const again = parseLayersParam(raw, []);
    expect([...again].sort()).toEqual([...visible].sort());
    expect(hiddenFromVisible(visible)).toEqual([...DEFAULT_HIDDEN_MARKER_TYPES]);
    expect([...parseLayersParam('')].length).toBe(0);
    expect(serializeLayersParam(new Set())).toBe('');
  });

  it('keeps a deep-linked marker visible and filters by search, collected, and type', () => {
    const markers = [
      sampleMarker({ id: 'a', type: 'dinosaur-bone', title: 'Bone A' }),
      sampleMarker({ id: 'b', type: 'dinosaur-bone', title: 'Bone B' }),
      sampleMarker({ id: 'c', type: 'herb', title: 'Yarrow' }),
    ];
    const visible = new Set<typeof MARKER_TYPES[number]>(['dinosaur-bone']);
    const collected = new Set(['a']);
    const filtered = filterMapMarkers({
      markers,
      visibleTypes: visible,
      query: 'bone',
      hideCollected: true,
      collectedIds: collected,
      forceMarkerId: 'c',
    });
    expect(filtered.map((m) => m.id).sort()).toEqual(['b', 'c']);
  });
});

describe('popup actions', () => {
  it('maps links and mark actions by marker type', () => {
    const mission = sampleMarker({
      id: 'm1',
      type: 'mission-start',
      title: 'A mission',
      missionId: 'mission-outlaws-from-the-west',
      locationId: 'loc-colter',
    });
    expect(markerPopupLinks(mission).map((l) => l.label)).toEqual(['Open Mission', 'Open Details']);
    expect(markerMarkAction(mission)).toBeUndefined();

    const bone = sampleMarker({
      id: 'bone-1',
      type: 'dinosaur-bone',
      title: 'Dinosaur Bone (map #1)',
      collectibleSetId: 'set-dinosaur-bones',
    });
    expect(markerPopupLinks(bone).some((l) => l.label === 'Open Collectible set')).toBe(true);
    expect(markerMarkAction(bone)).toEqual({
      label: 'Mark found',
      entityType: 'map-marker',
      entityId: 'bone-1',
    });

    const legend = sampleMarker({
      id: 'leg-1',
      type: 'legendary-animal',
      title: 'Legendary Beaver',
      compendiumId: 'comp-leg-animal-legendary-beaver',
    });
    expect(markerPopupLinks(legend).some((l) => l.href === '/compendium/comp-leg-animal-legendary-beaver')).toBe(true);
    expect(markerMarkAction(legend)).toEqual({
      label: 'Mark hunted',
      entityType: 'compendium',
      entityId: 'comp-leg-animal-legendary-beaver',
    });
  });
});

describe('pinned map progress', () => {
  it('counts completed map-marker and legendary pins separately', () => {
    const markers = derivedMarkers();
    const bones = markers.filter((m) => m.type === 'dinosaur-bone');
    expect(bones.length).toBe(30);
    const entityStates = new Map<string, UserEntityState>([
      [
        `map-marker:${bones[0]!.id}`,
        {
          entityType: 'map-marker',
          entityId: bones[0]!.id,
          completed: true,
          updatedAt: '2026-09-06T00:00:00.000Z',
        },
      ],
    ]);
    const cats = pinnedMapCategories(markers, entityStates);
    const boneCat = cats.find((c) => c.id === 'pin-bones');
    expect(boneCat?.total).toBe(30);
    expect(boneCat?.done).toBe(1);
    expect(markerIsCollected(bones[0]!, entityStates)).toBe(true);

    const overall = overallCategories(missions, treasures, new Map(), new Map(), entityStates, {
      campIds: [],
      companionIds: [],
      itemTotal: 0,
      missableTotal: 0,
      mapMarkers: markers,
    });
    expect(overall.some((c) => c.id === 'pin-pois' && c.total === 49)).toBe(true);
  });
});

describe('settings export compatibility', () => {
  it('accepts schemaVersion 1 exports that omit new map settings keys', () => {
    const res = parseExport({
      schemaVersion: 1,
      exportedAt: '2026-09-06T00:00:00.000Z',
      missions: [],
      treasures: [],
      entities: [],
      favorites: [],
      settings: {
        theme: 'campfire',
        textSize: 'm',
        textureIntensity: 'medium',
        confirmOnUncheck: true,
        hideCompletedByDefault: false,
        fullResMapDownloaded: false,
      },
    });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.settings.mapHiddenMarkerTypes).toEqual(['animal-habitat', 'herb']);
      expect(res.data.settings.mapHideCollected).toBe(false);
    }
  });
});
