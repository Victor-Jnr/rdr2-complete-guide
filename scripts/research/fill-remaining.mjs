/**
 * Fill remaining guide lists from Red Dead Wiki wikitext (cached).
 * Run: node scripts/research/fill-remaining.mjs
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
  return String(title)
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
    if (cached.exists && cached.wikitext) return cached;
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
function section(wikitext, heading) {
  const re = new RegExp(`==+\\s*${heading}\\s*==+\\s*([\\s\\S]*?)(?=\\n==|$)`, 'i');
  const m = wikitext.match(re);
  return m ? m[1].trim() : '';
}
function bullets(block) {
  return String(block)
    .split('\n')
    .map((l) => l.replace(/^\s*[\*\#]+\s*/, '').trim())
    .map(stripWiki)
    .filter((l) => l.length > 2 && !/^file:|^category:|^==/i.test(l));
}
function firstColumnLinks(wikitext) {
  const names = [];
  const re = /\|-\s*\n\|\s*([^\n]+)/g;
  let m;
  while ((m = re.exec(wikitext))) {
    const first = m[1].split('||')[0];
    if (/file:|^!|style=/i.test(first)) continue;
    const cleaned = stripWiki(first);
    if (cleaned && cleaned.length < 90 && !/^file:|^category:/i.test(cleaned)) names.push(cleaned);
  }
  return names;
}
function between(wikitext, start, end) {
  const i = wikitext.search(start);
  if (i < 0) return '';
  const slice = wikitext.slice(i);
  const j = slice.search(end);
  return j > 0 ? slice.slice(0, j) : slice;
}

const sources = loadJson('sources.json');
function ensureSource(id, title) {
  if (!sources.some((s) => s.id === id)) sources.push(wikiSource(id, title));
  return id;
}

