/**
 * Second pass: correct Wiki titles and structured lists.
 * Run: node scripts/research/fill-lists.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const dataDir = path.join(root, 'src', 'data');
const cacheDir = path.join(root, 'scripts', '.cache', 'wiki');
const TODAY = '2026-09-06';
const UA = 'rdr2-complete-guide/0.1 (fan project; local research enricher)';
fs.mkdirSync(cacheDir, { recursive: true });

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
function cacheFile(title) {
  return path.join(cacheDir, slug(title) + '.json');
}
async function fetchWikitext(title) {
  const file = cacheFile(title);
  if (fs.existsSync(file)) {
    const cached = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (cached.exists) return cached;
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
  await new Promise((r) => setTimeout(r, 100));
  return payload;
}
function stripWiki(text) {
  return String(text)
    .replace(/\{\{[^}]*\}\}/g, '')
    .replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/'{2,}/g, '')
    .replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}
function section(wikitext, heading) {
  const re = new RegExp(`==+\\s*${heading}\\s*==+\\s*([\\s\\S]*?)(?=\\n==+|$)`, 'i');
  const m = wikitext.match(re);
  return m ? m[1].trim() : '';
}
function bullets(block) {
  return block
    .split('\n')
    .map((l) => l.replace(/^\s*[\*\#]+\s*/, '').trim())
    .map(stripWiki)
    .filter((l) => l.length > 3);
}
function infoboxField(wikitext, field) {
  const m = wikitext.match(new RegExp(`\\|\\s*${field}\\s*=\\s*([^\\n]+)`, 'i'));
  return m ? stripWiki(m[1]) || undefined : undefined;
}
function overview(wikitext) {
  const raw = section(wikitext, 'Mission Overview') || section(wikitext, 'Overview');
  const para = raw
    .split('\n')
    .map(stripWiki)
    .filter((l) => l.length > 30 && !l.startsWith('='))[0];
  if (para) return para;
  const afterTitle = wikitext.split(/\n{2,}/).map(stripWiki).find((p) => p.length > 40 && /Arthur|John|the player|mission/i.test(p));
  return afterTitle;
}
function goldObjectives(wikitext) {
  return bullets(section(wikitext, 'Gold Medal Objectives'));
}
function checklist(prefix, slugName, labels, sourceId) {
  return labels.map((label, i) => ({
    id: `${prefix}-${slugName}-${i + 1}`,
    label,
    research: research([sourceId]),
  }));
}

const sources = loadJson('sources.json');
function ensureSource(id, title) {
  if (!sources.some((s) => s.id === id)) sources.push(wikiSource(id, title));
  return id;
}

function parseWikiTableRows(wikitext) {
  const rows = [];
  for (const chunk of wikitext.split('\n|-')) {
    const cells = chunk
      .split('\n')
      .filter((l) => l.startsWith('|') && !l.startsWith('|}') && !l.startsWith('|+') && !l.startsWith('!'))
      .map((l) => stripWiki(l.replace(/^\|/, '').replace(/^style=[^|]*\|/, '')));
    if (cells.length >= 2) rows.push(cells);
  }
  return rows;
}

// --- Remaining missions ---
const missions = loadJson('missions.json');
const extraPages = {
  'mission-of-men-and-angels-i': 'Of Men and Angels',
  'mission-of-men-and-angels-ii': 'Of Men and Angels',
  'mission-red-dead-redemption': 'Red Dead Redemption (mission)',
  'mission-mrs-sadie-adler-widow-i': 'Mrs. Sadie Adler, Widow',
  'mission-mrs-sadie-adler-widow-ii': 'Mrs. Sadie Adler, Widow',
  'mission-a-fork-in-the-road': 'A Fork in the Road',
  'mission-the-best-of-women': 'The Best of Women',
  'mission-the-landowning-classes': 'The Landowning Classes',
};

