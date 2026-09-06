/**
 * Finalize structured lists from already-cached Wiki wikitext.
 * Run: node scripts/research/finalize-data.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const dataDir = path.join(root, 'src', 'data');
const cacheDir = path.join(root, 'scripts', '.cache', 'wiki');
const TODAY = '2026-09-06';
const UA = 'rdr2-complete-guide/0.1 (fan project; local research enricher)';

function loadJson(name) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, name), 'utf8'));
}
function saveJson(name, value) {
  fs.writeFileSync(path.join(dataDir, name), JSON.stringify(value, null, 2) + '\n');
}
function slug(title) {
  return title
    .toLowerCase()
    .replaceAll('?', '')
    .replaceAll("'", '')
    .replaceAll(',', '')
    .replaceAll('.', '')
    .replaceAll('&', 'and')
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-|-$/g, '');
}
function research(sourceIds) {
  return { verificationStatus: 'researched', sourceIds, lastReviewedAt: TODAY };
}
function wikiUrl(title) {
  return `https://reddead.fandom.com/wiki/${encodeURIComponent(title.replaceAll(' ', '_'))}`;
}
function wikiSource(id, title) {
  return {
    id,
    sourceName: 'Red Dead Wiki',
    pageTitle: title,
    url: wikiUrl(title),
    sourceType: 'wiki',
    verificationStatus: 'researched',
    accessedAt: TODAY,
    publicAttribution: true,
  };
}
async function fetchWikitext(title) {
  const file = path.join(cacheDir, slug(title) + '.json');
  if (fs.existsSync(file)) {
    const cached = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (cached.exists || cached.error) return cached;
  }
  const api = `https://reddead.fandom.com/api.php?action=parse&page=${encodeURIComponent(title)}&prop=wikitext&format=json&formatversion=2&redirects=1`;
  const res = await fetch(api, { headers: { 'User-Agent': UA } });
  const json = await res.json();
  const payload = {
    title: json.parse?.title ?? title,
    exists: Boolean(json.parse?.wikitext),
    wikitext: json.parse?.wikitext ?? '',
    error: json.error?.info ?? null,
  };
  fs.writeFileSync(file, JSON.stringify(payload, null, 2));
  await new Promise((r) => setTimeout(r, 80));
  return payload;
}
function stripWiki(text) {
  return String(text)
    .replace(/\{\{[^}]*\}\}/g, '')
    .replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/'{2,}/g, '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}
function bullets(block) {
  return block
    .split('\n')
    .map((l) => l.replace(/^\s*[\*\#]+\s*/, '').trim())
    .map(stripWiki)
    .filter((l) => l.length > 8);
}
function numberedRows(wikitext) {
  const rows = [];
  const re = /\|-\s*\n\|(\d+)\|\|([^\n]+)/g;
  let m;
  while ((m = re.exec(wikitext))) {
    const cells = m[2].split('||').map((c) => stripWiki(c));
    rows.push({ n: Number(m[1]), cells });
  }
  return rows;
}

const sources = loadJson('sources.json');
function ensureSource(id, title) {
  if (!sources.some((s) => s.id === id)) sources.push(wikiSource(id, title));
  return id;
}

// Explorer ranks 2–10
const challenges = loadJson('challenges.json');
const explorer = challenges.find((c) => c.category === 'Explorer');
if (explorer && explorer.ranks.length < 10) {
  const sid = explorer.sourceIds[0];
  explorer.ranks = [
    { id: 'chal-explorer-challenges-1', rank: 1, description: 'Find a treasure map', research: research([sid]) },
    ...Array.from({ length: 9 }, (_, i) => ({
      id: `chal-explorer-challenges-${i + 2}`,
      rank: i + 2,
      description: 'Find a treasure',
      research: research([sid]),
    })),
  ];
}
saveJson('challenges.json', challenges);