function uniqueById(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function entry(id, kind, title, sourceId, extra = {}) {
  return {
    id,
    kind,
    title,
    sourceIds: [sourceId],
    research: research([sourceId]),
    ...extra,
  };
}

// --- Missions: fill objectives from |mo or Walkthrough when still empty ---
const missions = loadJson('missions.json');
let filledObj = 0;
for (const mission of missions) {
  if (mission.objectives?.length) continue;
  const src = sources.find((s) => s.id === mission.sourceIds?.[0]);
  const page = await fetchWikitext(src?.pageTitle || mission.title);
  if (!page.wikitext) continue;
  const mo = page.wikitext.match(/\|\s*mo\s*=([\s\S]*?)(?:\n\s*\|\s*[a-zA-Z]+\s*=|\n\}\})/i);
  let labels = mo ? bullets(mo[1]).filter((l) => l.length < 160) : [];
  if (labels.length < 2) {
    const walk = section(page.wikitext, 'Walkthrough');
    labels = walk
      .split('\n')
      .filter((l) => /^\s*#/.test(l))
      .map((l) => stripWiki(l.replace(/^\s*#+\s*/, '')))
      .filter((l) => l.length >= 8 && l.length <= 140 && !/^if the player/i.test(l))
      .slice(0, 8);
  }
  if (labels.length >= 2) {
    mission.objectives = labels.map((label, i) => ({
      id: `obj-${mission.slug}-${i + 1}`,
      label,
      research: research(mission.sourceIds ?? []),
    }));
    filledObj += 1;
  }
  if (!mission.goldRequirements?.length) {
    const golds = bullets(section(page.wikitext, 'Gold Medal Objectives'));
    if (golds.length) {
      mission.goldRequirements = golds.map((label, i) => ({
        id: `gold-${mission.slug}-${i + 1}`,
        label,
        research: research(mission.sourceIds ?? []),
      }));
    }
  }
}
saveJson('missions.json', missions);
console.log('mission objectives newly filled', filledObj);

// --- Item request title cleanup (keep ids) ---
const itemRequests = loadJson('itemRequests.json');
for (const item of itemRequests) {
  item.title = item.title.replace(/\s*:\s+for\s+/i, ' for ');
}
saveJson('itemRequests.json', itemRequests);

// --- 100% Completion ---
const pctSid = ensureSource('wiki-100-completion-rdr2', '100% Completion (RDR2)');
const pct = await fetchWikitext('100% Completion (RDR2)');
const completionRequirements = [];
let n = 0;
function addCompletion(block, category, countsToward100) {
  for (const line of bullets(block)) {
    if (/^file:|^category:|^==/i.test(line)) continue;
    n += 1;
    completionRequirements.push({
      id: `completion-${String(n).padStart(2, '0')}-${slug(line).slice(0, 48)}`,
      category,
      title: line,
      targetCount: 1,
      countsToward100,
      sourceIds: [pctSid],
      research: research([pctSid]),
    });
  }
}
const requiredText = pct.wikitext.split(/\n==Rewards==/)[0] ?? pct.wikitext;
for (const chunk of requiredText.split(/\n===+/)) {
  const heading = stripWiki((chunk.split('\n')[0] ?? '').replace(/=+$/, ''));
  const body = chunk.split('\n').slice(1).join('\n');
  if (/mission/i.test(heading)) addCompletion(body, 'missions-and-events', true);
  else if (/collectible/i.test(heading)) addCompletion(body, 'collectibles', true);
  else if (/compendium/i.test(heading)) addCompletion(body, 'compendium', true);
  else if (/^player$/i.test(heading)) addCompletion(body, 'player', true);
  else if (/miscellaneous/i.test(heading)) addCompletion(body, 'miscellaneous', true);
}
const nonReq = (pct.wikitext.split(/\n==Non-Required Progress==/)[1] ?? '').split(/\n==Gallery==/)[0];
addCompletion(nonReq, 'non-required', false);
saveJson('completionRequirements.json', completionRequirements);
const reqCount = completionRequirements.filter((r) => r.countsToward100).length;
console.log('completion required', reqCount, 'optional', completionRequirements.length - reqCount);

// --- Collectibles ---
const cigSid = ensureSource('wiki-cigarette-cards', 'Cigarette Cards');
const cigPage = await fetchWikitext('Cigarette Cards');
const setTitles = [...cigPage.wikitext.matchAll(/\[\[([^\]]+Card Set)\]\]/g)].map((m) => stripWiki(m[1]));
const uniqueSetTitles = [...new Set(setTitles)].filter((t) => /card set/i.test(t));

const cigaretteCards = [];
const cardSets = [];
for (const setTitle of uniqueSetTitles) {
  const setSid = ensureSource(`wiki-${slug(setTitle)}`, setTitle);
  const page = await fetchWikitext(setTitle);
  const names = firstColumnLinks(page.wikitext);
  const setId = `set-cards-${slug(setTitle).replace(/-card-set$/, '')}`;
  const ids = [];
  names.forEach((name, i) => {
    const id = `col-card-${slug(setTitle)}-${slug(name) || i + 1}`;
    ids.push(id);
    cigaretteCards.push(entry(id, 'cigarette-card', `${name} (${setTitle})`, setSid, { setId }));
  });
  cardSets.push({
    id: setId,
    kind: 'cigarette-card',
    title: setTitle,
    collectibleIds: ids,
    research: research([setSid]),
  });
}
console.log('cigarette cards', cigaretteCards.length, 'sets', cardSets.length);

function fromNumberedTable(pageTitle, sourceId, kind, prefix, noun) {
  ensureSource(sourceId, pageTitle);
  const file = path.join(cacheDir, slug(pageTitle) + '.json');
  let wt = '';
  if (fs.existsSync(file)) wt = JSON.parse(fs.readFileSync(file, 'utf8')).wikitext;
  if (!wt) return [];
  const items = [];
  const re = /\|-\s*\n\|(\d+)\|\|([^\n]+)/g;
  let m;
  while ((m = re.exec(wt))) {
    const area = stripWiki(m[2].split('||')[0] ?? m[2]);
    const seq = Number(m[1]);
    items.push(entry(`${prefix}-${seq}`, kind, `${noun} ${seq} — ${area}`, sourceId));
  }
  return items;
}

const bones = fromNumberedTable('Dinosaur Bones', 'wiki-dinosaur-bones', 'dinosaur-bone', 'col-bone', 'Dinosaur Bone');
const dreams = fromNumberedTable('Dreamcatchers', 'wiki-dreamcatchers', 'dreamcatcher', 'col-dream', 'Dreamcatcher');
const carvings = fromNumberedTable('Rock Carvings', 'wiki-rock-carvings', 'rock-carving', 'col-carve', 'Rock Carving');

const poiSid = ensureSource('wiki-point-of-interest', 'Point of Interest');
const poiPage = await fetchWikitext('Point of Interest');
const poiLoc = between(poiPage.wikitext, /==\s*Locations\s*==/, /\n==\s*Trivia\s*==/);
const pois = [];
for (const m of poiLoc.matchAll(/\*\s*\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g)) {
  const title = stripWiki(m[2] || m[1]);
  if (/file:|category:|^point of interest$/i.test(title)) continue;
  pois.push(entry(`col-poi-${slug(title)}`, 'point-of-interest', title, poiSid));
}
console.log('pois', pois.length);

const huntSid = ensureSource('wiki-a-better-world', 'A Better World, A New Friend');
const hunts = [];
const huntSpec = [
  ['1', 'Valentine', ['Perfect Squirrel Carcass', 'Perfect Rabbit Carcass']],
  ['2', 'Strawberry', ['Perfect Cardinal Carcass', 'Perfect Rat Carcass', 'Perfect Woodpecker Carcass']],
  ['3', 'Rhodes', ['Perfect Chipmunk Carcass', 'Perfect Oriole Carcass', 'Perfect Robin Carcass', 'Perfect Opossum Carcass']],
  ['4', 'Saint Denis', ['Perfect Sparrow Carcass', 'Perfect Songbird Carcass', 'Perfect Toad Carcass', 'Perfect Bullfrog Carcass', 'Perfect Skunk Carcass']],
  ['5', 'Van Horn Trading Post (epilogue)', ['Perfect Waxwing Carcass', 'Perfect Bat Carcass', 'Perfect Blue Jay Carcass', 'Perfect Crow Carcass', 'Perfect Beaver Carcass']],
];
for (const [num, place, carcasses] of huntSpec) {
  hunts.push(
    entry(`col-hunt-request-${num}`, 'hunting-request', `Hunting request ${num} (${place})`, huntSid, {
      setId: 'set-hunting-requests',
    }),
  );
  for (const carcass of carcasses) {
    hunts.push(
      entry(`col-hunt-${slug(carcass)}`, 'hunting-request', `${carcass} (Request ${num})`, huntSid, {
        setId: 'set-hunting-requests',
      }),
    );
  }
}

const exoticSid = ensureSource('wiki-duchesses-and-other-animals', 'Duchesses and other Animals');
const exoticPage = await fetchWikitext('Duchesses and other Animals');
const exotics = [];
let part = 0;
for (const block of exoticPage.wikitext.split(/===\s*'''Part /).slice(1)) {
  part += 1;
  if (part > 5) break;
  const lines = bullets(block).filter((l) => /^\d+\s/.test(l) || /\b(plume|orchid|gator egg)/i.test(l));
  for (const line of lines) {
    const short = line.split(/\s*\(found/i)[0].trim();
    if (/^all |^upon |^when |^note:|^precise |^the player|^this /i.test(short)) continue;
    if (short.length < 6 || short.length > 90) continue;
    exotics.push(
      entry(`col-exotic-p${part}-${slug(short)}`, 'exotic', `Part ${part}: ${short}`, exoticSid, {
        setId: 'set-exotics',
      }),
    );
  }
}
console.log('exotics', exotics.length);

const graveSid = ensureSource('wiki-paying-respects', 'Paying Respects');
const gravePage = await fetchWikitext('Paying Respects');
const graves = [];
const avail = section(gravePage.wikitext, 'Availability');
for (const line of bullets(avail)) {
  const m = line.match(/^(.+?)\s+-\s+After\s+"?(.+?)"?\s*\.?$/);
  if (!m) continue;
  const who = stripWiki(m[1]);
  graves.push(
    entry(`col-grave-${slug(who)}`, 'other', `${who}'s grave`, graveSid, {
      setId: 'set-graves',
    }),
  );
}
console.log('graves', graves.length);

const collectibles = uniqueById([
  ...cigaretteCards,
  ...bones,
  ...dreams,
  ...carvings,
  ...pois,
  ...hunts,
  ...exotics,
  ...graves,
]);

const collectibleSets = [
  ...cardSets,
  {
    id: 'set-dinosaur-bones',
    kind: 'dinosaur-bone',
    title: 'Dinosaur Bones',
    collectibleIds: bones.map((c) => c.id),
    research: research(['wiki-dinosaur-bones']),
  },
  {
    id: 'set-dreamcatchers',
    kind: 'dreamcatcher',
    title: 'Dreamcatchers',
    collectibleIds: dreams.map((c) => c.id),
    research: research(['wiki-dreamcatchers']),
  },
  {
    id: 'set-rock-carvings',
    kind: 'rock-carving',
    title: 'Rock Carvings',
    collectibleIds: carvings.map((c) => c.id),
    research: research(['wiki-rock-carvings']),
  },
  {
    id: 'set-points-of-interest',
    kind: 'point-of-interest',
    title: 'Points of Interest',
    collectibleIds: pois.map((c) => c.id),
    research: research([poiSid]),
  },
  {
    id: 'set-hunting-requests',
    kind: 'hunting-request',
    title: 'Hunting Requests',
    collectibleIds: hunts.map((c) => c.id),
    research: research([huntSid]),
  },
  {
    id: 'set-exotics',
    kind: 'exotic',
    title: 'Duchesses and other Animals',
    collectibleIds: exotics.map((c) => c.id),
    research: research([exoticSid]),
  },
  {
    id: 'set-graves',
    kind: 'other',
    title: 'Companion Graves',
    collectibleIds: graves.map((c) => c.id),
    research: research([graveSid]),
  },
];
for (const set of collectibleSets) {
  for (const c of collectibles) {
    if (set.collectibleIds.includes(c.id)) c.setId = set.id;
  }
}
saveJson('collectibles.json', collectibles);
saveJson('collectibleSets.json', collectibleSets);
console.log('collectibles total', collectibles.length);

// --- Compendium ---
const animalSid = ensureSource('wiki-animals-redemption-2-species', 'Animals/Redemption 2 species');
const animalPage = await fetchWikitext('Animals/Redemption 2 species');
const animals = [];
const legendaryAnimals = [];
const animalTable = animalPage.wikitext.split('{|')[1]?.split('|}')[0] ?? '';
for (const row of animalTable.split('|-').slice(1)) {
  const cells = row.split('||').map((c) => c.trim());
  let varietiesRaw = '';
  if (cells.length >= 2) varietiesRaw = cells[1];
  else {
    const lines = row.split('\n').filter((l) => l.startsWith('|'));
    varietiesRaw = lines.slice(1).join('\n');
  }
  const parts = varietiesRaw.replace(/<br\s*\/?>/gi, '\n').split('\n');
  for (const part of parts) {
    const italic = /''/.test(part) || /legendary/i.test(part);
    const title = stripWiki(part.replace(/^\|/, ''));
    if (!title || title.length > 60 || /^unique varieties$/i.test(title)) continue;
    if (/\[\[|\]\]/.test(title)) continue;
    if (italic || /^legendary /i.test(title)) {
      legendaryAnimals.push(entry(`comp-leg-animal-${slug(title)}`, 'legendary-animal', title.replace(/\|.*/, ''), animalSid));
    } else {
      animals.push(entry(`comp-animal-${slug(title)}`, 'animal', title.replace(/\|.*/, ''), animalSid));
    }
  }
  if (/donkey/i.test(row) && /mule/i.test(row)) {
    animals.push(entry('comp-animal-mule', 'animal', 'Mule', animalSid));
    animals.push(entry('comp-animal-standard-donkey', 'animal', 'Standard Donkey', animalSid));
  }
}

const fishSid = ensureSource('wiki-fishing', 'Fishing');
const fishPage = await fetchWikitext('Fishing');
const speciesBlock = section(fishPage.wikitext, 'Species');
const fish = [];
for (const name of firstColumnLinks(speciesBlock || fishPage.wikitext)) {
  if (/^legendary /i.test(name)) continue;
  fish.push(entry(`comp-fish-${slug(name)}`, 'fish', name, fishSid));
}

const fishQuestSid = ensureSource('wiki-a-fisher-of-fish', 'A Fisher of Fish');
const fishQuest = await fetchWikitext('A Fisher of Fish');
const requiredFish = [];
const reqBlock = fishQuest.wikitext.split('These three cannot')[0];
for (const m of reqBlock.matchAll(/\*\s*\[\[(Legendary [^\]]+)\]\]/g)) {
  requiredFish.push(stripWiki(m[1]));
}
for (const m of fishQuest.wikitext.matchAll(/\*\s*\[\[(Legendary (?:Largemouth Bass|Redfin Pickerel|Rock Bass))\]\]/g)) {
  requiredFish.push(stripWiki(m[1]));
}
const legendaryFish = [...new Set(requiredFish)].map((title) =>
  entry(`comp-leg-fish-${slug(title)}`, 'legendary-fish', title, fishQuestSid),
);

const plantSid = ensureSource('wiki-plant-gathering', 'Plant Gathering in Redemption 2');
const plantPage = await fetchWikitext('Plant Gathering in Redemption 2');
const plantBlock = between(plantPage.wikitext, /==\s*Types of Plants and Herbs\s*==/, /\n==\s*''Red Dead Online''\s*==/);
const plants = [];
for (const m of plantBlock.matchAll(/\*\s*\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g)) {
  const title = stripWiki(m[2] || m[1]);
  if (!title || /file:|category:/i.test(title) || title.length > 40) continue;
  plants.push(entry(`comp-plant-${slug(title)}`, 'plant', title, plantSid));
}

const weaponSid = ensureSource('wiki-weapons-in-redemption-2', 'Weapons in Redemption 2');
const weaponPage = await fetchWikitext('Weapons in Redemption 2');
const weaponEnd = weaponPage.wikitext.search(/\n==Tips and Tricks==/);
const weaponBlock = weaponPage.wikitext.slice(0, weaponEnd > 0 ? weaponEnd : weaponPage.wikitext.length);
const weaponSkip = /^(weapon|dmg|rng|f\.?r\.?|acc|rel|ammo|cost|model|notes)/i;
const weapons = [];
for (const raw of firstColumnLinks(weaponBlock)) {
  const name = raw.replace(/^data-row-id="?\d+"?\s*\|?\s*/i, '').replace(/^data-tpt-excluded.*$/i, '').trim();
  if (!name || weaponSkip.test(name) || /colspan|notes:/i.test(name) || /arrows$/i.test(name)) continue;
  weapons.push(entry(`comp-weapon-${slug(name)}`, 'weapon', name, weaponSid));
}
if (!weapons.some((w) => /^bow$/i.test(w.title))) {
  weapons.push(entry('comp-weapon-bow', 'weapon', 'Bow', weaponSid));
}
if (weaponPage.wikitext.includes('Navy Revolver') && !weapons.some((w) => /navy revolver/i.test(w.title))) {
  weapons.push(entry('comp-weapon-navy-revolver', 'weapon', 'Navy Revolver', weaponSid));
}

const horseSid = ensureSource('wiki-horse', 'Horse');
const horsePage = await fetchWikitext('Horse');
const breedIdx = horsePage.wikitext.indexOf('==Horse Breeds==');
const rdr2Idx = horsePage.wikitext.indexOf("===''Red Dead Redemption 2''===", breedIdx);
const tipsIdx = horsePage.wikitext.indexOf('==Tips==', rdr2Idx);
const breedBlock = horsePage.wikitext.slice(rdr2Idx, tipsIdx > 0 ? tipsIdx : rdr2Idx + 4000);
const horses = [];
for (const line of breedBlock.split('\n')) {
  if (!line.startsWith('*')) continue;
  const title = stripWiki(line.replace(/^\*\s*/, ''));
  if (!title || /red dead online only/i.test(title)) continue;
  horses.push(entry(`comp-horse-${slug(title)}`, 'horse', title, horseSid));
}

const gangSid = ensureSource('wiki-gangs-in-red-dead-redemption-2', 'Gangs in Red Dead Redemption 2');
const gangPage = await fetchWikitext('Gangs in Red Dead Redemption 2');
const gangBlock = section(gangPage.wikitext, 'Compendium Gangs');
const gangs = [];
for (const m of (gangBlock || '').matchAll(/\[\[(Del Lobo Gang|Laramie Gang|Lemoyne Raiders|Murfree Brood|O'Driscoll Boys|Skinner Brothers)\]\]/g)) {
  const title = stripWiki(m[1]);
  gangs.push(entry(`comp-gang-${slug(title)}`, 'gang', title, gangSid));
}

const satchelSid = ensureSource('wiki-satchel', 'Satchel');
const satchelPage = await fetchWikitext('Satchel');
const equipment = [];
const upgradeBlock = between(satchelPage.wikitext, /===\s*List of upgrades\s*===/, /===\s*All pelts/);
for (const row of upgradeBlock.split('|-').slice(1)) {
  const cells = row
    .split('\n')
    .filter((l) => l.startsWith('|') && !l.startsWith('|}') && !l.startsWith('|-'))
    .map((l) => stripWiki(l.replace(/^\|/, '')));
  const nameCell = cells.find((c) => /satchel/i.test(c) && !/^file:/i.test(c));
  if (!nameCell) continue;
  const title = nameCell.replace(/^file:.*/i, '').trim();
  if (!title || /^file:/i.test(title)) continue;
  equipment.push(entry(`comp-equip-${slug(title)}`, 'equipment', title, satchelSid));
}

const compendium = uniqueById([
  ...animals,
  ...legendaryAnimals,
  ...fish,
  ...legendaryFish,
  ...plants,
  ...weapons,
  ...horses,
  ...gangs,
  ...equipment,
]);
saveJson('compendium.json', compendium);
console.log('compendium', {
  animal: animals.length,
  legendaryAnimal: legendaryAnimals.length,
  fish: fish.length,
  legendaryFish: legendaryFish.length,
  plant: plants.length,
  weapon: weapons.length,
  horse: horses.length,
  gang: gangs.length,
  equipment: equipment.length,
  total: compendium.length,
});

// --- Missables from missable missions + item requests ---
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
    research: research(m.sourceIds ?? [pctSid]),
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
