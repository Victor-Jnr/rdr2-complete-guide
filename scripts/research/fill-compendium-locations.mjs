/**
 * Fill Compendium generalLocation from Wiki infobox / Location sections,
 * and write species icon → compendiumId mappings onto map markers.
 * Run: node scripts/research/fill-compendium-locations.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const dataDir = path.join(root, 'src', 'data');
const cacheDir = path.join(root, 'scripts', '.cache', 'wiki');
const TODAY = '2026-09-06';
const UA = 'rdr2-complete-guide/0.4 (fan project; local compendium location enricher)';
fs.mkdirSync(cacheDir, { recursive: true });

const REGION_BY_NAME = {
  ambarino: 'ambarino',
  'new hanover': 'new-hanover',
  lemoyne: 'lemoyne',
  'west elizabeth': 'west-elizabeth',
  'new austin': 'new-austin',
  guarma: 'guarma',
};

/** Hand-maintained RDOMap icon name → compendium ids. Unmapped names are reported, not guessed. */
const ICON_MAP = {
  animal_alligator: ['comp-animal-american-alligator', 'comp-animal-american-alligator-small'],
  animal_armadillo: ['comp-animal-nine-banded-armadillo'],
  animal_badger: ['comp-animal-american-badger'],
  animal_band_pigeon: ['comp-animal-band-tailed-pigeon'],
  animal_bat: ['comp-animal-little-brown-bat'],
  animal_beaver: ['comp-animal-north-american-beaver'],
  animal_bighornram_ram_rocky: ['comp-animal-rocky-mountain-bighorn-ram'],
  animal_bighornram_sheep_rocky: ['comp-animal-rocky-mountain-bighorn-sheep'],
  animal_bighornram_sierra: ['comp-animal-sierra-nevada-bighorn-ram', 'comp-animal-sierra-nevada-bighorn-sheep'],
  animal_bison: ['comp-animal-american-bison'],
  animal_black_bear: ['comp-animal-american-black-bear'],
  animal_black_squirrel: ['comp-animal-black-squirrel'],
  animal_blacktailed_rattlesnake: ['comp-animal-black-tailed-rattlesnake'],
  animal_blue_heron: ['comp-animal-great-blue-heron'],
  animal_bluejay: ['comp-animal-blue-jay'],
  animal_boar: ['comp-animal-wild-boar'],
  animal_buck: ['comp-animal-white-tailed-buck'],
  animal_californian_condor: ['comp-animal-california-condor'],
  animal_cardinal: ['comp-animal-northern-cardinal'],
  animal_cedar_wax_wing: ['comp-animal-cedar-waxwing'],
  animal_cotton_mouth_snake: ['comp-animal-cottonmouth-snake'],
  animal_cougar: ['comp-animal-cougar'],
  animal_coyote: ['comp-animal-california-valley-coyote'],
  animal_crab: ['comp-animal-cuban-land-crab'],
  animal_crow: ['comp-animal-american-crow'],
  animal_deer: ['comp-animal-white-tailed-deer'],
  animal_desert_big_horn_ram: ['comp-animal-desert-bighorn-ram'],
  animal_desert_big_horn_sheep: ['comp-animal-desert-bighorn-sheep'],
  animal_diamond_snake: ['comp-animal-diamondback-snake'],
  animal_duck_mallard: ['comp-animal-mallard-duck'],
  animal_duck_pekin: ['comp-animal-pekin-duck'],
  animal_eagle_bald_photo: ['comp-animal-bald-eagle'],
  animal_eastern_turkey_vulture: ['comp-animal-eastern-turkey-vulture'],
  animal_egret_little: ['comp-animal-little-egret'],
  animal_egret_reddish: ['comp-animal-reddish-egret'],
  animal_egret_snowy: ['comp-animal-snowy-egret'],
  animal_elk_rocky: ['comp-animal-rocky-mountain-bull-elk', 'comp-animal-rocky-mountain-cow-elk'],
  animal_elk_tule: ['comp-animal-rocky-mountain-bull-elk'],
  animal_ferdelance_snake: ['comp-animal-fer-de-lance-snake'],
  animal_fox_grey: ['comp-animal-american-gray-fox'],
  animal_golden_eagle: ['comp-animal-golden-eagle'],
  animal_goose: ['comp-animal-canada-goose'],
  animal_gray_squirrel: ['comp-animal-western-gray-squirrel'],
  animal_great_horned_owl: ['comp-animal-great-horned-owl'],
  animal_grizzly: ['comp-animal-grizzly-bear'],
  animal_hawk_redtailed: ['comp-animal-red-tailed-hawk'],
  animal_hawk_roughlegged: ['comp-animal-rough-legged-hawk'],
  animal_iguana: ['comp-animal-green-iguana', 'comp-animal-desert-iguana'],
  animal_loon_common: ['comp-animal-common-loon'],
  animal_loon_pacific: ['comp-animal-pacific-loon'],
  animal_loon_yellowbilled: ['comp-animal-yellow-billed-loon'],
  animal_moose_western_bull: ['comp-animal-western-bull-moose'],
  animal_oriole_baltimore: ['comp-animal-baltimore-oriole'],
  animal_oriole_hooded: ['comp-animal-hooded-oriole'],
  animal_owl_californian: ['comp-animal-california-horned-owl'],
  animal_owl_coastal: ['comp-animal-coastal-horned-owl'],
  animal_panther: ['comp-animal-panther'],
  animal_panther_florida: ['comp-animal-florida-panther'],
  animal_parakeet: ['comp-animal-carolina-parakeet'],
  animal_peccary: ['comp-animal-collared-peccary'],
  animal_pelican_brown: ['comp-animal-brown-pelican'],
  animal_pelican_white: ['comp-animal-american-white-pelican'],
  animal_pheasant_chinese: ['comp-animal-chinese-ring-necked-pheasant'],
  animal_pheasant_ringneck: ['comp-animal-ring-necked-pheasant'],
  animal_possum: ['comp-animal-virginia-opossum'],
  animal_prairie_chicken: ['comp-animal-greater-prairie-chicken'],
  animal_pronghorn: ['comp-animal-american-pronghorn-buck', 'comp-animal-american-pronghorn-doe'],
  animal_pronghorn_baja_photo: ['comp-animal-baja-california-pronghorn-buck', 'comp-animal-baja-california-pronghorn-doe'],
  animal_pronghorn_sonoran: ['comp-animal-sonoran-pronghorn-buck', 'comp-animal-sonoran-pronghorn-doe'],
  animal_quail: ['comp-animal-california-quail'],
  animal_rabbit: ['comp-animal-black-tailed-jackrabbit'],
  animal_racoon: ['comp-animal-american-raccoon'],
  animal_raven: ['comp-animal-western-raven'],
  animal_red_boa: ['comp-animal-red-boa'],
  animal_red_fox: ['comp-animal-american-red-fox'],
  animal_red_squirrel: ['comp-animal-american-red-squirrel'],
  animal_robin: ['comp-animal-american-robin'],
  animal_seagull_herring: ['comp-animal-herring-gull'],
  animal_seagull_laughing: ['comp-animal-laughing-gull'],
  animal_seagull_ring: ['comp-animal-ring-billed-gull'],
  animal_skunk: ['comp-animal-striped-skunk'],
  animal_snapping_turtle: ['comp-animal-alligator-snapping-turtle'],
  animal_songbird_scarlet: ['comp-animal-scarlet-tanager-songbird'],
  animal_songbird_western: ['comp-animal-western-tanager-songbird'],
  animal_sparrow_eurasian: ['comp-animal-eurasian-tree-sparrow'],
  animal_sparrow_golden: ['comp-animal-golden-crowned-sparrow'],
  animal_spoonbill: ['comp-animal-roseate-spoonbill'],
  animal_timber_wolf: ['comp-animal-timber-wolf'],
  animal_tricolour_heron: ['comp-animal-tricolored-heron'],
  animal_western_moose: ['comp-animal-western-moose'],
  animal_western_turkey_vulture: ['comp-animal-western-turkey-vulture'],
  animal_whooping_crane: ['comp-animal-whooping-crane'],
  animal_wolf_gray: ['comp-animal-gray-wolf'],
  animal_woodpecker_pileated: ['comp-animal-pileated-woodpecker'],
  animal_woodpecker_red: ['comp-animal-red-bellied-woodpecker'],
  veg_berry_black_berry: ['comp-plant-blackberry'],
  veg_berry_evergreen_huckleberry: ['comp-plant-evergreen-huckleberry'],
  veg_berry_red_raspberry: ['comp-plant-red-raspberry'],
  veg_berry_wintergreen_berry: ['comp-plant-wintergreen-berry'],
  veg_herb_alaskan_ginseng: ['comp-plant-alaskan-ginseng'],
  veg_herb_american_ginseng: ['comp-plant-american-ginseng'],
  veg_herb_black_currant: ['comp-plant-blackcurrant'],
  veg_herb_burdock_root: ['comp-plant-burdock-root'],
  veg_herb_common_bulrush: ['comp-plant-common-bulrush'],
  veg_herb_desert_sage: ['comp-plant-desert-sage'],
  veg_herb_english_mace: ['comp-plant-english-mace'],
  veg_herb_golden_currant: ['comp-plant-golden-currant'],
  veg_herb_hummingbird_sage: ['comp-plant-hummingbird-sage'],
  veg_herb_indian_tobacco: ['comp-plant-indian-tobacco'],
  veg_herb_milkweed: ['comp-plant-milkweed'],
  veg_herb_oleander_sage: ['comp-plant-oleander-sage'],
  veg_herb_prairie_poppy: ['comp-plant-prairie-poppy'],
  veg_herb_red_sage: ['comp-plant-red-sage'],
  veg_herb_violet_snowdrop: ['comp-plant-violet-snowdrop'],
  veg_herb_wild_carrots: ['comp-plant-wild-carrot'],
  veg_herb_wild_feverfew: ['comp-plant-wild-feverfew'],
  veg_herb_yarrow: ['comp-plant-yarrow'],
  veg_mushroom_bay_bolete: ['comp-plant-bay-bolete'],
  veg_mushroom_chanterelles: ['comp-plant-chanterelles'],
  veg_mushroom_parasol_mushroom: ['comp-plant-parasol-mushroom'],
  veg_mushroom_rams_head: ['comp-plant-rams-head'],
  veg_spice_creeping_thyme: ['comp-plant-creeping-thyme'],
  veg_spice_oregano: ['comp-plant-oregano'],
  veg_spice_wild_mint: ['comp-plant-wild-mint'],
};

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
function wikiUrl(title) {
  return `https://reddead.fandom.com/wiki/${encodeURIComponent(title.replaceAll(' ', '_'))}`;
}
function cacheFile(title) {
  return path.join(cacheDir, slug(title) + '.json');
}
async function fetchWikitext(title) {
  const file = cacheFile(title);
  if (fs.existsSync(file)) {
    const cached = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (cached.exists || cached.error) return cached;
  }
  let lastErr;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const api = `https://reddead.fandom.com/api.php?action=parse&page=${encodeURIComponent(title)}&prop=wikitext&format=json&formatversion=2&redirects=1`;
      const res = await fetch(api, { headers: { 'User-Agent': UA } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
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
    } catch (err) {
      lastErr = err;
      console.warn(`fetch ${title} attempt ${attempt}:`, err.message);
      await new Promise((r) => setTimeout(r, 800 * attempt));
    }
  }
  const payload = { title, exists: false, wikitext: '', error: String(lastErr) };
  fs.writeFileSync(file, JSON.stringify(payload, null, 2));
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
function wikiLinks(text) {
  const out = [];
  const re = /\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?\]\]/g;
  let m;
  while ((m = re.exec(text))) {
    const page = m[1].trim();
    const label = (m[2] ?? page).trim();
    if (/^(file|image|category|category):/i.test(page)) continue;
    out.push({ page, label });
  }
  return out;
}
function infoboxBlock(wikitext) {
  const start = wikitext.search(/\{\{\s*(Animal infobox|Infobox flower|Plant infobox|Infobox animal)/i);
  if (start < 0) return '';
  let depth = 0;
  for (let i = start; i < wikitext.length - 1; i += 1) {
    if (wikitext[i] === '{' && wikitext[i + 1] === '{') {
      depth += 1;
      i += 1;
    } else if (wikitext[i] === '}' && wikitext[i + 1] === '}') {
      depth -= 1;
      i += 1;
      if (depth === 0) return wikitext.slice(start, i + 1);
    }
  }
  return wikitext.slice(start, start + 2500);
}
function infoboxField(block, field) {
  const re = new RegExp(`\\|\\s*${field}\\s*=\\s*([\\s\\S]*?)(?=\\n\\s*\\||\\n\\}\\})`, 'i');
  const m = block.match(re);
  return m ? m[1].trim() : '';
}

function parseLocation(wikitext) {
  const box = infoboxBlock(wikitext);
  const locField =
    infoboxField(box, 'loc') || infoboxField(box, 'location') || infoboxField(box, 'habitat');
  const locSection =
    section(wikitext, 'Location') ||
    section(wikitext, 'Locations') ||
    section(wikitext, 'Habitat');
  const combined = `${locField}\n${locSection}`;
  const regionIds = [];
  const namedPlaces = [];
  const seenPlace = new Set();
  for (const { page, label } of wikiLinks(combined)) {
    const key = page.replace(/\s*\(RDR ?2?\)/i, '').trim().toLowerCase();
    const region = REGION_BY_NAME[key];
    if (region) {
      if (!regionIds.includes(region)) regionIds.push(region);
      continue;
    }
    const name = stripWiki(label) || stripWiki(page);
    if (!name || seenPlace.has(name.toLowerCase())) continue;
    seenPlace.add(name.toLowerCase());
    namedPlaces.push(name);
  }
  let summary;
  const paras = locSection
    .split(/\n{2,}/)
    .map(stripWiki)
    .filter((p) => p.length > 40 && !p.startsWith('='));
  if (paras[0]) summary = paras[0].slice(0, 600);
  else {
    const lead = wikitext
      .replace(/\{\{[^}]*\}\}/g, ' ')
      .split(/\n{2,}/)
      .map(stripWiki)
      .find((p) => p.length > 60 && /found|live|habitat|grow|appear|common|region|state/i.test(p));
    if (lead) summary = lead.slice(0, 600);
  }
  return { regionIds, namedPlaces, summary };
}

const sources = loadJson('sources.json');
function ensureSource(id, title) {
  let src = sources.find((s) => s.id === id);
  if (!src) {
    src = {
      id,
      sourceName: 'Red Dead Wiki',
      pageTitle: title,
      url: wikiUrl(title),
      sourceType: 'wiki',
      verificationStatus: 'researched',
      accessedAt: TODAY,
      publicAttribution: true,
    };
    sources.push(src);
  }
  return src;
}

const locations = loadJson('locations.json');
const locByName = new Map(locations.map((l) => [String(l.name).toLowerCase(), l.id]));

function toGeneralLocation(parsed, sourceId) {
  if (!parsed.regionIds.length && !parsed.namedPlaces.length && !parsed.summary) return undefined;
  const locationIds = parsed.namedPlaces.map((n) => locByName.get(n.toLowerCase())).filter(Boolean);
  return {
    regionIds: parsed.regionIds,
    summary: parsed.summary,
    namedPlaces: parsed.namedPlaces,
    ...(locationIds.length ? { locationIds: [...new Set(locationIds)] } : {}),
    research: { verificationStatus: 'researched', sourceIds: [sourceId], lastReviewedAt: TODAY },
  };
}

const compendium = loadJson('compendium.json');
const byTitle = new Map(compendium.map((c) => [c.title.toLowerCase(), c]));

function applyPage(entry, page, familyTitle, requestedTitle) {
  const sid = `wiki-${slug(page.title || requestedTitle)}`;
  ensureSource(sid, page.title || requestedTitle);
  entry.familyTitle = familyTitle;
  entry.wikiPageTitle = page.title || requestedTitle;
  if (!entry.sourceIds?.includes(sid)) entry.sourceIds = [...(entry.sourceIds ?? []), sid];
  const parsed = parseLocation(page.wikitext);
  const gen = toGeneralLocation(parsed, sid);
  if (gen) entry.generalLocation = gen;
  entry.research = {
    verificationStatus: 'researched',
    sourceIds: [...new Set([...(entry.research?.sourceIds ?? []), sid])],
    lastReviewedAt: TODAY,
  };
}

const speciesPage = await fetchWikitext('Animals/Redemption 2 species');
ensureSource('wiki-animals-redemption-2-species', 'Animals/Redemption 2 species');
const familyJobs = [];
const table = speciesPage.wikitext.split('{|')[1]?.split('|}')[0] ?? '';
for (const row of table.split('|-').slice(1)) {
  const fam = row.match(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/);
  if (!fam) continue;
  const familyPage = fam[1].trim();
  const familyTitle = (fam[2] ?? fam[1]).replace(/'''/g, '').trim();
  if (/^file:/i.test(familyPage) || /^equine$/i.test(familyTitle)) continue;
  const varietyCell = row.split('||')[1] ?? row.split('\n').slice(1).join('\n');
  const varietyTitles = [];
  for (const part of varietyCell.replace(/<br\s*\/?>/gi, '\n').split('\n')) {
    const name = stripWiki(part.replace(/^\|/, '').replace(/'''/g, ''));
    if (!name || /^legendary /i.test(name) || name.length > 60) continue;
    varietyTitles.push(name);
  }
  familyJobs.push({ familyPage, familyTitle, varietyTitles });
}

