/**
 * Fetch Red Dead Wiki wikitext and fill missing guide JSON.
 * Caches pages under scripts/.cache/wiki/ (gitignored).
 *
 * Run: node scripts/research/enrich-from-wiki.mjs
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

function research(status, sourceIds) {
  return { verificationStatus: status, sourceIds, lastReviewedAt: TODAY };
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

function cacheKey(title) {
  return slug(title) + '.json';
}

async function fetchWikitext(title) {
  const file = path.join(cacheDir, cacheKey(title));
  if (fs.existsSync(file)) {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }
  const api = `https://reddead.fandom.com/api.php?action=parse&page=${encodeURIComponent(title)}&prop=wikitext&format=json&formatversion=2&redirects=1`;
  const res = await fetch(api, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Wiki ${title} ${res.status}`);
  const json = await res.json();
  const payload = {
    title: json.parse?.title ?? title,
    exists: Boolean(json.parse?.wikitext),
    wikitext: json.parse?.wikitext ?? '',
    error: json.error?.info ?? null,
  };
  fs.writeFileSync(file, JSON.stringify(payload, null, 2));
  await new Promise((r) => setTimeout(r, 120));
  return payload;
}

function stripWiki(text) {
  let t = text;
  t = t.replace(/\{\{[^}]*\}\}/g, '');
  t = t.replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, '$2');
  t = t.replace(/\[\[([^\]]+)\]\]/g, '$1');
  t = t.replace(/'{2,}/g, '');
  t = t.replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, '');
  t = t.replace(/<[^>]+>/g, ' ');
  t = t.replace(/&nbsp;/g, ' ');
  t = t.replace(/&amp;/g, '&');
  t = t.replace(/\s+/g, ' ');
  return t.trim();
}

function infoboxField(wikitext, field) {
  const re = new RegExp(`\\|\\s*${field}\\s*=\\s*([^\\n]+)`, 'i');
  const m = wikitext.match(re);
  if (!m) return undefined;
  const cleaned = stripWiki(m[1]);
  return cleaned || undefined;
}

function section(wikitext, heading) {
  const re = new RegExp(`==\\s*${heading}\\s*==\\s*([\\s\\S]*?)(?=\\n==|$)`, 'i');
  const m = wikitext.match(re);
  return m ? m[1].trim() : '';
}

function bulletLines(block) {
  return block
    .split('\n')
    .map((line) => line.replace(/^\s*[\*\#]+\s*/, '').trim())
    .map(stripWiki)
    .filter((line) => line.length > 2 && !line.startsWith('|') && !line.startsWith('{'));
}

function missionObjectives(wikitext) {
  const mo = wikitext.match(/\|\s*mo\s*=([\s\S]*?)(?:\n\s*\|\s*[a-z]+\s*=|\n\}\})/i);
  if (!mo) return [];
  return bulletLines(mo[1]).filter((line) => {
    const lower = line.toLowerCase();
    return !lower.startsWith('hold ') && !lower.startsWith('use ') && !lower.startsWith('press ');
  });
}

function goldObjectives(wikitext) {
  return bulletLines(section(wikitext, 'Gold Medal Objectives'));
}

function overview(wikitext) {
  const raw = section(wikitext, 'Mission Overview') || section(wikitext, 'Overview');
  const first = raw.split('\n').map(stripWiki).filter(Boolean)[0];
  return first;
}

function checklist(prefix, slugName, labels, sourceId) {
  return labels.map((label, i) => ({
    id: `${prefix}-${slugName}-${i + 1}`,
    label,
    research: research('researched', [sourceId]),
  }));
}

function ensureSource(sources, id, title) {
  if (sources.some((s) => s.id === id)) return id;
  sources.push(wikiSource(id, title));
  return id;
}

function locIdFromName(name, locations) {
  if (!name) return undefined;
  const n = name.toLowerCase();
  const hit = locations.find(
    (l) => n.includes(l.name.toLowerCase()) || l.name.toLowerCase().includes(n.split(',')[0].trim()),
  );
  return hit?.id;
}

const missions = loadJson('missions.json');
const sources = loadJson('sources.json');
const locations = loadJson('locations.json');
const sourceById = new Map(sources.map((s) => [s.id, s]));

console.log('Enriching', missions.length, 'missions…');

let filledGold = 0;
let filledSummary = 0;
let filledGiver = 0;
let filledObj = 0;
const failures = [];