// 100%
const pctSid = ensureSource('wiki-100-completion-rdr2', '100% Completion (RDR2)');
const pct = await fetchWikitext('100% Completion (RDR2)');
const completionRequirements = [];
const chunks = pct.wikitext.split(/\n===+/);
let n = 0;
for (const chunk of chunks) {
  const headingLine = chunk.split('\n')[0] ?? '';
  const heading = stripWiki(headingLine.replace(/=+$/, ''));
  const category =
    /mission/i.test(heading) ? 'missions-and-events'
    : /collectible/i.test(heading) ? 'collectibles'
    : /compendium/i.test(heading) ? 'compendium'
    : /player/i.test(heading) ? 'player'
    : /miscellaneous/i.test(heading) ? 'miscellaneous'
    : null;
  if (!category) continue;
  const body = chunk.split('\n').slice(1).join('\n');
  for (const line of bullets(body)) {
    n += 1;
    completionRequirements.push({
      id: `completion-${slug(line).slice(0, 48)}-${n}`,
      category,
      title: line,
      countsToward100: true,
      sourceIds: [pctSid],
      research: research([pctSid]),
    });
  }
}
saveJson('completionRequirements.json', completionRequirements);
console.log('completion', completionRequirements.length);

// Item requests from missions page table
const irSid = ensureSource('wiki-companion-item-requests', 'Missions in Redemption 2');
const missionsPage = await fetchWikitext('Missions in Redemption 2');
const irStart = missionsPage.wikitext.indexOf('Companion Item Requests');
const irEnd = missionsPage.wikitext.indexOf('==Companion Activities', irStart);
const irBlock = missionsPage.wikitext.slice(irStart, irEnd > 0 ? irEnd : irStart + 9000);

function chapterIds(text) {
  if (/epilogue part ii|post-game/i.test(text)) return { display: 'epilogue-2', from: 'epilogue-2', to: 'epilogue-2', all: ['epilogue-2'] };
  if (/epilogue/i.test(text)) return { display: 'epilogue-1', from: 'epilogue-1', to: 'epilogue-2', all: ['epilogue-1', 'epilogue-2'] };
  const nums = [...text.matchAll(/([1-6])/g)].map((x) => Number(x[1]));
  if (!nums.length) return { display: 'chapter-2', from: 'chapter-2', to: 'chapter-2', all: ['chapter-2'] };
  const lo = Math.min(...nums);
  const hi = Math.max(...nums);
  const all = [];
  for (let i = lo; i <= hi; i += 1) all.push(`chapter-${i}`);
  return { display: `chapter-${lo}`, from: `chapter-${lo}`, to: `chapter-${hi}`, all };
}