for (const mission of missions) {
  const extra = extraPages[mission.id];
  if (!extra && mission.summary && (mission.goldRequirements?.length || mission.questGiver)) continue;
  const pageTitle = extra || mission.title;
  const page = await fetchWikitext(pageTitle);
  if (!page.exists) continue;
  const sid = mission.sourceIds?.[0] ?? ensureSource(`wiki-${mission.slug}`, page.title);
  if (!mission.questGiver) {
    const g = infoboxField(page.wikitext, 'giver');
    if (g) mission.questGiver = g;
  }
  if (!mission.summary) {
    const ov = overview(page.wikitext);
    if (ov) mission.summary = ov;
  }
  if (!mission.goldRequirements?.length) {
    const golds = goldObjectives(page.wikitext);
    if (golds.length && !/ I$/.test(mission.title)) {
      mission.goldRequirements = checklist('gold', mission.slug, golds, sid);
    }
  }
  if (mission.goldRequirements?.length) {
    mission.research = research(mission.research?.sourceIds ?? [sid]);
    mission.research.verificationStatus = 'cross-checked';
  }
}

saveJson('missions.json', missions);

// --- Challenges ---
const challengePages = [
  'Bandit Challenges',
  'Explorer Challenges',
  'Gambler Challenges',
  'Herbalist Challenges',
  'Horseman Challenges',
  'Master Hunter Challenges',
  'Sharpshooter Challenges',
  'Survivalist Challenges',
  'Weapons Expert Challenges',
];
const challenges = [];
for (const name of challengePages) {
  const sid = ensureSource(`wiki-${slug(name)}`, name);
  const page = await fetchWikitext(name);
  const ranks = [];
  const block = page.wikitext || '';
  const re = /\*\s*Rank\s*(\d+)\s*:\s*(.+)/gi;
  let m;
  while ((m = re.exec(block))) {
    ranks.push({
      id: `chal-${slug(name)}-${m[1]}`,
      rank: Number(m[1]),
      description: stripWiki(m[2]),
      research: research([sid]),
    });
  }
  challenges.push({
    id: `challenge-${slug(name.replace(/ Challenges$/, ''))}`,
    category: name.replace(/ Challenges$/, ''),
    title: name,
    ranks,
    sourceIds: [sid],
    research: research([sid]),
  });
}
saveJson('challenges.json', challenges);
console.log(
  'challenges ranks',
  challenges.reduce((n, c) => n + c.ranks.length, 0),
);

// --- 100% ---
const pctSid = ensureSource('wiki-100-completion-rdr2', '100% Completion (RDR2)');
const pctPage = await fetchWikitext('100% Completion (RDR2)');
const completionRequirements = [];
const requiredSections = ['Missions And Events', 'Collectibles', 'Compendium', 'Player', 'Miscellaneous'];
let n = 0;
for (const heading of requiredSections) {
  for (const line of bullets(section(pctPage.wikitext, heading))) {
    n += 1;
    completionRequirements.push({
      id: `completion-${slug(line).slice(0, 50)}-${n}`,
      category: slug(heading),
      title: line,
      countsToward100: true,
      sourceIds: [pctSid],
      research: research([pctSid]),
    });
  }
}
saveJson('completionRequirements.json', completionRequirements);
console.log('completion', completionRequirements.length);

// --- Cigarette card sets ---
const cigSid = ensureSource('wiki-cigarette-cards', 'Cigarette Cards');
const cigPage = await fetchWikitext('Cigarette Cards');
const cigSets = [];
for (const line of bullets(section(cigPage.wikitext, 'Collections and rewards'))) {
  const setName = line.split(':')[0];
  if (!/set/i.test(setName) && !/Americans|Champions|Gunslingers|Artists|Vistas|Gems|Flora|Fauna|Stars|Marvels|Inventions|Horses/i.test(setName)) {
    continue;
  }
  if (/^first set|^all sets/i.test(setName)) continue;
  cigSets.push({
    id: `col-card-set-${slug(setName)}`,
    kind: 'cigarette-card',
    title: setName.replace(/Card Set/i, 'Card Set').trim(),
    sourceIds: [cigSid],
    research: research([cigSid]),
  });
}

