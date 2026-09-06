/**
 * Import public-domain jeanropke/RDOMap pins into mapMarkers.json / locations.json.
 * Run: node scripts/research/import-jeanropke.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  applyTransform,
  fitAffine,
  residuals,
  rmsDistance,
  tileToNormalized,
} from './jeanropke-transform.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const dataDir = path.join(root, 'src', 'data');
const cacheDir = path.join(root, 'scripts', '.cache', 'jeanropke');
const calibPath = path.join(root, 'scripts', 'research', 'calibration.json');
const TODAY = '2026-09-06';
const COMMIT = '922daf072c3ea027c5d5ed097173ce66d70d65b6';
const SOURCE_ID = 'gh-jeanropke-rdomap';
const UA = 'rdr2-complete-guide/0.3 (fan project; local jeanropke importer)';
const FT_TITLES = {
  'fasttravel.annesburg': 'Annesburg',
  'fasttravel.armadillo': 'Armadillo',
  'fasttravel.blackwater': 'Blackwater',
  'fasttravel.colter': 'Colter',
  'fasttravel.emerald': 'Emerald Ranch',
  'fasttravel.lagras': 'Lagras',
  'fasttravel.macfarlanes': "MacFarlane's Ranch",
  'fasttravel.manzanita': 'Manzanita Post',
  'fasttravel.rhodes': 'Rhodes',
  'fasttravel.saint_denis': 'Saint Denis',
  'fasttravel.strawberry': 'Strawberry',
  'fasttravel.tumbleweed': 'Tumbleweed',
  'fasttravel.valentine': 'Valentine',
  'fasttravel.van_horn': 'Van Horn',
  'fasttravel.wapiti': 'Wapiti',
};

const LABEL_TITLES = {
  hideout_beaver_hollow: 'Beaver Hollow',
  hideout_clemens_point: 'Clemens Point',
  hideout_colter: 'Colter',
  hideout_gaptooth_breach: 'Gaptooth Breach',
  hideout_hanging_dog_ranch: 'Hanging Dog Ranch',
  hideout_horseshoe_overlook: 'Horseshoe Overlook',
  hideout_pikes_basin: "Pike's Basin",
  hideout_shady_belle: 'Shady Belle',
  hideout_six_point_cabin: 'Six Point Cabin',
  hideout_solomons_folly: "Solomon's Folly",
  'special_settlement_beechers_hope': "Beecher's Hope",
  'special_settlement_pronghorn_ranch': 'Pronghorn Ranch',
  settlement_beechers_hope: "Beecher's Hope",
  settlement_butcher_creek: 'Butcher Creek',
  settlement_coots_chapel: "Coot's Chapel",
  settlement_cornwall_kerosene_tar: 'Cornwall Kerosene & Tar',
  settlement_ewing_basin: 'Ewing Basin',
};

/**
 * locations.json entries whose coordinates come from a specific RDOMap marker rather than
 * from a name match (key = marker externalKey). Used for mission-start / treasure-step pins.
 */
const LOCATION_ALIASES = {
  'label:special_settlement_pronghorn_ranch': 'loc-pronghorn-ranch',
  'label:homestead_adler_ranch': 'loc-adler-ranch',
  'label:homestead_carmody_dell': 'loc-carmody-dell',
  'label:landmark_face_rock': 'loc-face-rock',
  'label:landmark_greenhollow': 'loc-greenhollow',
  shop_ben_post_office: 'loc-benedict-point',
  discoverable_obelisk: 'loc-obelisk',
  discoverable_serpent_mound: 'loc-serpent-mound',
  discoverable_hermit_woman: 'loc-little-creek-hermit',
  discoverable_one_room_church: 'loc-tiny-church',
  // Limpany is the unlabelled burned town on the Dakota River between Caliban's Seat and Flatneck.
  'label:discoverabletext_burned_settlement': 'loc-limpany',
  // Old Trail Rise = ruined cabin east of Dewberry Creek whose basement carries the carved names.
  'label:shack_underground_railroad': 'loc-old-trail-rise',
  // Manito Glade = the angry hermit's homestead north of Annesburg.
  'label:shack_angry_isolationist': 'loc-manito-glade',
};