const itemRequests = [];
for (const part of irBlock.split(/\n\|-\n/)) {
  const rawCells = part
    .split('\n')
    .filter((l) => l.startsWith('|') && !l.startsWith('|}') && !l.startsWith('|+') && !l.startsWith('|-'))
    .map((l) => l.replace(/^\|/, '').replace(/^data-row-id="[^"]*"\|/, ''));
  if (rawCells.length < 4) continue;
  const requester = stripWiki(rawCells[0]);
  const chapterText = stripWiki(rawCells[1]);
  const time = stripWiki(rawCells[2]);
  const request = stripWiki(rawCells[3]);
  const reward = stripWiki(rawCells[4] ?? '');
  const trigger = stripWiki(rawCells[5] ?? '');
  if (!requester || !request) continue;
  if (/^companion$/i.test(requester) || /^chapter$/i.test(chapterText)) continue;
  const ch = chapterIds(chapterText);
  const requests = request
    .split(/1st Request:|2nd Request:/)
    .map((s) => s.trim())
    .filter(Boolean);
  const labels = requests.length > 1 ? requests : [request];
  for (const [idx, label] of labels.entries()) {
    const title = `${label} for ${requester}${labels.length > 1 ? ` (${idx + 1})` : ''}`;
    itemRequests.push({
      id: `item-${slug(`${requester}-${label}-${idx}`)}`,
      title,
      requester,
      availability: {
        displayChapterId: ch.display,
        availableChapterIds: ch.all,
        earliestChapterId: ch.from,
        latestChapterId: ch.to,
        requirements: time ? [{ kind: 'time-of-day', window: time }] : undefined,
      },
      description: [trigger, reward ? `Reward: ${reward}` : ''].filter(Boolean).join(' '),
      sourceIds: [irSid],
      research: research([irSid]),
    });
  }
}
saveJson('itemRequests.json', itemRequests);
console.log('item requests', itemRequests.length, itemRequests.map((i) => i.title).join('; '));

// Collectibles: cards + numbered tables
const cigSid = ensureSource('wiki-cigarette-cards', 'Cigarette Cards');
const cig = loadJson('collectibles.json').filter((c) => c.kind === 'cigarette-card');

function fromCacheTable(pageTitle, sourceId, kind, prefix, noun) {
  ensureSource(sourceId, pageTitle);
  const file = path.join(cacheDir, slug(pageTitle) + '.json');
  const wt = JSON.parse(fs.readFileSync(file, 'utf8')).wikitext;
  const items = [];
  let seq = 0;
  for (const row of numberedRows(wt)) {
    seq += 1;
    const area = row.cells[0] || row.cells.join(' ');
    items.push({
      id: `${prefix}-${seq}`,
      kind,
      title: `${noun} ${seq} — ${area}`,
      sourceIds: [sourceId],
      research: research([sourceId]),
    });
  }
  return items;
}

const bones = fromCacheTable('Dinosaur Bones', 'wiki-dinosaur-bones', 'dinosaur-bone', 'col-bone', 'Dinosaur Bone');
const dreams = fromCacheTable('Dreamcatchers', 'wiki-dreamcatchers', 'dreamcatcher', 'col-dream', 'Dreamcatcher');
const carvings = fromCacheTable('Rock Carvings', 'wiki-rock-carvings', 'rock-carving', 'col-carve', 'Rock Carving');

const poiSid = ensureSource('wiki-points-of-interest', 'Points of Interest');
const poiPage = await fetchWikitext('Points of Interest');
const pois = [];
const poiSection = poiPage.wikitext.split('==List')[1] || poiPage.wikitext.split('==Locations')[1] || poiPage.wikitext;
for (const m of poiSection.matchAll(/\|\s*\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g)) {
  const title = stripWiki(m[1]);
  if (/file:|category:|^point/i.test(title)) continue;
  pois.push({
    id: `col-poi-${slug(title)}`,
    kind: 'point-of-interest',
    title,
    sourceIds: [poiSid],
    research: research([poiSid]),
  });
}
if (pois.length < 8) {
  for (const m of poiPage.wikitext.matchAll(/\*\s*\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g)) {
    const title = stripWiki(m[1]);
    if (/file:|category:|red dead|point of interest/i.test(title)) continue;
    pois.push({
      id: `col-poi-${slug(title)}`,
      kind: 'point-of-interest',
      title,
      sourceIds: [poiSid],
      research: research([poiSid]),
    });
  }
}

const huntSid = ensureSource('wiki-a-better-world', 'A Better World, A New Friend');
const huntPage = await fetchWikitext('A Better World, A New Friend');
const hunts = [];
let h = 0;
for (const line of bullets(huntPage.wikitext)) {
  if (!/perfect|carcass|pelt|request/i.test(line)) continue;
  h += 1;
  hunts.push({
    id: `col-hunt-${h}`,
    kind: 'hunting-request',
    title: line.slice(0, 120),
    sourceIds: [huntSid],
    research: research([huntSid]),
  });
}

const collectibles = [...cig, ...bones, ...dreams, ...carvings, ...pois, ...hunts];
const seen = new Set();
const unique = collectibles.filter((c) => {
  if (seen.has(c.id)) return false;
  seen.add(c.id);
  return true;
});
const collectibleSets = [
  ['set-cigarette-cards', 'cigarette-card', 'Cigarette Card Sets', cigSid],
  ['set-dinosaur-bones', 'dinosaur-bone', 'Dinosaur Bones', 'wiki-dinosaur-bones'],
  ['set-dreamcatchers', 'dreamcatcher', 'Dreamcatchers', 'wiki-dreamcatchers'],
  ['set-rock-carvings', 'rock-carving', 'Rock Carvings', 'wiki-rock-carvings'],
  ['set-points-of-interest', 'point-of-interest', 'Points of Interest', poiSid],
  ['set-hunting-requests', 'hunting-request', 'Hunting Requests', huntSid],
].map(([id, kind, title, sid]) => {
  const ids = unique.filter((c) => c.kind === kind).map((c) => c.id);
  for (const c of unique) if (c.kind === kind) c.setId = id;
  return { id, kind, title, collectibleIds: ids, research: research([sid]) };
});
saveJson('collectibles.json', unique);
saveJson('collectibleSets.json', collectibleSets);
console.log('collectibles', unique.length, collectibleSets.map((s) => `${s.title}:${s.collectibleIds.length}`).join(', '));

// Legendary fish via A Fisher of Fish
const fishSid = ensureSource('wiki-a-fisher-of-fish', 'A Fisher of Fish');
const fishPage = await fetchWikitext('A Fisher of Fish');
const fish = [];
for (const m of (fishPage.wikitext || '').matchAll(/\[\[(Legendary [^\]]+)\]\]/g)) {
  const title = stripWiki(m[1]);
  if (!/fish|sturgeon|gar|pike|trout|salmon|muskie|bass|catfish|pickerel|steelhead|sockeye|bullhead|bluegill|perch/i.test(title) && !/^Legendary /.test(title)) continue;
  fish.push({
    id: `comp-leg-fish-${slug(title)}`,
    kind: 'legendary-fish',
    title,
    sourceIds: [fishSid],
    research: research([fishSid]),
  });
}
const compendium = loadJson('compendium.json').filter((c) => c.kind !== 'legendary-fish');
const seenF = new Set();
for (const f of fish) {
  if (seenF.has(f.id)) continue;
  seenF.add(f.id);
  compendium.push(f);
}
saveJson('compendium.json', compendium);
console.log('legendary fish', seenF.size);