const seenFamily = new Set();
for (const job of familyJobs) {
  if (seenFamily.has(job.familyPage)) continue;
  seenFamily.add(job.familyPage);
  const page = await fetchWikitext(job.familyPage);
  if (!page.exists) {
    console.warn('missing family page', job.familyPage);
    continue;
  }
  const related = familyJobs.filter((j) => j.familyPage === job.familyPage);
  const titles = related.flatMap((j) => j.varietyTitles);
  for (const title of titles) {
    const entry = byTitle.get(title.toLowerCase());
    if (entry && entry.kind === 'animal') applyPage(entry, page, job.familyTitle, job.familyPage);
  }
}

for (const entry of compendium.filter((c) => c.kind === 'legendary-animal')) {
  const page = await fetchWikitext(entry.title);
  if (!page.exists) {
    console.warn('missing legendary page', entry.title);
    continue;
  }
  applyPage(entry, page, 'Legendary animal', entry.title);
}

const fishNames = [
  'Bluegill',
  'Bullhead Catfish',
  'Chain Pickerel',
  'Channel Catfish',
  'Lake Sturgeon',
  'Largemouth Bass',
  'Longnose Gar',
  'Muskie',
  'Northern Pike',
  'Perch',
  'Redfin Pickerel',
  'Rock Bass',
  'Smallmouth Bass',
  'Sockeye Salmon',
  'Steelhead Trout',
];
for (const name of fishNames) {
  const page = await fetchWikitext(name);
  const entry = byTitle.get(name.toLowerCase());
  if (entry && page.exists) applyPage(entry, page, 'Fish', name);
  else if (!page.exists) console.warn('missing fish page', name);
  const legTitle = `Legendary ${name}`;
  const leg = byTitle.get(legTitle.toLowerCase());
  const legPage = await fetchWikitext(legTitle);
  if (leg && legPage.exists) applyPage(leg, legPage, 'Legendary fish', legTitle);
  else if (leg && !legPage.exists) console.warn('missing legendary fish page', legTitle);
}

