import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'src', 'data');

function load<T>(name: string): T {
  return JSON.parse(readFileSync(join(dataDir, name), 'utf8')) as T;
}

interface Research {
  verificationStatus: string;
  sourceIds: string[];
}

interface Availability {
  displayChapterId: string;
  availableChapterIds?: string[];
  earliestChapterId?: string;
  latestChapterId?: string;
  earliestMissionId?: string;
  latestMissionId?: string;
  missableAfterMissionId?: string;
}

interface Source {
  id: string;
  sourceName: string;
  url?: string;
}

const chapters = load<{ id: string; order: number }[]>('chapters.json');
const missions = load<
  {
    id: string;
    chapterId: string;
    prerequisiteMissionIds?: string[];
    startLocationId?: string;
    sourceIds?: string[];
    research: Research;
    availability: Availability;
    objectives?: { id: string; research?: Research }[];
    goldRequirements?: { id: string; research?: Research }[];
    missables?: { id: string; research?: Research }[];
  }[]
>('missions.json');
const locations = load<{ id: string; coordinate?: { x: number; y: number }; sourceIds?: string[]; research?: Research }[]>(
  'locations.json',
);
const treasures = load<
  {
    id: string;
    sourceIds?: string[];
    research: Research;
    availability: Availability;
    steps: { id: string; locationId?: string; research?: Research }[];
  }[]
>('treasures.json');
const activities = load<{ id: string; availability: Availability; locationId?: string; sourceIds?: string[]; research: Research }[]>(
  'activities.json',
);
const itemRequests = load<{ id: string; availability: Availability; locationId?: string; sourceIds?: string[]; research: Research }[]>(
  'itemRequests.json',
);
const missables = load<{ id: string; availability: Availability; sourceIds?: string[]; research: Research }[]>(
  'missables.json',
);
const mapMarkers = load<
  {
    id: string;
    type: string;
    x: number;
    y: number;
    locationId?: string;
    missionId?: string;
    treasureId?: string;
    externalKey?: string;
    compendiumId?: string;
    collectibleSetId?: string;
    sourceIds?: string[];
    research?: Research;
  }[]
>('mapMarkers.json');
const sources = load<Source[]>('sources.json');
const completionRequirements = load<{ id: string; entityIds?: string[]; research: Research }[]>(
  'completionRequirements.json',
);
const collectibles = load<{ id: string; sourceIds?: string[]; research?: Research }[]>('collectibles.json');
const collectibleSets = load<{ id: string; collectibleIds: string[]; research?: Research }[]>('collectibleSets.json');
const challenges = load<{ id: string; sourceIds?: string[]; research?: Research; ranks?: { id: string; research?: Research }[] }[]>(
  'challenges.json',
);
const regions = load<{ id: string; name: string; description: string }[]>('regions.json');
const speciesIcons = load<Record<string, string[]>>('speciesIcons.json');
const compendium = load<
  {
    id: string;
    sourceIds?: string[];
    research?: Research;
    generalLocation?: {
      regionIds: string[];
      namedPlaces?: string[];
      locationIds?: string[];
      research: Research;
    };
  }[]
>('compendium.json');

const errors: string[] = [];
const usedSources = new Set<string>();

function fail(msg: string) {
  errors.push(msg);
}

function collectResearch(r?: Research) {
  if (!r) return;
  for (const id of r.sourceIds) usedSources.add(id);
}

function checkIds(label: string, ids: string[]) {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) fail(`Duplicate ${label} id: ${id}`);
    seen.add(id);
  }
}

function checkSourceId(id: string, ctx: string) {
  usedSources.add(id);
  if (!sources.some((s) => s.id === id)) fail(`${ctx} references missing source ${id}`);
}