/** sp_areas labels worth importing as place markers (the rest are story-flow areas). */
const AREA_LABELS = new Set(['special_settlement_pronghorn_ranch']);

/**
 * locations.json entries with no RDOMap counterpart, measured directly on our zoom-5 tiles
 * (source px of the printed label / station icon). Source: MAP_SOURCE_ID.
 */
const MAP_SOURCE_ID = 'wiki-full-world-map';
const TILE_MEASURED = {
  'loc-flatneck-station': { px: [4371.5, 2400.5], note: 'station icon' },
  'loc-barrow-lagoon': { px: [3988, 1238], note: 'printed label centre (lagoon)' },
  'loc-bolger-glade': { px: [5515, 3305], note: 'printed label centre' },
  'loc-cairn-lodge': { px: [3955, 840], note: 'Cairn Lake label; the lodge sits on the lake shore' },
  'loc-calibans-seat': { px: [4331, 2014], note: 'printed label centre' },
  'loc-cotorra-springs': { px: [4637, 1092], note: 'printed label centre' },
  'loc-cumberland-falls': { px: [3950, 1890], note: 'printed label / falls on the Dakota River' },
  'loc-cumberland-forest': { px: [4700, 1485], note: 'centre of the CUMBERLAND FOREST region label' },
  'loc-diablo-ridge': { px: [3852, 2292], note: 'printed label centre' },
  'loc-elysian-pool': { px: [6050, 1612], note: 'printed label centre (pool)' },
  'loc-fort-wallace': { px: [4843, 1286], note: 'printed label centre' },
  'loc-lakay': { px: [6000, 2640], note: 'printed label centre' },
  'loc-montos-rest': { px: [3655, 2305], note: 'printed label centre' },
  'loc-mount-shann': { px: [3300, 2162], note: 'printed label centre' },
  'loc-ocreaghs-run': { px: [5585, 1305], note: 'printed label centre (lake)' },
  'loc-sd-docks': { px: [6110, 3125], note: 'pier / warehouse row west of the Saint Denis station' },
  'loc-sd-graveyard': { px: [6260, 2845], note: 'walled cemetery enclosure, north-east Saint Denis' },
  'loc-sea-of-coronado': { px: [550, 4400], note: 'printed label centre (sea)' },
  'loc-twin-rocks': { px: [2100, 3472], note: 'printed label centre' },
};

const FILES = ['discoverables.json', 'singleplayer.json', 'shops.json', 'fasttravels.json'];

fs.mkdirSync(cacheDir, { recursive: true });

function loadJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, rel), 'utf8'));
}
function saveJson(rel, value) {
  fs.writeFileSync(path.join(dataDir, rel), JSON.stringify(value, null, 2) + '\n');
}
function research() {
  return { verificationStatus: 'researched', sourceIds: [SOURCE_ID], lastReviewedAt: TODAY };
}
function slug(text) {
  return String(text)
    .toLowerCase()
    .replaceAll("'", '')
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-|-$/g, '');
}
function titleFromKey(key) {
  return String(key)
    .replace(/^(fasttravel\.|shop_[a-z]+_|sp_|discoverabletext_|discoverable_|hideout_|collectable_)/i, '')
    .replace(/^animal_fish_/i, 'Legendary ')
    .replace(/^animal_legendary_/i, 'Legendary ')
    .replace(/^animal_/i, '')
    .replace(/^veg_/i, '')
    .replaceAll(/[._]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replaceAll(' Of ', ' of ')
    .replaceAll(' The ', ' the ')
    .replaceAll(' In ', ' in ')
    .trim();
}
function jrPoint(entry) {
  if (typeof entry.lat === 'number' && typeof entry.lng === 'number') {
    return { lat: entry.lat, lng: entry.lng };
  }
  if (typeof entry.x === 'number' && typeof entry.y === 'number') {
    return { lat: entry.x, lng: entry.y };
  }
  return null;
}

async function fetchFile(name) {
  const dest = path.join(cacheDir, name);
  if (fs.existsSync(dest)) return JSON.parse(fs.readFileSync(dest, 'utf8'));
  const url = `https://raw.githubusercontent.com/jeanropke/RDOMap/${COMMIT}/data/${name}`;
  let lastErr;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } });
      if (!res.ok) throw new Error(`Fetch ${name} failed: ${res.status}`);
      const json = await res.json();
      fs.writeFileSync(dest, JSON.stringify(json));
      return json;
    } catch (err) {
      lastErr = err;
      console.warn(`fetch ${name} attempt ${attempt} failed:`, err.cause?.code ?? err.message);
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
  throw lastErr;
}

