import chaptersJson from './chapters.json';
import missionsJson from './missions.json';
import locationsJson from './locations.json';
import treasuresJson from './treasures.json';
import activitiesJson from './activities.json';
import itemRequestsJson from './itemRequests.json';
import missablesJson from './missables.json';
import mapMarkersJson from './mapMarkers.json';
import sourcesJson from './sources.json';
import collectiblesJson from './collectibles.json';
import collectibleSetsJson from './collectibleSets.json';
import challengesJson from './challenges.json';
import compendiumJson from './compendium.json';
import completionRequirementsJson from './completionRequirements.json';
import regionsJson from './regions.json';
import speciesIconsJson from './speciesIcons.json';
import type {
  Activity,
  Challenge,
  Chapter,
  Collectible,
  CollectibleSet,
  CompendiumEntry,
  CompendiumKind,
  CompletionRequirement,
  ItemRequest,
  Location,
  MapMarker,
  Mission,
  Missable,
  Region,
  SourceReference,
  TreasureChain,
} from '@/types';

export const chapters = chaptersJson as Chapter[];
export const missions = missionsJson as Mission[];
export const locations = locationsJson as Location[];
export const treasures = treasuresJson as TreasureChain[];
export const activities = activitiesJson as Activity[];
export const itemRequests = itemRequestsJson as ItemRequest[];
export const missables = missablesJson as Missable[];
export const explicitMapMarkers = mapMarkersJson as MapMarker[];
export const sources = sourcesJson as SourceReference[];
export const collectibles = collectiblesJson as Collectible[];
export const collectibleSets = collectibleSetsJson as CollectibleSet[];
export const challenges = challengesJson as Challenge[];
export const compendium = compendiumJson as CompendiumEntry[];
export const completionRequirements = completionRequirementsJson as CompletionRequirement[];
export const regions = regionsJson as Region[];
export const speciesIcons = speciesIconsJson as Record<string, string[]>;

export const chaptersById = new Map(chapters.map((c) => [c.id, c]));
export const missionsById = new Map(missions.map((m) => [m.id, m]));
export const locationsById = new Map(locations.map((l) => [l.id, l]));
export const treasuresById = new Map(treasures.map((t) => [t.id, t]));
export const activitiesById = new Map(activities.map((a) => [a.id, a]));
export const itemRequestsById = new Map(itemRequests.map((i) => [i.id, i]));
export const missablesById = new Map(missables.map((m) => [m.id, m]));
export const sourcesById = new Map(sources.map((s) => [s.id, s]));
export const compendiumById = new Map(compendium.map((c) => [c.id, c]));
export const regionsById = new Map(regions.map((r) => [r.id, r]));

export function getChapter(id: string): Chapter | undefined {
  return chaptersById.get(id);
}

export function getMission(id: string): Mission | undefined {
  return missionsById.get(id);
}

export function getLocation(id: string): Location | undefined {
  return locationsById.get(id);
}

export function getTreasure(id: string): TreasureChain | undefined {
  return treasuresById.get(id);
}

export function getSource(id: string): SourceReference | undefined {
  return sourcesById.get(id);
}

export function getCompendium(id: string): CompendiumEntry | undefined {
  return compendiumById.get(id);
}

export function compendiumByKind(kind: CompendiumKind): CompendiumEntry[] {
  return compendium.filter((c) => c.kind === kind);
}

export function missionsForChapter(chapterId: string): Mission[] {
  return missions
    .filter((m) => m.availability.displayChapterId === chapterId)
    .sort((a, b) => a.order - b.order);
}
