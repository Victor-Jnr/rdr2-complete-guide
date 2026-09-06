import type { CompletionRequirement, MapMarker, Mission, TreasureChain } from '@/types';
import type { UserEntityState, UserMissionState, UserTreasureState } from '@/types';
import { markerIsCollected } from '@/services/mapLayers';

export interface CategoryCount {
  id: string;
  label: string;
  done: number;
  total: number;
}

export interface ChapterProgress {
  chapterId: string;
  categories: CategoryCount[];
}

const MAIN = new Set(['main-story']);
const OPTIONAL = new Set(['optional-story', 'other-optional']);
const STRANGER = new Set(['stranger']);
const DEBT = new Set(['debt-collection']);

function hasTag(mission: Mission, tags: Set<string>): boolean {
  return mission.tags.some((t) => tags.has(t));
}

function missionDone(state: UserMissionState | undefined): boolean {
  return Boolean(state?.completed);
}

export function countMissions(
  list: Mission[],
  states: Map<string, UserMissionState>,
  pred: (m: Mission) => boolean,
): CategoryCount {
  const filtered = list.filter(pred);
  const done = filtered.filter((m) => missionDone(states.get(m.id))).length;
  return { id: 'custom', label: 'Missions', done, total: filtered.length };
}

export function overallCategories(
  missions: Mission[],
  treasures: TreasureChain[],
  missionStates: Map<string, UserMissionState>,
  treasureStates: Map<string, UserTreasureState>,
  entityStates: Map<string, UserEntityState>,
  extras: {
    campIds: string[];
    companionIds: string[];
    itemTotal: number;
    missableTotal: number;
    mapMarkers?: MapMarker[];
  },
): CategoryCount[] {
  const main = missions.filter((m) => hasTag(m, MAIN));
  const optional = missions.filter((m) => hasTag(m, OPTIONAL) || hasTag(m, DEBT));
  const stranger = missions.filter((m) => hasTag(m, STRANGER));
  const goldTotal = missions.reduce((n, m) => n + (m.goldRequirements?.length ?? 0), 0);
  const goldDone = missions.reduce((n, m) => {
    const st = missionStates.get(m.id);
    return n + (st?.goldRequirementsCompleted.length ?? 0);
  }, 0);
  const missableMissionItems = missions.reduce((n, m) => n + (m.missables?.length ?? 0), 0);
  const missableMissionDone = missions.reduce((n, m) => {
    const st = missionStates.get(m.id);
    return n + (st?.missablesObtained.length ?? 0);
  }, 0);
  const treasureSteps = treasures.reduce((n, t) => n + t.steps.length, 0);
  const treasureStepsDone = treasures.reduce((n, t) => {
    const st = treasureStates.get(t.id);
    return n + (st?.stepsCompleted.length ?? 0);
  }, 0);
  const treasureChainsDone = treasures.filter((t) => treasureStates.get(t.id)?.completed).length;
  const campIds = new Set(extras.campIds);
  const companionIds = new Set(extras.companionIds);
  const campDone = [...entityStates.values()].filter(
    (e) => e.entityType === 'activity' && e.completed && campIds.has(e.entityId),
  ).length;
  const companionDone = [...entityStates.values()].filter(
    (e) => e.entityType === 'activity' && e.completed && companionIds.has(e.entityId),
  ).length;
  const itemDone = [...entityStates.values()].filter(
    (e) => e.entityType === 'itemRequest' && e.completed,
  ).length;

  return [
    { id: 'main', label: 'Main Missions', done: main.filter((m) => missionDone(missionStates.get(m.id))).length, total: main.length },
    { id: 'optional', label: 'Optional Missions', done: optional.filter((m) => missionDone(missionStates.get(m.id))).length, total: optional.length },
    { id: 'stranger', label: 'Stranger Content', done: stranger.filter((m) => missionDone(missionStates.get(m.id))).length, total: stranger.length },
    { id: 'companion', label: 'Companion Activities', done: companionDone, total: extras.companionIds.length },
    { id: 'camp', label: 'Camp Activities', done: campDone, total: extras.campIds.length },
    { id: 'items', label: 'Item Requests', done: itemDone, total: extras.itemTotal },
    { id: 'missables', label: 'Missables', done: missableMissionDone, total: missableMissionItems + extras.missableTotal },
    { id: 'gold', label: 'Gold Medals', done: goldDone, total: goldTotal },
    { id: 'treasure-chains', label: 'Treasure Chains', done: treasureChainsDone, total: treasures.length },
    { id: 'treasure-steps', label: 'Treasure Steps', done: treasureStepsDone, total: treasureSteps },
    ...pinnedMapCategories(extras.mapMarkers ?? [], entityStates),
  ];
}

export function pinnedMapCategories(
  markers: MapMarker[],
  entityStates: Map<string, UserEntityState>,
): CategoryCount[] {
  const groups: { id: string; label: string; type: MapMarker['type'] }[] = [
    { id: 'pin-bones', label: 'Dinosaur Bones', type: 'dinosaur-bone' },
    { id: 'pin-dreamcatchers', label: 'Dreamcatchers', type: 'dreamcatcher' },
    { id: 'pin-carvings', label: 'Rock Carvings', type: 'rock-carving' },
    { id: 'pin-graves', label: 'Graves', type: 'grave' },
    { id: 'pin-pois', label: 'Points of Interest', type: 'point-of-interest' },
    { id: 'pin-chests', label: 'Wilderness Chests', type: 'wilderness-chest' },
    { id: 'pin-leg-animals', label: 'Legendary Animals', type: 'legendary-animal' },
    { id: 'pin-leg-fish', label: 'Legendary Fish', type: 'legendary-fish' },
  ];
  return groups.map((g) => {
    const list = markers.filter((m) => m.type === g.type);
    const done = list.filter((m) => markerIsCollected(m, entityStates)).length;
    return { id: g.id, label: g.label, done, total: list.length };
  });
}

export function evaluateCompletionRequirement(
  req: CompletionRequirement,
  context: { completedEntityIds: Set<string> },
): { done: number; total: number; complete: boolean } {
  if (req.entityIds?.length) {
    const done = req.entityIds.filter((id: string) => context.completedEntityIds.has(id)).length;
    const total = req.entityIds.length;
    return { done, total, complete: done >= total };
  }
  const total = req.targetCount ?? 1;
  const done = context.completedEntityIds.has(req.id) ? total : 0;
  return { done, total, complete: done >= total };
}

export function percent(done: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((done / total) * 100);
}