const calib = JSON.parse(fs.readFileSync(calibPath, 'utf8'));
const MAX_RMS = calib.maxRms ?? 0.004;
const fitPoints = calib.controlPoints.map((p) => {
  const n = tileToNormalized(p.tile.x, p.tile.y, calib.image);
  return { id: p.id, lat: p.jeanropke.lat, lng: p.jeanropke.lng, x: n.x, y: n.y };
});
const transform = fitAffine(fitPoints);
const res = residuals(fitPoints, transform);
const rms = rmsDistance(res);
const maxResidual = Math.max(...res.map((r) => r.distance));
calib.transform = {
  ...transform,
  rms,
  maxResidual,
  residuals: res.map((r) => ({
    id: r.id,
    dx: Number(r.dx.toFixed(5)),
    dy: Number(r.dy.toFixed(5)),
    distance: Number(r.distance.toFixed(5)),
  })),
};
fs.writeFileSync(calibPath, JSON.stringify(calib, null, 2) + '\n');
console.log('calibration RMS', rms.toFixed(5), 'max', maxResidual.toFixed(5));
if (rms > MAX_RMS) {
  console.error('RMS exceeds', MAX_RMS);
  process.exit(1);
}

function toNorm(entry) {
  const p = jrPoint(entry);
  if (!p) return null;
  const n = applyTransform(p.lat, p.lng, transform);
  if (n.x < 0 || n.x > 1 || n.y < 0 || n.y > 1) return null;
  return n;
}

const [discoverables, singleplayer, shops, fasttravels] = await Promise.all(FILES.map(fetchFile));

