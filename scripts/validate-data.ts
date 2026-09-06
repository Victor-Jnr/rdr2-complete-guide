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
const mapMarkers = load<{ id: string; x: number; y: number; locationId?: string; missionId?: string; treasureId?: string }[]>(
  'mapMarkers.json',
);
const sources = load<Source[]>('sources.json');
const completionRequirements = load<{ id: string; entityIds?: string[]; research: Research }[]>(
  'completionRequirements.json',
);

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

for (const marker of mapMarkers) {
  if (marker.x < 0 || marker.x > 1 || marker.y < 0 || marker.y > 1) fail(`marker ${marker.id} coords`);
  if (marker.locationId && !locIds.has(marker.locationId)) fail(`marker ${marker.id} unknown location`);
  if (marker.missionId && !missionIds.has(marker.missionId)) fail(`marker ${marker.id} unknown mission`);
  if (marker.treasureId && !treasureIds.has(marker.treasureId)) fail(`marker ${marker.id} unknown treasure`);
}

for (const req of completionRequirements) {
  collectResearch(req.research);
  for (const id of req.entityIds ?? []) {
    if (!missionIds.has(id) && !treasureIds.has(id) && !locIds.has(id)) {
      fail(`completionRequirement ${req.id} unknown entity ${id}`);
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
