import type { CompendiumEntry, CompendiumKind, Location, RegionId, UserEntityState } from '@/types';

export const COMPENDIUM_KIND_TABS: { id: CompendiumKind; label: string }[] = [
  { id: 'animal', label: 'Animals' },
  { id: 'legendary-animal', label: 'Legendary Animals' },
  { id: 'fish', label: 'Fish' },
  { id: 'legendary-fish', label: 'Legendary Fish' },
  { id: 'plant', label: 'Plants and Herbs' },
];

const TAB_KIND_IDS = new Set<string>(COMPENDIUM_KIND_TABS.map((t) => t.id));

const REGION_IDS = new Set<RegionId>([
  'ambarino',
  'new-hanover',
  'lemoyne',
  'west-elizabeth',
  'new-austin',
  'guarma',
]);

export function parseKindParam(raw: string | null): CompendiumKind {
  if (raw && TAB_KIND_IDS.has(raw)) return raw as CompendiumKind;
  return 'animal';
}

export function parseRegionParam(raw: string | null): RegionId | null {
  if (raw && REGION_IDS.has(raw as RegionId)) return raw as RegionId;
  return null;
}

export function markLabelForKind(kind: CompendiumKind): string {
  if (kind === 'plant') return 'Collected';
  if (kind === 'fish' || kind === 'legendary-fish') return 'Caught';
  if (kind === 'legendary-animal') return 'Hunted';
  return 'Studied';
}

export function filterCompendiumEntries(
  entries: CompendiumEntry[],
  opts: {
    kind?: CompendiumKind | null;
    region?: RegionId | null;
    query?: string;
    incompleteOnly?: boolean;
    completedIds?: Set<string>;
  },
): CompendiumEntry[] {
  const q = opts.query?.trim().toLowerCase() ?? '';
  return entries.filter((e) => {
    if (opts.kind && e.kind !== opts.kind) return false;
    if (opts.region && !e.generalLocation?.regionIds.includes(opts.region)) return false;
    if (q) {
      const hay = [
        e.title,
        e.familyTitle,
        e.generalLocation?.summary,
        ...(e.generalLocation?.namedPlaces ?? []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (opts.incompleteOnly && opts.completedIds?.has(e.id)) return false;
    return true;
  });
}

export function groupCompendiumByFamily(entries: CompendiumEntry[]): { family: string; entries: CompendiumEntry[] }[] {
  const groups = new Map<string, CompendiumEntry[]>();
  for (const e of entries) {
    const family = e.familyTitle ?? e.title;
    const list = groups.get(family) ?? [];
    list.push(e);
    groups.set(family, list);
  }
  return [...groups.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([family, grouped]) => ({ family, entries: grouped }));
}

export function isCompendiumComplete(entityStates: Map<string, UserEntityState>, entryId: string): boolean {
  return Boolean(entityStates.get(`compendium:${entryId}`)?.completed);
}

export function locationIdForNamedPlace(
  name: string,
  locationIds: string[] | undefined,
  locationsById: Map<string, Location>,
): string | undefined {
  return locationIds?.find((id) => locationsById.get(id)?.name === name);
}