const LEGENDARY = {
  animal_legendary_bear: {
    title: 'Legendary Bharati Grizzly Bear',
    id: 'comp-leg-animal-legendary-bharati-grizzly-bear',
  },
  animal_legendary_beaver: { title: 'Legendary Beaver', id: 'comp-leg-animal-legendary-beaver' },
  animal_legendary_big_horn: {
    title: 'Legendary Bighorn Ram',
    id: 'comp-leg-animal-legendary-bighorn-ram',
  },
  animal_legendary_boar: { title: 'Legendary Boar', id: 'comp-leg-animal-legendary-boar' },
  animal_legendary_buck: { title: 'Legendary Buck', id: 'comp-leg-animal-legendary-buck' },
  animal_legendary_buffalo: {
    title: 'Legendary Tatanka Bison',
    id: 'comp-leg-animal-legendary-tatanka-bison',
  },
  animal_legendary_bullgator: {
    title: 'Legendary Bullgator',
    id: 'comp-leg-animal-legendary-bullgator',
  },
  animal_legendary_cougar: { title: 'Legendary Cougar', id: 'comp-leg-animal-legendary-cougar' },
  animal_legendary_coyote: { title: 'Legendary Coyote', id: 'comp-leg-animal-legendary-coyote' },
  animal_legendary_elk: { title: 'Legendary Elk', id: 'comp-leg-animal-legendary-elk' },
  animal_legendary_fox: { title: 'Legendary Fox', id: 'comp-leg-animal-legendary-fox' },
  animal_legendary_moose: { title: 'Legendary Moose', id: 'comp-leg-animal-legendary-moose' },
  animal_legendary_panther: {
    title: 'Legendary Giaguaro Panther',
    id: 'comp-leg-animal-legendary-giaguaro-panther',
  },
  animal_legendary_pronghorn: {
    title: 'Legendary Pronghorn',
    id: 'comp-leg-animal-legendary-pronghorn',
  },
  animal_legendary_white_buffalo: {
    title: 'Legendary White Bison',
    id: 'comp-leg-animal-legendary-white-bison',
  },
  animal_legendary_wolf: { title: 'Legendary Wolf', id: 'comp-leg-animal-legendary-wolf' },
  animal_fish_bass_large_mouth: {
    title: 'Legendary Largemouth Bass',
    id: 'comp-leg-fish-legendary-largemouth-bass',
  },
  animal_fish_bass_rock: { title: 'Legendary Rock Bass', id: 'comp-leg-fish-legendary-rock-bass' },
  animal_fish_bass_small_mouth: {
    title: 'Legendary Smallmouth Bass',
    id: 'comp-leg-fish-legendary-smallmouth-bass',
  },
  animal_fish_bluegill: { title: 'Legendary Bluegill', id: 'comp-leg-fish-legendary-bluegill' },
  animal_fish_catfish_bullhead: {
    title: 'Legendary Bullhead Catfish',
    id: 'comp-leg-fish-legendary-bullhead-catfish',
  },
  animal_fish_catfish_channel: { title: 'Legendary Channel Catfish', id: null },
  animal_fish_gar_long_nose: {
    title: 'Legendary Longnose Gar',
    id: 'comp-leg-fish-legendary-longnose-gar',
  },
  animal_fish_muskie: { title: 'Legendary Muskie', id: 'comp-leg-fish-legendary-muskie' },
  animal_fish_perch: { title: 'Legendary Perch', id: 'comp-leg-fish-legendary-perch' },
  animal_fish_pickeral_chain: {
    title: 'Legendary Chain Pickerel',
    id: 'comp-leg-fish-legendary-chain-pickerel',
  },
  animal_fish_pickeral_redfin: {
    title: 'Legendary Redfin Pickerel',
    id: 'comp-leg-fish-legendary-redfin-pickerel',
  },
  animal_fish_pike_northern: { title: 'Legendary Northern Pike', id: null },
  animal_fish_salmon_sockeye: {
    title: 'Legendary Sockeye Salmon',
    id: 'comp-leg-fish-legendary-sockeye-salmon',
  },
  animal_fish_sturgeon_lake: {
    title: 'Legendary Lake Sturgeon',
    id: 'comp-leg-fish-legendary-lake-sturgeon',
  },
  animal_fish_trout_steelhead: {
    title: 'Legendary Steelhead Trout',
    id: 'comp-leg-fish-legendary-steelhead-trout',
  },
};

const GRAVES = {
  sp_grave_am: { title: "Arthur Morgan's grave", collectibleId: 'col-grave-arthur-morgan' },
  sp_grave_dc: { title: "Davey Callander's grave", collectibleId: 'col-grave-davey-callander' },
  sp_grave_ef: { title: "Eagle Flies's grave", collectibleId: 'col-grave-eagle-flies' },
  sp_grave_hm: { title: "Hosea Matthews's grave", collectibleId: 'col-grave-hosea-matthews' },
  sp_grave_jc: { title: "Jenny Kirk's grave", collectibleId: 'col-grave-jenny-kirk' },
  sp_grave_kd: { title: "Kieran Duffy's grave", collectibleId: 'col-grave-kieran-duffy' },
  sp_grave_ls: { title: "Lenny Summers's grave", collectibleId: 'col-grave-lenny-summers' },
  sp_grave_sg: { title: "Susan Grimshaw's grave", collectibleId: 'col-grave-susan-grimshaw' },
  sp_grave_sm: { title: "Sean MacGuire's grave", collectibleId: 'col-grave-sean-macguire' },
};