// --- Bones / dreamcatchers / carvings from tables ---
function collectFromTable(pageTitle, sourceId, kind, prefix) {
  const sid = ensureSource(sourceId, pageTitle);
  const wt = fs.existsSync(cacheFile(pageTitle))
    ? JSON.parse(fs.readFileSync(cacheFile(pageTitle), 'utf8')).wikitext
    : '';
  const items = [];
  const rows = parseWikiTableRows(wt);
  let i = 0;
  for (const cells of rows) {
    const num = cells.find((c) => /^\d+$/.test(c));
    if (!num) continue;
    i += 1;
    const area = cells[1] ?? '';
    const loc = cells[2] ?? cells[cells.length - 1];
    items.push({
      id: `${prefix}-${i}`,
      kind,
      title: stripWiki(
        `${kind === 'dinosaur-bone' ? 'Dinosaur Bone' : kind === 'dreamcatcher' ? 'Dreamcatcher' : 'Rock Carving'} ${i} — ${area}`,
      ),
      sourceIds: [sid],
      research: research([sid]),
    });
  }
  return items;
}

await fetchWikitext('Dinosaur Bones');
await fetchWikitext('Dreamcatchers');
await fetchWikitext('Rock Carvings');
const bones = collectFromTable('Dinosaur Bones', 'wiki-dinosaur-bones', 'dinosaur-bone', 'col-bone');
const dreams = collectFromTable('Dreamcatchers', 'wiki-dreamcatchers', 'dreamcatcher', 'col-dream');
const carvings = collectFromTable('Rock Carvings', 'wiki-rock-carvings', 'rock-carving', 'col-carve');

const poiSid = ensureSource('wiki-points-of-interest', 'Points of Interest');
const poiPage = await fetchWikitext('Points of Interest');
const pois = [];
for (const m of (poiPage.wikitext || '').matchAll(/\*\s*\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g)) {
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

const collectibles = [...cigSets, ...bones, ...dreams, ...carvings, ...pois];
const seen = new Set();
const uniqueCols = collectibles.filter((c) => {
  if (seen.has(c.id) || seen.has(c.title)) return false;
  seen.add(c.id);
  seen.add(c.title);
  return true;
});

const collectibleSets = [
  {
    id: 'set-cigarette-cards',
    kind: 'cigarette-card',
    title: 'Cigarette Card Sets',
    collectibleIds: uniqueCols.filter((c) => c.kind === 'cigarette-card').map((c) => c.id),
    research: research([cigSid]),
  },
  {
    id: 'set-dinosaur-bones',
    kind: 'dinosaur-bone',
    title: 'Dinosaur Bones',
    collectibleIds: uniqueCols.filter((c) => c.kind === 'dinosaur-bone').map((c) => c.id),
    research: research(['wiki-dinosaur-bones']),
  },
  {
    id: 'set-dreamcatchers',
    kind: 'dreamcatcher',
    title: 'Dreamcatchers',
    collectibleIds: uniqueCols.filter((c) => c.kind === 'dreamcatcher').map((c) => c.id),
    research: research(['wiki-dreamcatchers']),
  },
  {
    id: 'set-rock-carvings',
    kind: 'rock-carving',
    title: 'Rock Carvings',
    collectibleIds: uniqueCols.filter((c) => c.kind === 'rock-carving').map((c) => c.id),
    research: research(['wiki-rock-carvings']),
  },
  {
    id: 'set-points-of-interest',
    kind: 'point-of-interest',
    title: 'Points of Interest',
    collectibleIds: uniqueCols.filter((c) => c.kind === 'point-of-interest').map((c) => c.id),
    research: research([poiSid]),
  },
];
for (const c of uniqueCols) {
  const set = collectibleSets.find((s) => s.kind === c.kind);
  if (set) c.setId = set.id;
}
saveJson('collectibles.json', uniqueCols);
saveJson('collectibleSets.json', collectibleSets);
console.log('collectibles', uniqueCols.length);

// --- Compendium: legendary animals (RDR2 section), fish, plants ---
const laSid = ensureSource('wiki-legendary-animals', 'Legendary Animals');
const laPage = await fetchWikitext('Legendary Animals');
const rdr2Animals = section(laPage.wikitext, "''Red Dead Redemption 2''") || section(laPage.wikitext, 'Red Dead Redemption 2');
const legendAnimals = [];
for (const m of (rdr2Animals || laPage.wikitext).matchAll(/\[\[(Legendary [^\]]+)\]\]/g)) {
  const title = stripWiki(m[1]);
  if (/online|redemption\]/i.test(title)) continue;
  legendAnimals.push({
    id: `comp-leg-animal-${slug(title)}`,
    kind: 'legendary-animal',
    title,
    sourceIds: [laSid],
    research: research([laSid]),
  });
}
const lfSid = ensureSource('wiki-legendary-fish', 'Legendary Fish');
const lfPage = await fetchWikitext('Legendary Fish');
const legendFish = [];
for (const m of (lfPage.wikitext || '').matchAll(/\[\[(Legendary [^\]]+Fish[^\]]*)\]\]/g)) {
  legendFish.push({
    id: `comp-leg-fish-${slug(m[1])}`,
    kind: 'legendary-fish',
    title: stripWiki(m[1]),
    sourceIds: [lfSid],
    research: research([lfSid]),
  });
}
const plSid = ensureSource('wiki-plant-gathering', 'Plant Gathering in Redemption 2');
const plPage = await fetchWikitext('Plant Gathering in Redemption 2');
const plants = [];
for (const m of (plPage.wikitext || '').matchAll(/\*\s*\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g)) {
  const title = stripWiki(m[1]);
  if (/file:|category:|herb|plant gathering|red dead/i.test(title)) continue;
  plants.push({
    id: `comp-plant-${slug(title)}`,
    kind: 'plant',
    title,
    sourceIds: [plSid],
    research: research([plSid]),
  });
}
const seenC = new Set();
const compendium = [...legendAnimals, ...legendFish, ...plants].filter((c) => {
  if (seenC.has(c.id)) return false;
  seenC.add(c.id);
  return true;
});
saveJson('compendium.json', compendium);
console.log('compendium', compendium.length, {
  animals: legendAnimals.length,
  fish: legendFish.length,
  plants: plants.length,
});

