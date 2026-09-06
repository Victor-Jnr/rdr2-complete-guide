import { describe, expect, it } from 'vitest';
import { compendium } from '@/data';
import { derivedMarkers, markersForCompendium } from '@/services/content';
import {
  filterCompendiumEntries,
  groupCompendiumByFamily,
  parseKindParam,
  parseRegionParam,
} from '@/services/compendium';
import { filterMapMarkers } from '@/services/mapLayers';
import { overallCategories } from '@/services/progress';
import { searchGuide } from '@/services/search';
import { missions, treasures } from '@/data';
import type { UserEntityState } from '@/types';

describe('compendium filters', () => {
  it('parses kind and region query params with defaults', () => {
    expect(parseKindParam(null)).toBe('animal');
    expect(parseKindParam('plant')).toBe('plant');
    expect(parseKindParam('weapon')).toBe('animal');
    expect(parseRegionParam(null)).toBeNull();
    expect(parseRegionParam('lemoyne')).toBe('lemoyne');
    expect(parseRegionParam('nowhere')).toBeNull();
  });

  it('filters plants in Lemoyne and groups animals by family', () => {
    const plants = filterCompendiumEntries(compendium, { kind: 'plant', region: 'lemoyne' });
    expect(plants.length).toBeGreaterThan(0);
    expect(plants.every((e) => e.kind === 'plant' && e.generalLocation?.regionIds.includes('lemoyne'))).toBe(true);
    expect(plants.some((e) => e.id === 'comp-plant-yarrow')).toBe(true);

    const animals = filterCompendiumEntries(compendium, { kind: 'animal', query: 'alligator' });
    const groups = groupCompendiumByFamily(animals);
    expect(groups.some((g) => g.family === 'Alligator' && g.entries.length >= 2)).toBe(true);

    const incomplete = filterCompendiumEntries(animals, {
      incompleteOnly: true,
      completedIds: new Set(['comp-animal-american-alligator']),
    });
    expect(incomplete.some((e) => e.id === 'comp-animal-american-alligator')).toBe(false);
  });
});

describe('markersForCompendium', () => {
  it('includes habitat icons that map to a variety even when the pin stores a sibling id', () => {
    const markers = derivedMarkers();
    const small = markersForCompendium('comp-animal-american-alligator-small', markers);
    expect(small.length).toBeGreaterThan(0);
    expect(small.some((m) => m.externalKey?.includes('animal_alligator'))).toBe(true);

    const filtered = filterMapMarkers({
      markers,
      visibleTypes: new Set(),
      compendiumId: 'comp-animal-american-alligator-small',
    });
    expect(filtered.map((m) => m.id).sort()).toEqual(small.map((m) => m.id).sort());
  });
});

describe('compendium progress and search', () => {
  it('counts studied animals separately from pin categories', () => {
    const animals = compendium.filter((e) => e.kind === 'animal');
    const entityStates = new Map<string, UserEntityState>([
      [
        `compendium:${animals[0]!.id}`,
        {
          entityType: 'compendium',
          entityId: animals[0]!.id,
          completed: true,
          updatedAt: '2026-09-06T00:00:00.000Z',
        },
      ],
    ]);
    const cats = overallCategories(missions, treasures, new Map(), new Map(), entityStates, {
      campIds: [],
      companionIds: [],
      itemTotal: 0,
      missableTotal: 0,
      mapMarkers: derivedMarkers(),
      compendium,
    });
    const studied = cats.find((c) => c.id === 'comp-animals');
    const pinLegend = cats.find((c) => c.id === 'pin-leg-animals');
    expect(studied?.total).toBe(animals.length);
    expect(studied?.done).toBe(1);
    expect(pinLegend?.total).toBeGreaterThan(0);
    expect(cats.find((c) => c.id === 'comp-plants')?.total).toBeGreaterThan(0);
  });

  it('sends search hits to the Compendium entry route', () => {
    const byTitle = searchGuide('American Alligator').find((h) => h.id === 'compendium:comp-animal-american-alligator');
    expect(byTitle?.href).toBe('/compendium/comp-animal-american-alligator');
    const byPlace = searchGuide('Bayou Nwa').find((h) => h.id === 'compendium:comp-animal-american-alligator');
    expect(byPlace?.href).toBe('/compendium/comp-animal-american-alligator');
  });
});