const SKIP_SHOPS = new Set(['honor', 'harriet', 'wardrobe']);

const SHOP_TYPE = {
  barber: 'barber',
  butcher: 'butcher',
  doctor: 'doctor',
  fence: 'fence',
  general_store: 'general-store',
  gunsmith: 'gunsmith',
  photo_studio: 'photo-studio',
  post_office: 'post-office',
  saloon: 'saloon',
  stable: 'stable',
  tackle: 'bait-shop',
  tailor: 'tailor',
  trapper: 'trapper',
};

const markers = [];
const seenExt = new Set();

function pushMarker(partial) {
  const externalKey = partial.externalKey;
  if (seenExt.has(externalKey)) {
    console.warn('duplicate externalKey', externalKey);
    return;
  }
  seenExt.add(externalKey);
  const n = partial.x != null ? { x: partial.x, y: partial.y } : toNorm(partial.src);
  if (!n) return;
  markers.push({
    id: `marker-jr-${slug(externalKey)}`,
    type: partial.type,
    title: partial.title,
    subtitle: partial.subtitle,
    x: Number(n.x.toFixed(5)),
    y: Number(n.y.toFixed(5)),
    externalKey,
    locationId: partial.locationId,
    compendiumId: partial.compendiumId,
    collectibleSetId: partial.collectibleSetId,
    sourceIds: [SOURCE_ID],
    research: research(),
  });
}

const spByKey = Object.fromEntries(singleplayer.map((g) => [g.key, g]));

function numbered(group, type, titlePrefix, setId, subtitle) {
  const locs = group?.locations ?? [];
  locs.forEach((loc, i) => {
    const n = i + 1;
    const key = loc.text || `${group.key}_${n}`;
    pushMarker({
      type,
      title: `${titlePrefix} (map #${n})`,
      subtitle,
      externalKey: `${group.key}:${n}`,
      src: loc,
      collectibleSetId: setId,
    });
    void key;
  });
}

numbered(spByKey.sp_dino_bones, 'dinosaur-bone', 'Dinosaur Bone', 'set-dinosaur-bones', 'Numbering is the map dump order, not the Wiki table.');
numbered(spByKey.sp_dreamcatchers, 'dreamcatcher', 'Dreamcatcher', 'set-dreamcatchers', 'RDOMap lists 21; the Wiki strand has 20.');
numbered(spByKey.sp_rock_carvings, 'rock-carving', 'Rock Carving', 'set-rock-carvings');
numbered(spByKey.sp_wilderness_chests, 'wilderness-chest', 'Wilderness Chest', undefined, 'Story-mode wilderness chest');

for (const loc of spByKey.sp_graves?.locations ?? []) {
  const meta = GRAVES[loc.text] ?? { title: titleFromKey(loc.text) };
  pushMarker({
    type: 'grave',
    title: meta.title,
    externalKey: loc.text,
    src: loc,
    collectibleSetId: 'set-graves',
  });
}

for (const group of singleplayer) {
  if (!group.key?.startsWith('sp_orchid_')) continue;
  (group.locations ?? []).forEach((loc, i) => {
    pushMarker({
      type: 'orchid',
      title: titleFromKey(group.key.replace(/^sp_orchid_/, 'orchid_')),
      subtitle: 'Exotic orchid spawn',
      externalKey: `${group.key}:${i + 1}`,
      src: loc,
      collectibleSetId: 'set-exotics',
    });
  });
}