function walkAvailability(a: Availability, ctx: string) {
  const chapterIds = new Set(chapters.map((c) => c.id));
  const missionIds = new Set(missions.map((m) => m.id));
  if (!chapterIds.has(a.displayChapterId)) fail(`${ctx} unknown displayChapterId ${a.displayChapterId}`);
  for (const id of a.availableChapterIds ?? []) {
    if (!chapterIds.has(id)) fail(`${ctx} unknown availableChapterId ${id}`);
  }
  if (a.earliestChapterId && !chapterIds.has(a.earliestChapterId)) fail(`${ctx} unknown earliestChapterId`);
  if (a.latestChapterId && !chapterIds.has(a.latestChapterId)) fail(`${ctx} unknown latestChapterId`);
  if (a.earliestChapterId && a.latestChapterId) {
    const eo = chapters.find((c) => c.id === a.earliestChapterId)?.order ?? 0;
    const lo = chapters.find((c) => c.id === a.latestChapterId)?.order ?? 0;
    if (eo > lo) fail(`${ctx} earliestChapter after latestChapter`);
  }
  if (a.earliestMissionId && !missionIds.has(a.earliestMissionId)) fail(`${ctx} unknown earliestMissionId`);
  if (a.latestMissionId && !missionIds.has(a.latestMissionId)) fail(`${ctx} unknown latestMissionId`);
  if (a.missableAfterMissionId && !missionIds.has(a.missableAfterMissionId)) fail(`${ctx} unknown missableAfterMissionId`);
}

checkIds('chapter', chapters.map((c) => c.id));
checkIds('mission', missions.map((m) => m.id));
checkIds('location', locations.map((l) => l.id));
checkIds('treasure', treasures.map((t) => t.id));
checkIds('source', sources.map((s) => s.id));
checkIds('activity', activities.map((a) => a.id));
checkIds('itemRequest', itemRequests.map((a) => a.id));
checkIds('missable', missables.map((m) => m.id));
checkIds('mapMarker', mapMarkers.map((m) => m.id));
checkIds('collectible', collectibles.map((c) => c.id));
checkIds('collectibleSet', collectibleSets.map((c) => c.id));
checkIds('challenge', challenges.map((c) => c.id));
checkIds('compendium', compendium.map((c) => c.id));
checkIds('region', regions.map((r) => r.id));
checkIds(
  'challengeRank',
  challenges.flatMap((c) => c.ranks?.map((r) => r.id) ?? []),
);

const wikiHome = /^https:\/\/reddead\.fandom\.com\/?$/i;

for (const s of sources) {
  if (!s.sourceName.trim()) fail(`Source ${s.id} missing sourceName`);
  if (s.url) {
    if (!s.url.startsWith('https://')) fail(`Source ${s.id} URL is not https`);
    try {
      new URL(s.url);
    } catch {
      fail(`Source ${s.id} malformed URL`);
    }
    if (wikiHome.test(s.url.replace(/\/wiki\/?$/, ''))) fail(`Source ${s.id} points at wiki homepage`);
  }
}

const locIds = new Set(locations.map((l) => l.id));
const missionIds = new Set(missions.map((m) => m.id));
const chapterIds = new Set(chapters.map((c) => c.id));
const treasureIds = new Set(treasures.map((t) => t.id));
const collectibleSetIds = new Set(collectibleSets.map((s) => s.id));
const compendiumIds = new Set(compendium.map((c) => c.id));
const regionIds = new Set(regions.map((r) => r.id));
const KNOWN_REGION_IDS = new Set([
  'ambarino',
  'new-hanover',
  'lemoyne',
  'west-elizabeth',
  'new-austin',
  'guarma',
]);

for (const r of regions) {
  if (!KNOWN_REGION_IDS.has(r.id)) fail(`region ${r.id} is not a known RegionId`);
  if (!r.name?.trim()) fail(`region ${r.id} missing name`);
}

for (const [icon, ids] of Object.entries(speciesIcons)) {
  if (!icon.trim()) fail('speciesIcons has an empty key');
  if (!Array.isArray(ids) || !ids.length) fail(`speciesIcons ${icon} has no compendium ids`);
  for (const id of ids) {
    if (!compendiumIds.has(id)) fail(`speciesIcons ${icon} unknown compendium ${id}`);
  }
}