const plantPage = await fetchWikitext('Plant Gathering in Redemption 2');
ensureSource('wiki-plant-gathering', 'Plant Gathering in Redemption 2');
const plantBlock = plantPage.wikitext.split("==''Red Dead Online''==")[0] ?? plantPage.wikitext;
const plantLinks = wikiLinks(plantBlock.split('==Types of Plants and Herbs==')[1] ?? '');
const seenPlant = new Set();
for (const { page, label } of plantLinks) {
  const title = stripWiki(label);
  if (!title || seenPlant.has(page) || /file:|category:|challenges/i.test(page)) continue;
  seenPlant.add(page);
  const entry = byTitle.get(title.toLowerCase()) || compendium.find((c) => c.kind === 'plant' && c.title.toLowerCase() === title.toLowerCase());
  const wiki = await fetchWikitext(page);
  if (entry && wiki.exists) applyPage(entry, wiki, 'Plant', page);
  else if (!wiki.exists) console.warn('missing plant page', page);
}

const markers = loadJson('mapMarkers.json');
const knownIds = new Set(compendium.map((c) => c.id));
const unmapped = new Set();
let marked = 0;
for (const marker of markers) {
  let icon;
  if (marker.type === 'animal-habitat') icon = marker.externalKey?.split(':')[1];
  else if (marker.type === 'herb') icon = marker.externalKey?.split(':')[1];
  if (!icon) continue;
  const ids = ICON_MAP[icon];
  if (!ids) {
    if (icon !== 'animal_horses') unmapped.add(icon);
    continue;
  }
  const valid = ids.filter((id) => knownIds.has(id));
  if (!valid.length) {
    unmapped.add(icon);
    continue;
  }
  marker.compendiumId = valid[0];
  marked += 1;
}

saveJson('compendium.json', compendium);
saveJson('mapMarkers.json', markers);
saveJson('sources.json', sources);
saveJson('speciesIcons.json', ICON_MAP);

const withLoc = compendium.filter((c) => c.generalLocation).length;
console.log('compendium with generalLocation', withLoc, '/', compendium.length);
console.log('habitat/herb markers tagged', marked);
if (unmapped.size) console.warn('unmapped icons', [...unmapped].sort().join(', '));
console.log('done');