for (const group of discoverables) {
  if (group.key === 'animal') {
    (group.locations ?? []).forEach((loc, i) => {
      pushMarker({
        type: 'animal-habitat',
        title: titleFromKey(loc.name),
        subtitle: 'In-game habitat icon',
        externalKey: `habitat:${loc.name}:${i + 1}`,
        src: loc,
      });
    });
  } else if (group.key === 'vegetation') {
    (group.locations ?? []).forEach((loc, i) => {
      pushMarker({
        type: 'herb',
        title: titleFromKey(loc.name),
        subtitle: 'In-game herb icon',
        externalKey: `herb:${loc.name}:${i + 1}`,
        src: loc,
      });
    });
  } else if (group.key === 'discoverable') {
    (group.locations ?? []).forEach((loc) => {
      pushMarker({
        type: 'point-of-interest',
        title: titleFromKey(loc.name),
        externalKey: loc.name,
        src: loc,
        collectibleSetId: 'set-points-of-interest',
      });
    });
  } else if (group.key === 'sp_legendaries') {
    for (const loc of group.locations ?? []) {
      const meta = LEGENDARY[loc.name];
      const isFish = loc.name.startsWith('animal_fish_');
      pushMarker({
        type: isFish ? 'legendary-fish' : 'legendary-animal',
        title: meta?.title ?? titleFromKey(loc.name),
        externalKey: loc.name,
        src: loc,
        compendiumId: meta?.id ?? undefined,
      });
    }
  } else if (group.key === 'text' || group.key === 'sp_areas') {
    for (const loc of group.locations ?? []) {
      const name = loc.name ?? '';
      if (group.key === 'sp_areas' && !AREA_LABELS.has(name)) continue;
      let type = 'landmark';
      if (name.startsWith('hideout_')) type = 'gang-camp';
      else if (/^(town_|settlement_|fasttravel|special_settlement_)/.test(name)) type = 'town';
      const title = LABEL_TITLES[name] ?? titleFromKey(name);
      pushMarker({
        type,
        title,
        subtitle: type === 'gang-camp' ? 'Gang camp / hideout' : 'Map label',
        externalKey: `label:${name}`,
        src: loc,
      });
    }
  }
}

for (const shop of shops) {
  if (SKIP_SHOPS.has(shop.key)) continue;
  const type = SHOP_TYPE[shop.key];
  if (!type) continue;
  (shop.locations ?? []).forEach((loc, i) => {
    pushMarker({
      type,
      title: titleFromKey(loc.text || shop.key),
      subtitle: titleFromKey(shop.key),
      externalKey: loc.text || `${shop.key}:${i + 1}`,
      src: loc,
    });
  });
}

for (const loc of fasttravels) {
  pushMarker({
    type: 'fast-travel',
    title: FT_TITLES[loc.text] ?? titleFromKey(loc.text),
    subtitle: 'Fast travel',
    externalKey: loc.text,
    src: loc,
  });
}

const sources = loadJson('sources.json');
if (!sources.some((s) => s.id === SOURCE_ID)) {
  sources.push({
    id: SOURCE_ID,
    sourceName: 'jeanropke/RDOMap',
    pageTitle: 'RDOMap marker data (Unlicense)',
    url: `https://github.com/jeanropke/RDOMap/tree/${COMMIT}/data`,
    sourceType: 'community',
    verificationStatus: 'researched',
    accessedAt: TODAY,
    publicAttribution: true,
    notes: `Public-domain (Unlicense) game-extracted coordinates at commit ${COMMIT}. Not copied from rdr2map.com / Map Genie.`,
  });
}

const locations = loadJson('locations.json');
function normName(s) {
  return String(s)
    .toLowerCase()
    .replaceAll("'", '')
    .replaceAll(/[^a-z0-9]+/g, ' ')
    .trim();
}
const locByName = new Map(locations.map((l) => [normName(l.name), l]));