// --- Item requests from Missions in Redemption 2 ---
const irSid = ensureSource('wiki-companion-item-requests', 'Missions in Redemption 2');
const missionsPage = await fetchWikitext('Missions in Redemption 2');
const irBlock =
  section(missionsPage.wikitext, 'Companion Item Requests') ||
  missionsPage.wikitext.split('Companion Item Requests')[1]?.slice(0, 8000) ||
  '';
const existingItems = loadJson('itemRequests.json');
const have = new Set(existingItems.map((i) => i.title.toLowerCase()));
const rows = parseWikiTableRows(irBlock);
for (const cells of rows) {
  if (cells.length < 3) continue;
  const requester = cells[0];
  const item = cells[1];
  const chapterText = cells.find((c) => /chapter|epilogue/i.test(c)) ?? '';
  if (!requester || !item || item.length > 60) continue;
  if (/companion|item|request|chapter/i.test(requester) && requester.length < 8) continue;
  const title = `${item} for ${requester}`;
  if (have.has(title.toLowerCase())) continue;
  const ch = /epilogue/i.test(chapterText)
    ? 'epilogue-1'
    : `chapter-${(chapterText.match(/chapter\s*([1-6])/i)?.[1] ?? '2')}`;
  existingItems.push({
    id: `item-${slug(requester + '-' + item)}`,
    title,
    requester,
    availability: {
      displayChapterId: ch,
      availableChapterIds: [ch],
      earliestChapterId: ch,
      latestChapterId: ch,
    },
    description: cells.slice(2).filter((c) => c !== chapterText && c.length < 160)[0],
    sourceIds: [irSid],
    research: research([irSid]),
  });
  have.add(title.toLowerCase());
}
saveJson('itemRequests.json', existingItems);
console.log('item requests', existingItems.length);

// Rebuild missables from missions + items
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
for (const item of existingItems) {
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

// Drop unused sources
const used = new Set();
function walk(obj) {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) {
    obj.forEach(walk);
    return;
  }
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
const pruned = sources.filter((s) => used.has(s.id));
saveJson('sources.json', pruned);
console.log('sources', pruned.length, 'unused dropped', sources.length - pruned.length);
console.log('done');