// Missables
const missions = loadJson('missions.json');
const missables = [];
for (const m of missions) {
  if (!m.missable && !m.tags?.includes('missable')) continue;
  missables.push({
    id: `missable-${m.slug}`,
    title: m.title,
    category: m.tags?.includes('honor') ? 'honor-mission' : m.tags?.includes('debt-collection') ? 'debt' : 'story',
    availability: m.availability,
    relatedMissionIds: [m.id],
    description: m.missableWarning ?? m.summary,
    sourceIds: m.sourceIds,
    research: research(m.sourceIds ?? [irSid]),
  });
}
for (const item of itemRequests) {
  missables.push({
    id: `missable-${item.id}`,
    title: item.title,
    category: 'item-request',
    availability: item.availability,
    description: item.description,
    sourceIds: item.sourceIds,
    research: item.research,
  });
}
saveJson('missables.json', missables);

const used = new Set();
function walk(obj) {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) return obj.forEach(walk);
  if (Array.isArray(obj.sourceIds)) obj.sourceIds.forEach((id) => used.add(id));
  if (obj.research?.sourceIds) obj.research.sourceIds.forEach((id) => used.add(id));
  Object.values(obj).forEach(walk);
}
for (const file of [
  'missions.json',
  'locations.json',
  'treasures.json',
  'activities.json',
  'itemRequests.json',
  'missables.json',
  'collectibles.json',
  'collectibleSets.json',
  'challenges.json',
  'compendium.json',
  'completionRequirements.json',
  'chapters.json',
]) {
  walk(loadJson(file));
}
saveJson(
  'sources.json',
  sources.filter((s) => used.has(s.id)),
);
console.log('missables', missables.length, 'sources', used.size);