const PLACE_TYPES = new Set(['fast-travel', 'town', 'gang-camp', 'landmark']);
const addedLocations = [];
const updatedLocations = [];
const locById = new Map(locations.map((l) => [l.id, l]));
for (const m of markers) {
  const aliasId = LOCATION_ALIASES[m.externalKey];
  if (aliasId) {
    const target = locById.get(aliasId);
    if (!target) {
      console.warn('alias target missing', aliasId);
    } else {
      target.coordinate = { x: m.x, y: m.y };
      target.sourceIds = [...new Set([...(target.sourceIds ?? []), SOURCE_ID])];
      target.research = {
        verificationStatus: 'cross-checked',
        sourceIds: [...new Set([...(target.research?.sourceIds ?? []), SOURCE_ID])],
        lastReviewedAt: TODAY,
      };
      if (!m.locationId) m.locationId = aliasId;
      updatedLocations.push(aliasId);
    }
    continue;
  }
  if (!PLACE_TYPES.has(m.type)) continue;
  const nm = normName(m.title);
  const existing = locByName.get(nm);
  if (existing) {
    m.locationId = existing.id;
    if (existing.coordinate) {
      existing.coordinate = { x: m.x, y: m.y };
      existing.research = {
        verificationStatus: 'cross-checked',
        sourceIds: [...new Set([...(existing.research?.sourceIds ?? []), SOURCE_ID])],
        lastReviewedAt: TODAY,
      };
      if (!existing.sourceIds?.includes(SOURCE_ID)) {
        existing.sourceIds = [...(existing.sourceIds ?? []), SOURCE_ID];
      }
      updatedLocations.push(existing.id);
    }
  } else if (m.type === 'fast-travel' || m.type === 'gang-camp' || m.type === 'town') {
    const id = `loc-${slug(m.title)}`;
    if (locations.some((l) => l.id === id)) {
      m.locationId = id;
      continue;
    }
    const loc = {
      id,
      name: m.title,
      coordinate: { x: m.x, y: m.y },
      sourceIds: [SOURCE_ID],
      research: research(),
    };
    locations.push(loc);
    locByName.set(nm, loc);
    m.locationId = id;
    addedLocations.push(id);
  }
}

for (const [id, meas] of Object.entries(TILE_MEASURED)) {
  const target = locById.get(id);
  if (!target) {
    console.warn('measured target missing', id);
    continue;
  }
  target.coordinate = {
    x: Number((meas.px[0] / calib.image.width).toFixed(5)),
    y: Number((meas.px[1] / calib.image.height).toFixed(5)),
  };
  target.sourceIds = [...new Set([...(target.sourceIds ?? []), MAP_SOURCE_ID])];
  target.research = {
    verificationStatus: 'cross-checked',
    sourceIds: [...new Set([...(target.research?.sourceIds ?? []), MAP_SOURCE_ID])],
    lastReviewedAt: TODAY,
  };
  updatedLocations.push(id);
}
if (!sources.some((s) => s.id === MAP_SOURCE_ID)) {
  sources.push({
    id: MAP_SOURCE_ID,
    sourceName: 'Red Dead Wiki',
    pageTitle: 'File:Red-Dead-Redemption-2-Full-World-Map.jpg',
    url: 'https://reddead.fandom.com/wiki/File:Red-Dead-Redemption-2-Full-World-Map.jpg',
    sourceType: 'wiki',
    verificationStatus: 'researched',
    accessedAt: TODAY,
    publicAttribution: true,
    notes:
      'Positions measured directly on the project map tiles (zoom 5 source pixels) from printed labels and station icons. See public/assets/maps/PROVENANCE.md.',
  });
}

saveJson('mapMarkers.json', markers);
saveJson('locations.json', locations);
saveJson('sources.json', sources);

const byType = {};
for (const m of markers) byType[m.type] = (byType[m.type] ?? 0) + 1;
console.log('markers', markers.length, byType);
console.log('locations updated', updatedLocations.length, 'added', addedLocations.length);
console.log('done');