const KNOWN_MARKER_TYPES = new Set([
  'mission-start',
  'stranger',
  'camp-activity',
  'treasure-map',
  'treasure-clue',
  'final-treasure',
  'missable',
  'robbery',
  'item-request',
  'unique-item',
  'other',
  'dinosaur-bone',
  'dreamcatcher',
  'rock-carving',
  'grave',
  'legendary-animal',
  'legendary-fish',
  'point-of-interest',
  'wilderness-chest',
  'orchid',
  'gang-camp',
  'town',
  'landmark',
  'fast-travel',
  'general-store',
  'gunsmith',
  'stable',
  'doctor',
  'fence',
  'trapper',
  'post-office',
  'saloon',
  'butcher',
  'barber',
  'tailor',
  'photo-studio',
  'bait-shop',
  'animal-habitat',
  'herb',
]);

for (const loc of locations) {
  collectResearch(loc.research);
  loc.sourceIds?.forEach((id) => checkSourceId(id, `location ${loc.id}`));
  if (loc.coordinate) {
    if (loc.coordinate.x < 0 || loc.coordinate.x > 1 || loc.coordinate.y < 0 || loc.coordinate.y > 1) {
      fail(`location ${loc.id} coordinate out of 0–1`);
    }
  }
}

const checklistIds = new Set<string>();
for (const m of missions) {
  if (!chapterIds.has(m.chapterId)) fail(`mission ${m.id} unknown chapter`);
  m.sourceIds?.forEach((id) => checkSourceId(id, `mission ${m.id}`));
  collectResearch(m.research);
  walkAvailability(m.availability, `mission ${m.id}`);
  if (m.startLocationId && !locIds.has(m.startLocationId)) fail(`mission ${m.id} unknown location`);
  for (const pre of m.prerequisiteMissionIds ?? []) {
    if (!missionIds.has(pre)) fail(`mission ${m.id} unknown prerequisite ${pre}`);
  }
  for (const item of [...(m.objectives ?? []), ...(m.goldRequirements ?? []), ...(m.missables ?? [])]) {
    if (checklistIds.has(item.id)) fail(`duplicate checklist id ${item.id}`);
    checklistIds.add(item.id);
    collectResearch(item.research);
    item.research?.sourceIds.forEach((id) => checkSourceId(id, `checklist ${item.id}`));
  }
}

for (const t of treasures) {
  t.sourceIds?.forEach((id) => checkSourceId(id, `treasure ${t.id}`));
  collectResearch(t.research);
  walkAvailability(t.availability, `treasure ${t.id}`);
  const stepIds = new Set<string>();
  for (const step of t.steps) {
    if (stepIds.has(step.id)) fail(`duplicate treasure step ${step.id}`);
    stepIds.add(step.id);
    if (step.locationId && !locIds.has(step.locationId)) fail(`treasure step ${step.id} unknown location`);
    collectResearch(step.research);
  }
}

for (const a of activities) {
  walkAvailability(a.availability, a.id);
  a.sourceIds?.forEach((id) => checkSourceId(id, a.id));
  collectResearch(a.research);
  if (a.locationId && !locIds.has(a.locationId)) fail(`${a.id} unknown location`);
}
for (const a of itemRequests) {
  walkAvailability(a.availability, a.id);
  a.sourceIds?.forEach((id) => checkSourceId(id, a.id));
  collectResearch(a.research);
  if (a.locationId && !locIds.has(a.locationId)) fail(`${a.id} unknown location`);
}
for (const a of missables) {
  walkAvailability(a.availability, a.id);
  a.sourceIds?.forEach((id) => checkSourceId(id, a.id));
  collectResearch(a.research);
}