for (const mission of missions) {
  const sourceId = mission.sourceIds?.[0];
  const src = sourceId ? sourceById.get(sourceId) : undefined;
  const pageTitle = src?.pageTitle || mission.title;
  let page;
  try {
    page = await fetchWikitext(pageTitle);
    if (!page.exists) {
      page = await fetchWikitext(mission.title);
    }
  } catch (err) {
    failures.push(`${mission.title}: ${err.message}`);
    continue;
  }
  if (!page.exists || !page.wikitext) {
    failures.push(`${mission.title}: no wikitext (${pageTitle})`);
    continue;
  }

  const wt = page.wikitext;
  const sid = sourceId ?? ensureSource(sources, `wiki-${mission.slug}`, page.title);

  if (!mission.questGiver) {
    const giver = infoboxField(wt, 'giver');
    if (giver) {
      mission.questGiver = giver.replace(/\s*\(.*?\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
      filledGiver += 1;
    }
  }

  if (!mission.summary) {
    const ov = overview(wt);
    if (ov && ov.length > 20) {
      mission.summary = ov;
      filledSummary += 1;
    }
  }

  if (!mission.goldRequirements?.length) {
    const golds = goldObjectives(wt);
    if (golds.length) {
      mission.goldRequirements = checklist('gold', mission.slug, golds, sid);
      filledGold += 1;
    }
  }

  if (!mission.objectives?.length) {
    const objs = missionObjectives(wt).slice(0, 12);
    if (objs.length) {
      mission.objectives = checklist('obj', mission.slug, objs, sid);
      filledObj += 1;
    }
  }

  if (!mission.startLocationId) {
    const start = infoboxField(wt, 'start') || infoboxField(wt, 'location');
    const locId = locIdFromName(start, locations);
    if (locId) mission.startLocationId = locId;
  }

  mission.research = research(
    mission.goldRequirements?.length ? 'cross-checked' : mission.research?.verificationStatus ?? 'researched',
    mission.research?.sourceIds ?? [sid],
  );
}

saveJson('missions.json', missions);
console.log({ filledGold, filledSummary, filledGiver, filledObj, failures: failures.length });
if (failures.length) console.log(failures.slice(0, 20));

async function fetchListPage(title, sourceId, sourceTitle) {
  ensureSource(sources, sourceId, sourceTitle ?? title);
  return fetchWikitext(title);
}

function tableRows(wikitext) {
  const rows = [];
  for (const block of wikitext.split('|-')) {
    const cells = [...block.matchAll(/\|\s*(?:style=[^\|]*\|)?\s*([\s\S]*?)(?=\n\||$)/g)].map((m) =>
      stripWiki(m[1]),
    );
    if (cells.length >= 2) rows.push(cells);
  }
  return rows;
}

// --- Item requests ---
console.log('Item requests…');
const itemPage = await fetchListPage('Companion Item Requests', 'wiki-companion-item-requests-page', 'Companion Item Requests');
const existingItems = loadJson('itemRequests.json');
const itemByTitle = new Set(existingItems.map((i) => i.title.toLowerCase()));

function chapterFromText(text) {
  const m = String(text).match(/chapter\s*([1-6])/i);
  if (m) return `chapter-${m[1]}`;
  if (/epilogue/i.test(text)) return 'epilogue-1';
  return undefined;
}

if (itemPage.wikitext) {
  const extra = [];
  const lines = itemPage.wikitext.split('\n');
  let current = null;
  for (const line of lines) {
    const req = line.match(/^\|\s*'''\[\[([^\]]+)\]\]'''/);
    const item = line.match(/^\|\s*(?:\[\[([^\]]+)\]\]|([A-Za-z0-9 $.'-]+))/);
    if (line.startsWith('|-') && current?.requester && current?.item) {
      extra.push(current);
      current = {};
    }
    if (req) current = { requester: stripWiki(req[1]), item: undefined, chapter: undefined, notes: '' };
  }
  // Fallback: bullet list "X asks for Y"
  const bullets = bulletLines(itemPage.wikitext);
  for (const b of bullets) {
    const m = b.match(/^(.+?)\s+(?:asks?|wants|requests?)\s+(?:for\s+)?(.+)$/i);
    if (m) {
      extra.push({ requester: m[1], item: m[2], chapter: undefined });
    }
  }
  for (const row of extra) {
    if (!row.item || !row.requester) continue;
    const title = `${stripWiki(row.item)} for ${stripWiki(row.requester)}`;
    if (itemByTitle.has(title.toLowerCase())) continue;
    const ch = row.chapter ?? 'chapter-2';
    existingItems.push({
      id: `item-${slug(row.requester + '-' + row.item)}`,
      title,
      requester: stripWiki(row.requester),
      availability: {
        displayChapterId: ch,
        availableChapterIds: [ch],
        earliestChapterId: ch,
        latestChapterId: ch,
      },
      description: row.notes || undefined,
      sourceIds: ['wiki-companion-item-requests-page'],
      research: research('researched', ['wiki-companion-item-requests-page']),
    });
    itemByTitle.add(title.toLowerCase());
  }
}

// Parse wikitext tables more loosely for item requests
if (itemPage.wikitext.includes('{|')) {
  const requesterBlocks = [...itemPage.wikitext.matchAll(/\|\s*rowspan[^|]*\|\s*\[\[([^\]]+)\]\]([\s\S]*?)(?=\|\s*rowspan|\n\|\})/g)];
  for (const block of requesterBlocks) {
    const requester = stripWiki(block[1]);
    const body = block[2];
    const items = [...body.matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g)].map((m) => stripWiki(m[1]));
    const chapterHit = chapterFromText(body) ?? 'chapter-2';
    for (const item of items.slice(0, 6)) {
      if (/chapter|mission|camp/i.test(item)) continue;
      const title = `${item} for ${requester}`;
      if (itemByTitle.has(title.toLowerCase())) continue;
      existingItems.push({
        id: `item-${slug(requester + '-' + item)}`,
        title,
        requester,
        availability: {
          displayChapterId: chapterHit,
          availableChapterIds: [chapterHit],
          earliestChapterId: chapterHit,
          latestChapterId: chapterHit,
        },
        sourceIds: ['wiki-companion-item-requests-page'],
        research: research('researched', ['wiki-companion-item-requests-page']),
      });
      itemByTitle.add(title.toLowerCase());
    }
  }
}

saveJson('itemRequests.json', existingItems);
console.log('item requests', existingItems.length);

// --- Challenges ---
console.log('Challenges…');
const chalPage = await fetchListPage(
  'Single-player Challenges in Redemption 2',
  'wiki-single-player-challenges',
  'Single-player Challenges in Redemption 2',
);
const challengeNames = [
  'Bandit',
  'Explorer',
  'Gambler',
  'Herbalist',
  'Horseman',
  'Master Hunter',
  'Sharpshooter',
  'Survivalist',
  'Weapons Expert',
];
const challenges = [];
if (chalPage.wikitext) {
  for (const name of challengeNames) {
    const block = section(chalPage.wikitext, name) || section(chalPage.wikitext, `${name} Challenges`);
    const ranks = [];
    const rankLines = [...(block || chalPage.wikitext).matchAll(/\|\s*Rank\s*(\d+)\s*\|([^|]*)\|/gi)];
    if (rankLines.length) {
      for (const m of rankLines) {
        const label = stripWiki(m[2]);
        if (!label) continue;
        ranks.push({
          id: `chal-${slug(name)}-rank-${m[1]}`,
          rank: Number(m[1]),
          description: label,
          research: research('researched', ['wiki-single-player-challenges']),
        });
      }
    }
    challenges.push({
      id: `challenge-${slug(name)}`,
      category: name,
      title: `${name} Challenges`,
      ranks,
      sourceIds: ['wiki-single-player-challenges'],
      research: research('researched', ['wiki-single-player-challenges']),
    });
  }
}
saveJson('challenges.json', challenges);
console.log(
  'challenges',
  challenges.length,
  'ranks',
  challenges.reduce((n, c) => n + c.ranks.length, 0),
);

// --- 100% ---
console.log('100% completion…');
const pctPage = await fetchListPage('100% Completion', 'wiki-100-completion', '100% Completion');
const completionRequirements = [];
if (pctPage.wikitext) {
  const lines = bulletLines(pctPage.wikitext);
  let i = 0;
  for (const line of lines) {
    if (line.length < 8 || line.length > 180) continue;
    if (/^reference|^navigation|^gallery|^trivia|^see also/i.test(line)) continue;
    i += 1;
    completionRequirements.push({
      id: `completion-${slug(line).slice(0, 60)}-${i}`,
      category: '100-percent',
      title: line,
      countsToward100: true,
      sourceIds: ['wiki-100-completion'],
      research: research('researched', ['wiki-100-completion']),
    });
  }
}
saveJson('completionRequirements.json', completionRequirements.slice(0, 80));
console.log('completion rows', Math.min(completionRequirements.length, 80));

async function namedList(pageTitle, sourceId, kind, prefix) {
  ensureSource(sources, sourceId, pageTitle);
  const page = await fetchWikitext(pageTitle);
  const names = new Set();
  if (!page.wikitext) return [];
  for (const m of page.wikitext.matchAll(/\*\s*\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g)) {
    const name = stripWiki(m[1]);
    if (name.length < 3 || name.length > 80) continue;
    if (/^file:|^category:|^template:/i.test(name)) continue;
    names.add(name);
  }
  for (const m of page.wikitext.matchAll(/\|\s*-\s*\n\|\s*\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g)) {
    names.add(stripWiki(m[1]));
  }
  return [...names].map((title, idx) => ({
    id: `${prefix}-${slug(title) || idx}`,
    kind,
    title,
    sourceIds: [sourceId],
    research: research('researched', [sourceId]),
  }));
}

console.log('Collectibles…');
const cigarette = await namedList('Cigarette Cards', 'wiki-cigarette-cards', 'cigarette-card', 'col-card');
const bones = await namedList('Dinosaur Bones', 'wiki-dinosaur-bones', 'dinosaur-bone', 'col-bone');
const carvings = await namedList('Rock Carvings', 'wiki-rock-carvings', 'rock-carving', 'col-carve');
const dreams = await namedList('Dreamcatchers', 'wiki-dreamcatchers', 'dreamcatcher', 'col-dream');
const exotics = await namedList('Duchesses and Other Animals', 'wiki-duchesses-and-other-animals', 'exotic', 'col-exotic');
const hunts = await namedList('A Better World, A New Friend', 'wiki-hunting-requests', 'hunting-request', 'col-hunt');
const pois = await namedList('Points of Interest', 'wiki-points-of-interest', 'point-of-interest', 'col-poi');

let collectibles = [...cigarette, ...bones, ...carvings, ...dreams, ...exotics, ...hunts, ...pois];
const seenCol = new Set();
collectibles = collectibles.filter((c) => {
  if (seenCol.has(c.id)) return false;
  seenCol.add(c.id);
  return true;
});

const collectibleSets = [
  { id: 'set-cigarette-cards', kind: 'cigarette-card', title: 'Cigarette Cards', collectibleIds: cigarette.map((c) => c.id) },
  { id: 'set-dinosaur-bones', kind: 'dinosaur-bone', title: 'Dinosaur Bones', collectibleIds: bones.map((c) => c.id) },
  { id: 'set-rock-carvings', kind: 'rock-carving', title: 'Rock Carvings', collectibleIds: carvings.map((c) => c.id) },
  { id: 'set-dreamcatchers', kind: 'dreamcatcher', title: 'Dreamcatchers', collectibleIds: dreams.map((c) => c.id) },
  { id: 'set-exotics', kind: 'exotic', title: 'Exotics (Algernon Wasp)', collectibleIds: exotics.map((c) => c.id) },
  { id: 'set-hunting-requests', kind: 'hunting-request', title: 'Hunting Requests', collectibleIds: hunts.map((c) => c.id) },
  { id: 'set-points-of-interest', kind: 'point-of-interest', title: 'Points of Interest', collectibleIds: pois.map((c) => c.id) },
].map((s) => ({
  ...s,
  research: research('researched', collectibles.find((c) => c.setId === s.id)?.sourceIds ?? s.collectibleIds.slice(0, 1).map((id) => collectibles.find((c) => c.id === id)?.sourceIds?.[0]).filter(Boolean)),
}));

for (const set of collectibleSets) {
  if (!set.research.sourceIds.length) {
    const first = collectibles.find((c) => set.collectibleIds.includes(c.id));
    set.research = research('researched', first?.sourceIds ?? ['wiki-missions-in-redemption-2']);
  }
  for (const c of collectibles) {
    if (set.collectibleIds.includes(c.id)) c.setId = set.id;
  }
}

saveJson('collectibles.json', collectibles);
saveJson('collectibleSets.json', collectibleSets);
console.log('collectibles', collectibles.length, 'sets', collectibleSets.length);

console.log('Compendium…');
const legendAnimals = await namedList('Legendary Animals', 'wiki-legendary-animals', 'legendary-animal', 'comp-leg-animal');
const legendFish = await namedList('Legendary Fish', 'wiki-legendary-fish', 'legendary-fish', 'comp-leg-fish');
const plants = await namedList('Plants in Redemption 2', 'wiki-plants-in-redemption-2', 'plant', 'comp-plant');
let compendium = [...legendAnimals, ...legendFish, ...plants];
const seenComp = new Set();
compendium = compendium.filter((c) => {
  if (seenComp.has(c.id)) return false;
  seenComp.add(c.id);
  return true;
}).map((c) => ({
  id: c.id,
  kind: c.kind,
  title: c.title,
  sourceIds: c.sourceIds,
  research: c.research,
}));
saveJson('compendium.json', compendium);
console.log('compendium', compendium.length);

// --- Missables from tagged missions + item requests ---
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
    research: research('researched', m.sourceIds ?? []),
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
console.log('missables', missables.length);

saveJson('sources.json', sources);
console.log('sources', sources.length);
console.log('Done.');