const seenExternal = new Set<string>();
for (const marker of mapMarkers) {
  if (marker.x < 0 || marker.x > 1 || marker.y < 0 || marker.y > 1) fail(`marker ${marker.id} coords`);
  if (!KNOWN_MARKER_TYPES.has(marker.type)) fail(`marker ${marker.id} unknown type ${marker.type}`);
  if (marker.locationId && !locIds.has(marker.locationId)) fail(`marker ${marker.id} unknown location`);
  if (marker.missionId && !missionIds.has(marker.missionId)) fail(`marker ${marker.id} unknown mission`);
  if (marker.treasureId && !treasureIds.has(marker.treasureId)) fail(`marker ${marker.id} unknown treasure`);
  if (marker.compendiumId && !compendiumIds.has(marker.compendiumId)) {
    fail(`marker ${marker.id} unknown compendium ${marker.compendiumId}`);
  }
  if (marker.collectibleSetId && !collectibleSetIds.has(marker.collectibleSetId)) {
    fail(`marker ${marker.id} unknown collectible set ${marker.collectibleSetId}`);
  }
  if (marker.externalKey) {
    if (seenExternal.has(marker.externalKey)) fail(`duplicate marker externalKey ${marker.externalKey}`);
    seenExternal.add(marker.externalKey);
  }
  marker.sourceIds?.forEach((id) => checkSourceId(id, `marker ${marker.id}`));
  collectResearch(marker.research);
}

{
  const calibPath = join(root, 'scripts', 'research', 'calibration.json');
  const calib = JSON.parse(readFileSync(calibPath, 'utf8')) as {
    image: { width: number; height: number; tileSize: number };
    maxRms: number;
    transform: { a: number; b: number; c: number; d: number; e: number; f: number };
    controlPoints: {
      id: string;
      jeanropke: { lat: number; lng: number };
      tile: { x: number; y: number };
    }[];
  };
  const residuals = calib.controlPoints.map((p) => {
    const expectedX = (p.tile.x * calib.image.tileSize) / calib.image.width;
    const expectedY = (p.tile.y * calib.image.tileSize) / calib.image.height;
    const gotX = calib.transform.a * p.jeanropke.lng + calib.transform.b * p.jeanropke.lat + calib.transform.c;
    const gotY = calib.transform.d * p.jeanropke.lng + calib.transform.e * p.jeanropke.lat + calib.transform.f;
    return Math.hypot(gotX - expectedX, gotY - expectedY);
  });
  const rms = Math.sqrt(residuals.reduce((s, d) => s + d * d, 0) / residuals.length);
  if (rms > calib.maxRms) fail(`calibration RMS ${rms.toFixed(5)} exceeds ${calib.maxRms}`);
}

for (const req of completionRequirements) {
  collectResearch(req.research);
  for (const id of req.entityIds ?? []) {
    if (!missionIds.has(id) && !treasureIds.has(id) && !locIds.has(id)) {
      fail(`completionRequirement ${req.id} unknown entity ${id}`);
    }
  }
}

for (const c of collectibles) {
  c.sourceIds?.forEach((id) => checkSourceId(id, `collectible ${c.id}`));
  collectResearch(c.research);
}
for (const s of collectibleSets) {
  collectResearch(s.research);
  for (const id of s.collectibleIds) {
    if (!collectibles.some((c) => c.id === id)) fail(`collectibleSet ${s.id} unknown collectible ${id}`);
  }
}
for (const c of challenges) {
  c.sourceIds?.forEach((id) => checkSourceId(id, `challenge ${c.id}`));
  collectResearch(c.research);
  for (const r of c.ranks ?? []) collectResearch(r.research);
}
for (const c of compendium) {
  c.sourceIds?.forEach((id) => checkSourceId(id, `compendium ${c.id}`));
  collectResearch(c.research);
  if (c.generalLocation) {
    collectResearch(c.generalLocation.research);
    c.generalLocation.research.sourceIds.forEach((id) => checkSourceId(id, `compendium ${c.id} location`));
    for (const regionId of c.generalLocation.regionIds) {
      if (!regionIds.has(regionId)) fail(`compendium ${c.id} unknown region ${regionId}`);
    }
    for (const locationId of c.generalLocation.locationIds ?? []) {
      if (!locIds.has(locationId)) fail(`compendium ${c.id} unknown location ${locationId}`);
    }
  }
}

for (const s of sources) {
  if (!usedSources.has(s.id)) fail(`Unused source ${s.id}`);
}

if (errors.length) {
  console.error(`Data validation failed (${errors.length}):`);
  for (const e of errors) console.error(' -', e);
  process.exit(1);
}

console.log('Data validation passed.');
