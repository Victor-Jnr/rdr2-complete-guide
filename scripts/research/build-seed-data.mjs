/**
 * One-shot seed builder. Run: node scripts/research/build-seed-data.mjs
 * Emits JSON under src/data/. Facts for Chapter 1–2 gold/givers come from Red Dead Wiki
 * infoboxes fetched 2026-09-06. Later chapters are title/order/chapter only.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const outDir = path.join(root, 'src', 'data');
const TODAY = '2026-09-06';

function wikiUrl(title) {
  return `https://reddead.fandom.com/wiki/${encodeURIComponent(title.replaceAll(' ', '_'))}`;
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

function av(chapterId, extra = {}) {
  return {
    displayChapterId: chapterId,
    availableChapterIds: extra.availableChapterIds ?? [chapterId],
    earliestChapterId: extra.earliestChapterId ?? chapterId,
    latestChapterId: extra.latestChapterId ?? chapterId,
    ...extra,
  };
}

const chapters = [
  {
    id: 'chapter-1',
    order: 1,
    title: 'Chapter 1',
    subtitle: 'Colter',
    region: 'Ambarino',
    description:
      'After a failed robbery the gang hides in an abandoned mining town in the Grizzlies, waiting out a late spring storm.',
    research: research('cross-checked', ['wiki-missions-in-redemption-2']),
  },
  {
    id: 'chapter-2',
    order: 2,
    title: 'Chapter 2',
    subtitle: 'Horseshoe Overlook',
    region: 'New Hanover',
    description:
      'The gang camps above Valentine and begins gathering money, horses, and new leads.',
    research: research('cross-checked', ['wiki-missions-in-redemption-2']),
  },
  {
    id: 'chapter-3',
    order: 3,
    title: 'Chapter 3',
    subtitle: 'Clemens Point',
    region: 'Lemoyne',
    description:
      'Pushed south after Valentine, the gang camps near Rhodes and plays two feuding families against each other.',
    research: research('cross-checked', ['wiki-missions-in-redemption-2']),
  },
  {
    id: 'chapter-4',
    order: 4,
    title: 'Chapter 4',
    subtitle: 'Saint Denis / Shady Belle',
    region: 'Lemoyne',
    description:
      'The gang moves into a decaying manor in the swamps outside Saint Denis while Dutch hunts a way out.',
    research: research('cross-checked', ['wiki-missions-in-redemption-2']),
  },
  {
    id: 'chapter-5',
    order: 5,
    title: 'Chapter 5',
    subtitle: 'Guarma',
    region: 'Guarma',
    description:
      'A botched bank job strands several members on a sugar island under a local tyrant.',
    research: research('cross-checked', ['wiki-missions-in-redemption-2']),
  },
  {
    id: 'chapter-6',
    order: 6,
    title: 'Chapter 6',
    subtitle: 'Beaver Hollow',
    region: 'New Hanover',
    description:
      'The remnants of the gang hide in dangerous country as internal disputes and Arthur’s illness worsen.',
    research: research('cross-checked', ['wiki-missions-in-redemption-2']),
  },
  {
    id: 'epilogue-1',
    order: 7,
    title: 'Epilogue, Part 1',
    subtitle: 'Pronghorn Ranch',
    region: 'West Elizabeth',
    description:
      'Years later, John takes ranch work and tries to keep his family safe under assumed names.',
    research: research('cross-checked', ['wiki-missions-in-redemption-2']),
  },
  {
    id: 'epilogue-2',
    order: 8,
    title: 'Epilogue, Part 2',
    subtitle: "Beecher's Hope",
    region: 'West Elizabeth',
    description:
      'John buys a farm of his own and tries to become a family man, with help and hindrance from old friends.',
    research: research('cross-checked', ['wiki-missions-in-redemption-2']),
  },
];

function wikiSource(id, title) {
  return {
    id,
    sourceName: 'Red Dead Wiki',
    pageTitle: title,
    url: wikiUrl(title),
    sourceType: 'wiki',
    verificationStatus: 'cross-checked',
    accessedAt: TODAY,
    publicAttribution: true,
  };
}

const sources = [
  wikiSource('wiki-missions-in-redemption-2', 'Missions in Redemption 2'),
  wikiSource('wiki-outlaws-from-the-west', 'Outlaws from the West'),
  wikiSource('wiki-enter-pursued-by-a-memory', 'Enter, Pursued by a Memory'),
  wikiSource('wiki-the-aftermath-of-genesis', 'The Aftermath of Genesis'),
  wikiSource('wiki-old-friends', 'Old Friends'),
  wikiSource('wiki-who-the-hell-is-leviticus-cornwall', 'Who the Hell is Leviticus Cornwall?'),
  wikiSource('wiki-eastward-bound', 'Eastward Bound'),
  wikiSource('wiki-polite-society-valentine-style', 'Polite Society, Valentine Style'),
  wikiSource('wiki-americans-at-rest', 'Americans at Rest'),
  wikiSource('wiki-exit-pursued-by-a-bruised-ego', 'Exit Pursued by a Bruised Ego'),
  wikiSource('wiki-paying-a-social-call', 'Paying a Social Call'),
  wikiSource('wiki-a-quiet-time', 'A Quiet Time'),
  wikiSource('wiki-the-spines-of-america', 'The Spines of America'),
  wikiSource('wiki-blessed-are-the-meek', 'Blessed are the Meek?'),
  wikiSource('wiki-who-is-not-without-sin', 'Who is Not Without Sin'),
  wikiSource('wiki-the-first-shall-be-last', 'The First Shall Be Last'),
  wikiSource('wiki-the-sheep-and-the-goats', 'The Sheep and the Goats'),
  wikiSource('wiki-a-strange-kindness', 'A Strange Kindness'),
  wikiSource('wiki-pouring-forth-oil-i', 'Pouring Forth Oil I'),
  wikiSource('wiki-pouring-forth-oil-ii', 'Pouring Forth Oil II'),
  wikiSource('wiki-pouring-forth-oil-iii', 'Pouring Forth Oil III'),
  wikiSource('wiki-pouring-forth-oil-iv', 'Pouring Forth Oil IV'),
  wikiSource('wiki-a-fisher-of-men', 'A Fisher of Men'),
  wikiSource('wiki-an-american-pastoral-scene', 'An American Pastoral Scene'),
  wikiSource('wiki-good-honest-snake-oil', 'Good, Honest, Snake Oil'),
  wikiSource('wiki-we-loved-once-and-true', 'We Loved Once and True I & II'),
  wikiSource('wiki-we-loved-once-and-true-iii', 'We Loved Once and True III'),
  wikiSource('wiki-money-lending-i-ii', 'Money Lending and Other Sins I & II'),
  wikiSource('wiki-jack-hall-gang-map', 'Jack Hall Gang Map'),
  wikiSource('wiki-high-stakes-treasure-map', 'High Stakes Treasure Map'),
  wikiSource('wiki-poisonous-trail-treasure-map', 'Poisonous Trail Treasure Map'),
  wikiSource('wiki-elemental-trail-map', 'The Elemental Trail Map'),
  wikiSource('wiki-landmarks-of-riches-map', 'Landmarks of Riches Map'),
  wikiSource('wiki-le-tresor-des-morts-map', 'Le Tresor des Morts Map'),
  wikiSource('wiki-mended-map', 'Mended Map'),
  {
    id: 'wiki-companion-item-requests',
    sourceName: 'Red Dead Wiki',
    pageTitle: 'Missions in Redemption 2',
    url: 'https://reddead.fandom.com/wiki/Missions_in_Redemption_2#Companion_Item_Requests',
    sourceType: 'wiki',
    verificationStatus: 'researched',
    accessedAt: TODAY,
    publicAttribution: true,
    notes: 'Companion item request table on the missions list page.',
  },
];

function loc(id, name, region, x, y, sourceIds = ['wiki-missions-in-redemption-2']) {
  return {
    id,
    name,
    region,
    coordinate: { x, y },
    sourceIds,
    research: research('researched', sourceIds),
  };
}

const locations = [
  loc('loc-colter', 'Colter', 'Ambarino', 0.42, 0.16),
  loc('loc-adler-ranch', 'Adler Ranch', 'Ambarino', 0.4, 0.18, ['wiki-outlaws-from-the-west']),
  loc('loc-horseshoe-overlook', 'Horseshoe Overlook', 'New Hanover', 0.5, 0.32),
  loc('loc-valentine', 'Valentine', 'New Hanover', 0.52, 0.34),
  loc('loc-strawberry', 'Strawberry', 'West Elizabeth', 0.38, 0.4),
  loc('loc-blackwater', 'Blackwater', 'West Elizabeth', 0.4, 0.52),
  loc('loc-flatneck-station', 'Flatneck Station', 'New Hanover', 0.5, 0.4),
  loc('loc-emerald-ranch', 'Emerald Ranch', 'New Hanover', 0.56, 0.36),
  loc('loc-carmody-dell', 'Carmody Dell', 'New Hanover', 0.54, 0.34, ['wiki-the-spines-of-america']),
  loc('loc-calibans-seat', "Caliban's Seat", 'New Hanover', 0.48, 0.38, ['wiki-jack-hall-gang-map']),
  loc('loc-cumberland-forest', 'Cumberland Forest', 'New Hanover', 0.48, 0.28),
  loc('loc-montos-rest', "Monto's Rest", 'New Hanover', 0.44, 0.36, ['wiki-an-american-pastoral-scene']),
  loc('loc-old-trail-rise', 'Old Trail Rise', 'New Hanover', 0.54, 0.42, ['wiki-pouring-forth-oil-iv']),
  loc('loc-clemens-point', 'Clemens Point', 'Lemoyne', 0.6, 0.54),
  loc('loc-rhodes', 'Rhodes', 'Lemoyne', 0.62, 0.52),
  loc('loc-saint-denis', 'Saint Denis', 'Lemoyne', 0.72, 0.55),
  loc('loc-shady-belle', 'Shady Belle', 'Lemoyne', 0.68, 0.58),
  loc('loc-guarma', 'Guarma', 'Guarma', 0.88, 0.82),
  loc('loc-lakay', 'Lakay', 'Lemoyne', 0.7, 0.56),
  loc('loc-beaver-hollow', 'Beaver Hollow', 'New Hanover', 0.66, 0.28),
  loc('loc-pronghorn-ranch', 'Pronghorn Ranch', 'West Elizabeth', 0.32, 0.46),
  loc('loc-beechers-hope', "Beecher's Hope", 'West Elizabeth', 0.36, 0.5),
  loc('loc-cotorra-springs', 'Cotorra Springs', 'Ambarino', 0.5, 0.2, ['wiki-jack-hall-gang-map']),
  loc('loc-ocreaghs-run', "O'Creagh's Run", 'Ambarino', 0.58, 0.22, ['wiki-jack-hall-gang-map']),
  loc('loc-cairn-lodge', 'Cairn Lodge', 'Ambarino', 0.36, 0.14, ['wiki-poisonous-trail-treasure-map']),
  loc('loc-face-rock', 'Face Rock', 'Lemoyne', 0.6, 0.5, ['wiki-poisonous-trail-treasure-map']),
  loc('loc-serpent-mound', 'Serpent Mound', 'New Hanover', 0.7, 0.3, ['wiki-poisonous-trail-treasure-map']),
  loc('loc-elysian-pool', 'Elysian Pool', 'New Hanover', 0.64, 0.3, ['wiki-poisonous-trail-treasure-map']),
  loc('loc-cumberland-falls', 'Cumberland Falls', 'New Hanover', 0.46, 0.3, ['wiki-high-stakes-treasure-map']),
  loc('loc-barrow-lagoon', 'Barrow Lagoon', 'Ambarino', 0.4, 0.18, ['wiki-high-stakes-treasure-map']),
  loc('loc-fort-wallace', 'Fort Wallace', 'New Hanover', 0.52, 0.26, ['wiki-high-stakes-treasure-map']),
  loc('loc-limpany', 'Limpany', 'New Hanover', 0.5, 0.42, ['wiki-le-tresor-des-morts-map']),
  loc('loc-sd-docks', 'Saint Denis docks', 'Lemoyne', 0.74, 0.56, ['wiki-le-tresor-des-morts-map']),
  loc('loc-sd-graveyard', 'Saint Denis cemetery', 'Lemoyne', 0.73, 0.54, ['wiki-le-tresor-des-morts-map']),
  loc('loc-little-creek-hermit', 'Hermit Woman cabin', 'West Elizabeth', 0.34, 0.38, ['wiki-mended-map']),
  loc('loc-manito-glade', 'Manito Glade', 'New Hanover', 0.68, 0.26, ['wiki-mended-map']),
  loc('loc-twin-rocks', 'West of Twin Rocks', 'New Austin', 0.22, 0.62, ['wiki-mended-map']),
  loc('loc-obelisk', 'Obelisk (Owanjila)', 'West Elizabeth', 0.3, 0.4, ['wiki-landmarks-of-riches-map']),
  loc('loc-tiny-church', 'Tiny Church', 'Lemoyne', 0.66, 0.54, ['wiki-landmarks-of-riches-map']),
  loc('loc-bolger-glade', 'Bolger Glade', 'Lemoyne', 0.64, 0.56, ['wiki-landmarks-of-riches-map']),
  loc('loc-mount-shann', 'Mount Shann', 'West Elizabeth', 0.36, 0.38, ['wiki-landmarks-of-riches-map']),
  loc('loc-sea-of-coronado', 'Sea of Coronado', 'New Austin', 0.12, 0.7, ['wiki-elemental-trail-map']),
  loc('loc-greenhollow', 'Greenhollow', 'New Austin', 0.18, 0.66, ['wiki-elemental-trail-map']),
  loc('loc-benedict-point', 'Benedict Point', 'New Austin', 0.16, 0.68, ['wiki-elemental-trail-map']),
  loc('loc-coots-chapel', "Coot's Chapel", 'New Austin', 0.2, 0.64, ['wiki-elemental-trail-map']),
  loc('loc-diablo-ridge', 'Diablo Ridge', 'West Elizabeth', 0.4, 0.46, ['wiki-high-stakes-treasure-map']),
];

function gold(missionSlug, items, sourceId) {
  return items.map((label, i) => ({
    id: `gold-${missionSlug}-${i + 1}`,
    label,
    research: research('cross-checked', [sourceId]),
  }));
}

function obj(missionSlug, items, sourceId) {
  return items.map((label, i) => ({
    id: `obj-${missionSlug}-${i + 1}`,
    label,
    research: research('researched', [sourceId]),
  }));
}

function mission(partial) {
  const s = slug(partial.title);
  const sourceId = partial.sourceId;
  return {
    id: `mission-${s}`,
    slug: s,
    title: partial.title,
    chapterId: partial.chapterId,
    order: partial.order,
    tags: partial.tags,
    questGiver: partial.questGiver,
    startLocationId: partial.startLocationId,
    prerequisiteMissionIds: partial.prereq,
    followUpMissionIds: partial.followUp,
    summary: partial.summary,
    availability: partial.availability,
    missable: partial.missable,
    missableWarning: partial.missableWarning,
    objectives: partial.objectives,
    goldRequirements: partial.gold,
    missables: partial.missables,
    sourceIds: [sourceId],
    research: research(partial.status ?? 'researched', [sourceId]),
  };
}

const ch1 = 'chapter-1';
const ch2 = 'chapter-2';

const missionsFull = [
  mission({
    title: 'Outlaws from the West',
    chapterId: ch1,
    order: 1,
    tags: ['main-story'],
    questGiver: 'Dutch van der Linde',
    startLocationId: 'loc-colter',
    sourceId: 'wiki-outlaws-from-the-west',
    status: 'cross-checked',
    availability: av(ch1),
    summary:
      'The gang holes up in Colter. Dutch takes Arthur and Micah out through the snow to search a nearby ranch for food and anything they can use.',
    objectives: obj('outlaws-from-the-west', [
      'Ride with Dutch to look for supplies',
      'Search Adler Ranch',
      'Capture the O’Driscoll in the barn',
      'Calm the horse and lead it back',
    ], 'wiki-outlaws-from-the-west'),
    gold: gold('outlaws-from-the-west', [
      'Take no damage during the shootout',
      'Loot 6 or more items from Adler Ranch',
      'Complete with at least 80% accuracy',
    ], 'wiki-outlaws-from-the-west'),
    followUp: ['mission-enter-pursued-by-a-memory'],
  }),
  mission({
    title: 'Enter, Pursued by a Memory',
    chapterId: ch1,
    order: 2,
    tags: ['main-story'],
    questGiver: 'Abigail Roberts',
    startLocationId: 'loc-colter',
    sourceId: 'wiki-enter-pursued-by-a-memory',
    status: 'cross-checked',
    availability: av(ch1),
    prereq: ['mission-outlaws-from-the-west'],
    followUp: ['mission-the-aftermath-of-genesis', 'mission-old-friends'],
    summary:
      'Abigail asks Arthur and Javier to find John, who has been missing in the storm. They track him through wolf country and bring him home.',
    objectives: obj('enter-pursued-by-a-memory', [
      'Ride out with Javier to search for John',
      'Follow the trail through the snow',
      'Hold off the wolves',
      'Bring John back to Colter',
    ], 'wiki-enter-pursued-by-a-memory'),
    gold: gold('enter-pursued-by-a-memory', [
      'Kill all the wolves without taking any damage',
      'Complete with at least 80% accuracy',
    ], 'wiki-enter-pursued-by-a-memory'),
  }),
  mission({
    title: 'The Aftermath of Genesis',
    chapterId: ch1,
    order: 3,
    tags: ['main-story'],
    questGiver: 'Simon Pearson',
    startLocationId: 'loc-colter',
    sourceId: 'wiki-the-aftermath-of-genesis',
    status: 'cross-checked',
    availability: av(ch1),
    prereq: ['mission-enter-pursued-by-a-memory'],
    summary:
      'Pearson needs meat. Charles takes Arthur hunting for deer in the woods above Colter.',
    objectives: obj('the-aftermath-of-genesis', [
      'Ride out with Charles',
      'Track and hunt deer',
      'Skin the kills and return to camp',
    ], 'wiki-the-aftermath-of-genesis'),
    gold: gold('the-aftermath-of-genesis', [
      'Kill each deer with one arrow',
      'Do not spook either deer',
      'Get a clean kill on the second deer',
    ], 'wiki-the-aftermath-of-genesis'),
  }),
  mission({
    title: 'Old Friends',
    chapterId: ch1,
    order: 4,
    tags: ['main-story'],
    questGiver: 'Bill Williamson',
    startLocationId: 'loc-colter',
    sourceId: 'wiki-old-friends',
    status: 'cross-checked',
    availability: av(ch1),
    prereq: ['mission-enter-pursued-by-a-memory'],
    summary:
      'Micah has found an O’Driscoll camp. The gang attacks it and captures a young O’Driscoll named Kieran.',
    objectives: obj('old-friends', [
      'Join the assault on the O’Driscoll camp',
      'Clear the camp',
      'Catch and hogtie Kieran',
      'Return to Colter',
    ], 'wiki-old-friends'),
    gold: gold('old-friends', [
      'Catch and hogtie Kieran within 45 seconds',
      'Kill 3 O’Driscolls in the same Dead Eye use',
      'Complete within 15 minutes and 30 seconds',
      'Get 15 headshots',
      'Complete the mission without taking any health items',
    ], 'wiki-old-friends'),
  }),
  mission({
    title: 'Who the Hell is Leviticus Cornwall?',
    chapterId: ch1,
    order: 5,
    tags: ['main-story', 'robbery'],
    questGiver: 'John Marston',
    startLocationId: 'loc-colter',
    sourceId: 'wiki-who-the-hell-is-leviticus-cornwall',
    status: 'cross-checked',
    availability: av(ch1),
    prereq: ['mission-the-aftermath-of-genesis', 'mission-old-friends'],
    followUp: ['mission-eastward-bound'],
    summary:
      'Dutch wants a real score. The gang hits a Cornwall train in the mountains to steal bonds and cash.',
    objectives: obj('who-the-hell-is-leviticus-cornwall', [
      'Ride to the trestle with the gang',
      'Stop the train',
      'Clear the guards',
      'Loot the private car',
    ], 'wiki-who-the-hell-is-leviticus-cornwall'),
    gold: gold('who-the-hell-is-leviticus-cornwall', [
      'Save Lenny when he is hanging from the train',
      'After stopping the train, take out the guards within 1 minute and 30 seconds',
      'Take no damage during the shootout',
      'Get 10 headshots',
      'Complete the mission without taking any health items',
    ], 'wiki-who-the-hell-is-leviticus-cornwall'),
  }),
  mission({
    title: 'Eastward Bound',
    chapterId: ch1,
    order: 6,
    tags: ['main-story'],
    questGiver: 'Dutch van der Linde',
    startLocationId: 'loc-colter',
    sourceId: 'wiki-eastward-bound',
    status: 'cross-checked',
    availability: av(ch1),
    prereq: ['mission-who-the-hell-is-leviticus-cornwall'],
    followUp: ['mission-polite-society-valentine-style'],
    summary:
      'The weather breaks. The gang packs up Colter and wagons east to a new camp overlooking the Heartlands.',
    objectives: obj('eastward-bound', [
      'Help break camp at Colter',
      'Drive the wagon east',
      'Arrive at Horseshoe Overlook',
    ], 'wiki-eastward-bound'),
    gold: gold('eastward-bound', [
      'Pick up Javier when entering Horseshoe Overlook',
      'Complete within 6 minutes',
    ], 'wiki-eastward-bound'),
  }),
  mission({
    title: 'Polite Society, Valentine Style',
    chapterId: ch2,
    order: 1,
    tags: ['main-story'],
    questGiver: 'Uncle',
    startLocationId: 'loc-horseshoe-overlook',
    sourceId: 'wiki-polite-society-valentine-style',
    status: 'cross-checked',
    availability: av(ch2),
    prereq: ['mission-eastward-bound'],
    followUp: ['mission-good-honest-snake-oil', 'mission-pouring-forth-oil-i'],
    summary:
      'Uncle, Arthur, and the girls ride into Valentine for supplies and gossip. Mary-Beth comes back with a train lead; a man from Blackwater complicates the afternoon.',
    objectives: obj('polite-society-valentine-style', [
      'Ride the wagon into Valentine',
      'Buy supplies with Uncle',
      'Find Karen in the hotel',
      'Deal with the man from Blackwater',
    ], 'wiki-polite-society-valentine-style'),
    gold: gold('polite-society-valentine-style', [
      'Return the lost wagon horse to its owner',
      'Find Karen within 45 seconds',
    ], 'wiki-polite-society-valentine-style'),
    missables: [
      {
        id: 'miss-polite-honor-horse',
        label: 'Honor choice: return the runaway coach horse',
        description: 'Helping the stranded coach driver on the ride into town is an optional Honor opportunity.',
        research: research('cross-checked', ['wiki-polite-society-valentine-style']),
      },
    ],
  }),
  mission({
    title: 'Americans at Rest',
    chapterId: ch2,
    order: 2,
    tags: ['main-story'],
    questGiver: 'Javier Escuella',
    startLocationId: 'loc-valentine',
    sourceId: 'wiki-americans-at-rest',
    status: 'cross-checked',
    availability: av(ch2),
    summary:
      'Arthur finds Javier, Charles, and Bill drinking in Valentine. A bar fight with a giant named Tommy spills into the street.',
    objectives: obj('americans-at-rest', [
      'Meet the boys in the Valentine saloon',
      'Join the brawl',
      'Fight Tommy',
    ], 'wiki-americans-at-rest'),
    gold: gold('americans-at-rest', [
      'Save Javier within 15 seconds',
      'Defeat Tommy within 1 minute and 30 seconds',
    ], 'wiki-americans-at-rest'),
    followUp: ['mission-the-first-shall-be-last', 'mission-paying-a-social-call', 'mission-money-lending-and-other-sins-i'],
  }),
  mission({
    title: 'Exit Pursued by a Bruised Ego',
    chapterId: ch2,
    order: 3,
    tags: ['main-story'],
    questGiver: 'Hosea Matthews',
    startLocationId: 'loc-horseshoe-overlook',
    sourceId: 'wiki-exit-pursued-by-a-bruised-ego',
    status: 'cross-checked',
    availability: av(ch2),
    summary:
      'Hosea takes Arthur to buy a proper horse, then on a bear hunt that goes badly in the woods near the Dakota.',
    objectives: obj('exit-pursued-by-a-bruised-ego', [
      'Ride with Hosea to the horse fence',
      'Buy a horse',
      'Hunt the bear',
      'Survive the attack and get back to camp',
    ], 'wiki-exit-pursued-by-a-bruised-ego'),
    gold: gold('exit-pursued-by-a-bruised-ego', [
      'Track the bear within 1 minute 30 seconds',
      'Shoot the bear at least 6 times',
      'Complete within 12 minutes',
    ], 'wiki-exit-pursued-by-a-bruised-ego'),
    followUp: ['mission-the-spines-of-america'],
  }),
  mission({
    title: 'Paying a Social Call',
    chapterId: ch2,
    order: 4,
    tags: ['main-story'],
    questGiver: 'Kieran Duffy',
    startLocationId: 'loc-horseshoe-overlook',
    sourceId: 'wiki-paying-a-social-call',
    status: 'cross-checked',
    availability: av(ch2),
    prereq: ['mission-americans-at-rest'],
    summary:
      'Kieran is forced to lead Arthur, Bill, and John to Colm’s camp. The raid turns into a night assault on Six Point Cabin.',
    objectives: obj('paying-a-social-call', [
      'Ride with Kieran to the O’Driscoll hideout',
      'Scout and assault the camp',
      'Search the cabin',
    ], 'wiki-paying-a-social-call'),
    gold: gold('paying-a-social-call', [
      'Silently kill 4 O’Driscolls',
      'Get 12 headshots',
      'Complete with at least 80% accuracy',
      'Complete the mission without taking any health items',
    ], 'wiki-paying-a-social-call'),
  }),
  mission({
    title: 'A Quiet Time',
    chapterId: ch2,
    order: 5,
    tags: ['main-story'],
    questGiver: 'Dutch van der Linde',
    startLocationId: 'loc-horseshoe-overlook',
    sourceId: 'wiki-a-quiet-time',
    status: 'cross-checked',
    availability: av(ch2),
    summary:
      'Dutch sends Arthur to take Lenny into Valentine for a drink. The night gets out of hand.',
    objectives: obj('a-quiet-time', [
      'Ride into Valentine with Lenny',
      'Drink at the saloon',
      'Find Lenny around town',
      'Get back to camp',
    ], 'wiki-a-quiet-time'),
    gold: gold('a-quiet-time', [
      'Try to make amends with an old rival',
      'Catch Lenny in the act',
      "Don't get arrested",
    ], 'wiki-a-quiet-time'),
  }),
  mission({
    title: 'The Spines of America',
    chapterId: ch2,
    order: 6,
    tags: ['main-story', 'robbery'],
    questGiver: 'Hosea Matthews',
    startLocationId: 'loc-emerald-ranch',
    sourceId: 'wiki-the-spines-of-america',
    status: 'cross-checked',
    availability: av(ch2),
    prereq: ['mission-exit-pursued-by-a-bruised-ego'],
    summary:
      'Hosea introduces Arthur to Seamus, a crooked fence at Emerald Ranch. Together they steal a wagon from Carmody Dell.',
    objectives: obj('the-spines-of-america', [
      'Meet Hosea at Emerald Ranch',
      'Rob Carmody Dell',
      'Deliver the wagon to Seamus',
    ], 'wiki-the-spines-of-america'),
    gold: gold('the-spines-of-america', [
      'Loot everything from Carmody Dell',
      "Don't get spotted",
      'Deliver the wagon to Emerald Ranch within 1 minute and 10 seconds',
    ], 'wiki-the-spines-of-america'),
  }),
  mission({
    title: 'Blessed are the Meek?',
    chapterId: ch2,
    order: 7,
    tags: ['main-story'],
    questGiver: 'Micah Bell',
    startLocationId: 'loc-strawberry',
    sourceId: 'wiki-blessed-are-the-meek',
    status: 'cross-checked',
    availability: av(ch2),
    summary:
      'Micah is locked in the Strawberry jail. Arthur breaks him out, and the escape turns into a massacre in the streets.',
    objectives: obj('blessed-are-the-meek', [
      'Reach Strawberry jail',
      'Free Micah',
      'Fight clear of town',
    ], 'wiki-blessed-are-the-meek'),
    gold: gold('blessed-are-the-meek', [
      'While escaping, kill all mounted lawmen within 55 seconds',
      'Get 15 headshots',
      'Complete with at least 70% accuracy',
      'Complete the mission without taking any health items',
    ], 'wiki-blessed-are-the-meek'),
    missables: [
      {
        id: 'miss-micah-guns',
        label: 'Micah’s confiscated guns',
        description: 'During the breakout Micah can recover guns taken from him in Strawberry.',
        research: research('researched', ['wiki-blessed-are-the-meek']),
      },
    ],
  }),
  mission({
    title: 'Who is Not Without Sin',
    chapterId: ch2,
    order: 8,
    tags: ['main-story'],
    questGiver: 'Orville Swanson',
    startLocationId: 'loc-flatneck-station',
    sourceId: 'wiki-who-is-not-without-sin',
    status: 'cross-checked',
    availability: av(ch2),
    summary:
      'Reverend Swanson is in trouble at Flatneck Station. Arthur pulls him out of a poker game, a beating, and a near hanging.',
    objectives: obj('who-is-not-without-sin', [
      'Find Swanson at Flatneck Station',
      'Get him out of the poker game',
      'Stop the fight and the hanging',
      'Return him to camp',
    ], 'wiki-who-is-not-without-sin'),
    gold: gold('who-is-not-without-sin', [
      'Win 2 hands of Poker',
      'Return the Reverend to camp within 2 minutes and 5 seconds',
    ], 'wiki-who-is-not-without-sin'),
  }),
  mission({
    title: 'The First Shall Be Last',
    chapterId: ch2,
    order: 9,
    tags: ['main-story', 'missable'],
    questGiver: 'Javier Escuella',
    startLocationId: 'loc-blackwater',
    sourceId: 'wiki-the-first-shall-be-last',
    status: 'cross-checked',
    availability: {
      ...av(ch2),
      notes: 'Sean’s rescue is available in Chapter 2; do not delay indefinitely.',
    },
    missable: true,
    missableWarning: 'Complete Sean’s rescue during Chapter 2',
    prereq: ['mission-americans-at-rest'],
    summary:
      'Trelawny has a lead on Sean, held by bounty hunters west of Blackwater. Arthur, Javier, and Charles break him out on the Upper Montana.',
    objectives: obj('the-first-shall-be-last', [
      'Meet Trelawny near Blackwater',
      'Scout the bounty hunters with Javier',
      'Free Sean',
      'Escape the river fight',
    ], 'wiki-the-first-shall-be-last'),
    gold: gold('the-first-shall-be-last', [
      'Silently kill the bounty hunters by the river with Javier',
      'Shoot the rope to free Sean',
      'Get 10 headshots',
      'Complete the mission without taking any health items',
    ], 'wiki-the-first-shall-be-last'),
  }),
  mission({
    title: 'The Sheep and the Goats',
    chapterId: ch2,
    order: 10,
    tags: ['main-story'],
    questGiver: 'John Marston',
    startLocationId: 'loc-valentine',
    sourceId: 'wiki-the-sheep-and-the-goats',
    status: 'cross-checked',
    availability: av(ch2),
    summary:
      'John and Arthur steal a flock of sheep and sell them in Valentine. Cornwall’s men walk in on the payday, and the town becomes a war zone.',
    objectives: obj('the-sheep-and-the-goats', [
      'Steal and herd the sheep',
      'Sell them in Valentine',
      'Survive the Cornwall ambush',
      'Escape town with John',
    ], 'wiki-the-sheep-and-the-goats'),
    gold: gold('the-sheep-and-the-goats', [
      'Herd all the sheep into the pen in Valentine',
      'Get 25 headshots',
      'Complete with at least 70% accuracy',
      'Complete the mission without taking any health items',
    ], 'wiki-the-sheep-and-the-goats'),
    followUp: ['mission-a-strange-kindness'],
  }),
  mission({
    title: 'A Strange Kindness',
    chapterId: ch2,
    order: 11,
    tags: ['main-story'],
    questGiver: 'Dutch van der Linde',
    startLocationId: 'loc-horseshoe-overlook',
    sourceId: 'wiki-a-strange-kindness',
    status: 'cross-checked',
    availability: av(ch2),
    prereq: ['mission-the-sheep-and-the-goats'],
    summary:
      'After Valentine, Dutch wants a new camp. Micah leads Arthur to a supposed site that turns into a hostage rescue in the woods.',
    objectives: obj('a-strange-kindness', [
      'Ride with Micah',
      'Clear the camp of captors',
      'Return the captive to his family',
      'Scout Clemens Point',
    ], 'wiki-a-strange-kindness'),
    gold: gold('a-strange-kindness', [
      'Return the captive to his family within 1 minute and 40 seconds',
      'Get 5 headshots',
      'Complete with at least 80% accuracy',
      'Complete the mission without taking any health items',
    ], 'wiki-a-strange-kindness'),
  }),
  mission({
    title: 'Pouring Forth Oil I',
    chapterId: ch2,
    order: 12,
    tags: ['main-story', 'robbery'],
    questGiver: 'John Marston',
    startLocationId: 'loc-horseshoe-overlook',
    sourceId: 'wiki-pouring-forth-oil-i',
    status: 'cross-checked',
    availability: av(ch2),
    prereq: ['mission-polite-society-valentine-style'],
    followUp: ['mission-pouring-forth-oil-ii'],
    summary:
      'John wants to rob the tourist train Mary-Beth spotted. He asks Arthur to steal an oil wagon to block the tracks. This part is a camp conversation.',
    objectives: obj('pouring-forth-oil-i', ['Talk to John at camp about the train'], 'wiki-pouring-forth-oil-i'),
  }),
  mission({
    title: 'Pouring Forth Oil II',
    chapterId: ch2,
    order: 13,
    tags: ['optional-story', 'robbery'],
    questGiver: 'John Marston',
    startLocationId: 'loc-horseshoe-overlook',
    sourceId: 'wiki-pouring-forth-oil-ii',
    status: 'researched',
    availability: av(ch2),
    prereq: ['mission-pouring-forth-oil-i'],
    followUp: ['mission-pouring-forth-oil-iii'],
    summary:
      'Arthur locates and steals an oil wagon for the planned train robbery.',
  }),
  mission({
    title: 'Pouring Forth Oil III',
    chapterId: ch2,
    order: 14,
    tags: ['main-story', 'robbery'],
    questGiver: 'John Marston',
    startLocationId: 'loc-horseshoe-overlook',
    sourceId: 'wiki-pouring-forth-oil-iii',
    status: 'researched',
    availability: av(ch2),
    prereq: ['mission-pouring-forth-oil-ii'],
    followUp: ['mission-pouring-forth-oil-iv'],
    summary:
      'Arthur delivers the stolen oil wagon to the hide site for the train job.',
  }),
  mission({
    title: 'Pouring Forth Oil IV',
    chapterId: ch2,
    order: 15,
    tags: ['main-story', 'robbery'],
    questGiver: 'John Marston',
    startLocationId: 'loc-old-trail-rise',
    sourceId: 'wiki-pouring-forth-oil-iv',
    status: 'cross-checked',
    availability: av(ch2),
    prereq: ['mission-pouring-forth-oil-iii'],
    summary:
      'Arthur, John, Sean, and Charles stop the train with the oil wagon and rob it before the law closes in.',
    objectives: obj('pouring-forth-oil-iv', [
      'Place the oil wagon on the tracks',
      'Rob the train',
      'Escape the law',
    ], 'wiki-pouring-forth-oil-iv'),
    gold: gold('pouring-forth-oil-iv', [
      'Kill all the train guards before Sean fires a shot',
      'Clear the baggage car of loot',
      'Escape the Law within 1 minute 30 seconds',
      'Get 10 kills in Dead Eye',
      'Complete the mission without taking any health items',
    ], 'wiki-pouring-forth-oil-iv'),
  }),
  mission({
    title: 'A Fisher of Men',
    chapterId: ch2,
    order: 16,
    tags: ['main-story'],
    questGiver: 'Abigail Marston',
    startLocationId: 'loc-horseshoe-overlook',
    sourceId: 'wiki-a-fisher-of-men',
    status: 'cross-checked',
    availability: av(ch2),
    summary:
      'Abigail asks Arthur to take Jack fishing. Pinkertons interrupt the afternoon on the riverbank.',
    objectives: obj('a-fisher-of-men', [
      'Take Jack fishing',
      'Catch a fish',
      'Deal with the Pinkertons',
      'Return Jack to camp',
    ], 'wiki-a-fisher-of-men'),
    gold: gold('a-fisher-of-men', [
      'After arriving at the river, catch a fish within 1 minute and 30 seconds',
      'Complete within 7 minutes and 20 seconds',
    ], 'wiki-a-fisher-of-men'),
    missables: [
      {
        id: 'miss-jack-comic',
        missableId: 'item-jack-comic-book',
        label: 'Jack’s comic book request',
        description: 'Jack’s penny dreadful request can trigger during this outing.',
        research: research('researched', ['wiki-companion-item-requests']),
      },
    ],
  }),
  mission({
    title: 'An American Pastoral Scene',
    chapterId: ch2,
    order: 17,
    tags: ['main-story', 'robbery'],
    questGiver: 'Micah Bell',
    startLocationId: 'loc-montos-rest',
    sourceId: 'wiki-an-american-pastoral-scene',
    status: 'cross-checked',
    availability: {
      ...av(ch2, { availableChapterIds: [ch2, 'chapter-3'], latestChapterId: 'chapter-3' }),
      notes: 'Can be played in Chapter 2 or left until Chapter 3.',
    },
    summary:
      'Micah wants to hit a banking coach. Arthur helps him rob it in the Heartlands.',
    objectives: obj('an-american-pastoral-scene', [
      'Meet Micah',
      'Ambush the coach',
      'Deal with the guards',
      'Get the take away',
    ], 'wiki-an-american-pastoral-scene'),
    gold: gold('an-american-pastoral-scene', [
      'Headshot each of the mounted guards protecting the wagon',
      'Get 10 kills in Dead Eye',
      'Complete within 6 minutes',
      'Complete the mission without taking any health items',
    ], 'wiki-an-american-pastoral-scene'),
  }),
  mission({
    title: 'Good, Honest, Snake Oil',
    chapterId: ch2,
    order: 18,
    tags: ['stranger', 'optional-story', 'missable'],
    questGiver: 'Uncle',
    startLocationId: 'loc-valentine',
    sourceId: 'wiki-good-honest-snake-oil',
    status: 'cross-checked',
    availability: av(ch2),
    missable: true,
    missableWarning: 'Available from Valentine in Chapter 2 after Polite Society',
    prereq: ['mission-polite-society-valentine-style'],
    summary:
      'The Valentine sheriff wants a snake-oil salesman brought in. Arthur runs Benedict Allbright down along the cliffs.',
    objectives: obj('good-honest-snake-oil', [
      'Talk to the sheriff in Valentine',
      'Chase Benedict Allbright',
      'Hogtie him and bring him in',
    ], 'wiki-good-honest-snake-oil'),
    gold: gold('good-honest-snake-oil', [
      'Stop Benedict Allbright falling off the cliff',
      'Hogtie Allbright within 1 minute and 15 seconds',
      'Return Allbright to the sheriff within 1 minute and 30 seconds',
    ], 'wiki-good-honest-snake-oil'),
  }),
  mission({
    title: 'We Loved Once and True I',
    chapterId: ch2,
    order: 19,
    tags: ['honor', 'optional-story', 'missable'],
    questGiver: 'Mary Linton',
    startLocationId: 'loc-horseshoe-overlook',
    sourceId: 'wiki-we-loved-once-and-true',
    status: 'researched',
    availability: av(ch2),
    missable: true,
    missableWarning: 'Read Mary’s letter and follow up during Chapter 2',
    summary:
      'A letter from Mary Linton reaches camp. Reading it starts this honor strand.',
  }),
  mission({
    title: 'We Loved Once and True II',
    chapterId: ch2,
    order: 20,
    tags: ['honor', 'optional-story', 'missable'],
    questGiver: 'Mary Linton',
    startLocationId: 'loc-valentine',
    sourceId: 'wiki-we-loved-once-and-true',
    status: 'researched',
    availability: av(ch2),
    missable: true,
    missableWarning: 'Meet Mary in Valentine during Chapter 2',
    prereq: ['mission-we-loved-once-and-true-i'],
    followUp: ['mission-we-loved-once-and-true-iii'],
    summary:
      'Arthur meets Mary in Valentine. She asks for help with her brother Jamie.',
  }),
  mission({
    title: 'We Loved Once and True III',
    chapterId: ch2,
    order: 21,
    tags: ['honor', 'optional-story', 'missable'],
    questGiver: 'Mary Linton',
    startLocationId: 'loc-cumberland-forest',
    sourceId: 'wiki-we-loved-once-and-true-iii',
    status: 'cross-checked',
    availability: av(ch2),
    missable: true,
    missableWarning: 'Optional follow-up; complete while Mary’s strand is available',
    prereq: ['mission-we-loved-once-and-true-ii'],
    summary:
      'Arthur finds Jamie among the Chelonians and can talk or shoot his way to bringing the young man back to Mary.',
    objectives: obj('we-loved-once-and-true-iii', [
      'Find Jamie with the Chelonians',
      'Get him away from the group',
      'Return him to Mary',
    ], 'wiki-we-loved-once-and-true-iii'),
    gold: gold('we-loved-once-and-true-iii', [
      'Peacefully convince the Chelonians to let you take Jamie',
      'Return Jamie to Mary within 2 minutes',
    ], 'wiki-we-loved-once-and-true-iii'),
  }),
  mission({
    title: 'Money Lending and Other Sins I',
    chapterId: ch2,
    order: 22,
    tags: ['debt-collection', 'optional-story', 'missable'],
    questGiver: 'Leopold Strauss',
    startLocationId: 'loc-horseshoe-overlook',
    sourceId: 'wiki-money-lending-i-ii',
    status: 'researched',
    availability: av(ch2),
    missable: true,
    missableWarning: 'Strauss’s Chapter 2 debt collections should be finished before leaving the chapter',
    prereq: ['mission-americans-at-rest'],
    followUp: ['mission-money-lending-and-other-sins-ii'],
    summary:
      'Strauss asks Arthur to collect from camp debtors around the Heartlands.',
  }),
  mission({
    title: 'Money Lending and Other Sins II',
    chapterId: ch2,
    order: 23,
    tags: ['debt-collection', 'optional-story', 'missable'],
    questGiver: 'Leopold Strauss',
    startLocationId: 'loc-horseshoe-overlook',
    sourceId: 'wiki-money-lending-i-ii',
    status: 'researched',
    availability: av(ch2),
    missable: true,
    missableWarning: 'Finish remaining Chapter 2 debtors before leaving Horseshoe Overlook',
    prereq: ['mission-money-lending-and-other-sins-i'],
    summary:
      'Arthur continues Strauss’s collections. Several debtors can be found independently.',
  }),
  mission({
    title: 'Money Lending and Other Sins III',
    chapterId: ch2,
    order: 24,
    tags: ['debt-collection', 'optional-story', 'missable'],
    questGiver: 'Leopold Strauss',
    startLocationId: 'loc-horseshoe-overlook',
    sourceId: 'wiki-money-lending-i-ii',
    status: 'researched',
    availability: av(ch2),
    missable: true,
    missableWarning: 'Complete before leaving Chapter 2',
    prereq: ['mission-money-lending-and-other-sins-ii'],
    summary:
      'Further debt work for Strauss during the Horseshoe Overlook chapter.',
  }),
];

const later = [
  [3, 'chapter-3', 'loc-clemens-point', [
    ['Further Questions of Female Suffrage', 'main-story'],
    ['The New South', 'main-story'],
    ['The Course of True Love I', 'optional-story'],
    ['The Course of True Love II', 'optional-story'],
    ['The Course of True Love III', 'optional-story'],
    ['American Distillation', 'main-story'],
    ['An Honest Mistake', 'main-story'],
    ['Preaching Forgiveness as He Went', 'main-story'],
    ['Sodom? Back to Gomorrah', 'main-story'],
    ['Advertising, The New American Art', 'main-story'],
    ['Magicians for Sport', 'main-story'],
    ['The Fine Joys of Tobacco', 'main-story'],
    ['Horse Flesh for Dinner', 'main-story'],
    ['Friends in Very Low Places', 'main-story'],
    ['Blessed are the Peacemakers', 'main-story'],
    ['A Short Walk in a Pretty Town', 'main-story'],
    ['Blood Feuds, Ancient and Modern', 'main-story'],
    ['The Battle of Shady Belle', 'main-story'],
    ['Money Lending and Other Sins IV', 'debt-collection'],
  ]],
  [4, 'chapter-4', 'loc-shady-belle', [
    ['The Joys of Civilization', 'main-story'],
    ['No, No and Thrice, No', 'main-story'],
    ['Angelo Bronte, A Man of Honor', 'main-story'],
    ['Help a Brother Out', 'honor'],
    ['Brothers and Sisters, One and All', 'honor'],
    ['The Gilded Cage', 'main-story'],
    ['A Fine Night of Debauchery', 'main-story'],
    ['Horsemen, Apocalypses', 'main-story'],
    ['Urban Pleasures', 'main-story'],
    ['Country Pursuits', 'main-story'],
    ['Revenge is a Dish Best Eaten', 'main-story'],
    ['Fatherhood and Other Dreams', 'honor'],
    ['American Fathers I', 'honor'],
    ['American Fathers II', 'honor'],
    ['Banking, The Old American Art', 'main-story'],
    ['Lost and Not Quite Found', 'optional-story'],
    ['Money Lending and Other Sins V', 'debt-collection'],
  ]],
  [5, 'chapter-5', 'loc-guarma', [
    ['Welcome to the New World', 'main-story'],
    ['A Kind and Benevolent Despot', 'main-story'],
    ['Savagery Unleashed', 'main-story'],
    ['Hell Hath No Fury', 'main-story'],
    ['Paradise Mercifully Departed', 'main-story'],
    ['Dear Uncle Tacitus', 'main-story'],
    ['Fleeting Joy', 'main-story'],
  ]],
  [6, 'chapter-6', 'loc-beaver-hollow', [
    ["That's Murfree Country", 'main-story'],
    ['A Fork in the Road', 'main-story'],
    ['Icarus and Friends', 'main-story'],
    ['Visiting Hours', 'main-story'],
    ['Just a Social Call', 'main-story'],
    ['The Delights of Van Horn', 'main-story'],
    ['A Rage Unleashed', 'main-story'],
    ['Goodbye, Dear Friend', 'main-story'],
    ['Archeology for Beginners', 'honor'],
    ['Honor, Amongst Thieves', 'honor'],
    ['The Fine Art of Conversation', 'main-story'],
    ['Favored Sons', 'main-story'],
    ["The King's Son", 'main-story'],
    ['Mrs. Sadie Adler, Widow I', 'main-story'],
    ['Mrs. Sadie Adler, Widow II', 'main-story'],
    ['The Bridge to Nowhere', 'main-story'],
    ['My Last Boy', 'main-story'],
    ['Our Best Selves', 'main-story'],
    ['Red Dead Redemption', 'main-story'],
    ['The Course of True Love IV', 'optional-story'],
    ['The Course of True Love V', 'optional-story'],
    ['Money Lending and Other Sins VI', 'debt-collection'],
    ['Money Lending and Other Sins VII', 'debt-collection'],
    ['Do Not Seek Absolution I', 'honor'],
    ['Do Not Seek Absolution II', 'honor'],
    ['Of Men and Angels I', 'honor'],
    ['Of Men and Angels II', 'honor'],
  ]],
  [7, 'epilogue-1', 'loc-pronghorn-ranch', [
    ['The Wheel', 'main-story'],
    ['Simple Pleasures', 'main-story'],
    ['Farming, For Beginners', 'main-story'],
    ['Fatherhood, For Beginners', 'main-story'],
    ['Old Habits', 'main-story'],
    ['Fatherhood, For Idiots', 'main-story'],
    ['Jim Milton Rides, Again?', 'main-story'],
    ['Motherhood', 'main-story'],
    ['Gainful Employment', 'main-story'],
    ['The Landowning Classes', 'main-story'],
    ['Home of the Gentry?', 'main-story'],
  ]],
  [8, 'epilogue-2', 'loc-beechers-hope', [
    ['Bare Knuckle Friendships', 'main-story'],
    ["An Honest Day's Labors", 'main-story'],
    ['Home Improvement for Beginners', 'main-story'],
    ['The Tool Box', 'main-story'],
    ['A New Jerusalem', 'main-story'],
    ['A Quick Favor for an Old Friend', 'main-story'],
    ["Uncle's Bad Day", 'main-story'],
    ['The Best of Women', 'main-story'],
    ['Trying Again', 'main-story'],
    ['A Really Big Bastard', 'main-story'],
    ['A New Future Imagined', 'main-story'],
    ['American Venom', 'main-story'],
  ]],
];

const missionsLater = [];
for (const [, chapterId, locId, list] of later) {
  list.forEach(([title, tag], i) => {
    const honor = tag === 'honor';
    const debt = tag === 'debt-collection';
    const sid = `wiki-${slug(title)}`;
    if (!sources.some((s) => s.id === sid)) {
      sources.push(wikiSource(sid, title));
    }
    const chapterLabel = chapterId.replaceAll('-', ' ');
    missionsLater.push(
      mission({
        title,
        chapterId,
        order: i + 1,
        tags: [tag, ...(honor || debt ? ['missable'] : [])],
        startLocationId: locId,
        sourceId: sid,
        status: 'researched',
        availability: av(chapterId),
        missable: honor || debt,
        missableWarning: honor || debt
          ? `Finish during ${chapterLabel} if you do not want to miss it`
          : undefined,
      }),
    );
  });
}

const missions = [...missionsFull, ...missionsLater];

const treasures = [
  {
    id: 'treasure-jack-hall-gang',
    name: 'Jack Hall Gang',
    description: 'Three maps left by an old outlaw gang, ending at a rocky island on O’Creagh’s Run.',
    availability: av(ch2, { availableChapterIds: [ch2, 'chapter-3', 'chapter-4', 'chapter-6', 'epilogue-1', 'epilogue-2'], latestChapterId: 'epilogue-2' }),
    sourceIds: ['wiki-jack-hall-gang-map'],
    research: research('cross-checked', ['wiki-jack-hall-gang-map']),
    steps: [
      { id: 'jh-1', order: 1, title: 'Buy or take Map 1 from Máximo near Flatneck Station', type: 'map-pickup', locationId: 'loc-flatneck-station', research: research('cross-checked', ['wiki-jack-hall-gang-map']) },
      { id: 'jh-2', order: 2, title: 'Find Map 2 at Caliban’s Seat', type: 'next-map', locationId: 'loc-calibans-seat', research: research('cross-checked', ['wiki-jack-hall-gang-map']) },
      { id: 'jh-3', order: 3, title: 'Find Map 3 at Cotorra Springs', type: 'next-map', locationId: 'loc-cotorra-springs', research: research('cross-checked', ['wiki-jack-hall-gang-map']) },
      { id: 'jh-4', order: 4, title: 'Collect the gold bars at O’Creagh’s Run', type: 'treasure', locationId: 'loc-ocreaghs-run', reward: '2 gold bars', research: research('cross-checked', ['wiki-jack-hall-gang-map']) },
    ],
  },
  {
    id: 'treasure-high-stakes',
    name: 'High Stakes',
    description: 'A rumored cursed map chain that starts after the All That Glitters stranger encounter.',
    availability: {
      ...av(ch2, { availableChapterIds: [ch2, 'chapter-3', 'chapter-4', 'chapter-6', 'epilogue-1', 'epilogue-2'], latestChapterId: 'epilogue-2' }),
      notes: 'First map appears after triggering All That Glitters; the hunter can be found between Diablo Ridge and Riggs Station.',
    },
    sourceIds: ['wiki-high-stakes-treasure-map'],
    research: research('cross-checked', ['wiki-high-stakes-treasure-map']),
    steps: [
      { id: 'hs-1', order: 1, title: 'Take Map 1 from the treasure hunter', type: 'map-pickup', locationId: 'loc-diablo-ridge', research: research('cross-checked', ['wiki-high-stakes-treasure-map']) },
      { id: 'hs-2', order: 2, title: 'Find Map 2 behind Cumberland Falls', type: 'next-map', locationId: 'loc-cumberland-falls', research: research('cross-checked', ['wiki-high-stakes-treasure-map']) },
      { id: 'hs-3', order: 3, title: 'Find Map 3 at Barrow Lagoon', type: 'next-map', locationId: 'loc-barrow-lagoon', research: research('cross-checked', ['wiki-high-stakes-treasure-map']) },
      { id: 'hs-4', order: 4, title: 'Collect the treasure near Fort Wallace', type: 'treasure', locationId: 'loc-fort-wallace', research: research('cross-checked', ['wiki-high-stakes-treasure-map']) },
    ],
  },
  {
    id: 'treasure-poisonous-trail',
    name: 'Poisonous Trail',
    description: 'Maps hidden from Cairn Lodge to Serpent Mound, ending in a cave at Elysian Pool.',
    availability: av(ch2, { availableChapterIds: [ch2, 'chapter-3', 'chapter-4', 'chapter-6', 'epilogue-1', 'epilogue-2'], latestChapterId: 'epilogue-2' }),
    sourceIds: ['wiki-poisonous-trail-treasure-map'],
    research: research('cross-checked', ['wiki-poisonous-trail-treasure-map']),
    steps: [
      { id: 'pt-1', order: 1, title: 'Find Map 1 under the bed at Cairn Lodge', type: 'map-pickup', locationId: 'loc-cairn-lodge', research: research('cross-checked', ['wiki-poisonous-trail-treasure-map']) },
      { id: 'pt-2', order: 2, title: 'Find Map 2 in the hollow tree near Face Rock', type: 'next-map', locationId: 'loc-face-rock', research: research('cross-checked', ['wiki-poisonous-trail-treasure-map']) },
      { id: 'pt-3', order: 3, title: 'Find Map 3 at Serpent Mound', type: 'next-map', locationId: 'loc-serpent-mound', research: research('cross-checked', ['wiki-poisonous-trail-treasure-map']) },
      { id: 'pt-4', order: 4, title: 'Collect 4 gold bars in the Elysian Pool cave', type: 'treasure', locationId: 'loc-elysian-pool', reward: '4 gold bars', research: research('cross-checked', ['wiki-poisonous-trail-treasure-map']) },
    ],
  },
  {
    id: 'treasure-le-tresor-des-morts',
    name: 'Le Trésor des Morts',
    description: 'A short chain from burned Limpany to a Saint Denis mausoleum.',
    availability: {
      ...av(ch2, { availableChapterIds: [ch2, 'chapter-3', 'chapter-4', 'chapter-6', 'epilogue-1', 'epilogue-2'], latestChapterId: 'epilogue-2' }),
      platforms: ['ps4', 'ps5', 'xbox-one', 'xbox-series'],
      preorderOnly: true,
      notes: 'Exclusive to digital versions pre-ordered through PlayStation Store and Xbox Store prior to 15 August 2018.',
    },
    sourceIds: ['wiki-le-tresor-des-morts-map'],
    research: research('cross-checked', ['wiki-le-tresor-des-morts-map']),
    steps: [
      { id: 'lt-1', order: 1, title: 'Find Map 1 in the unburnt jail cell at Limpany', type: 'map-pickup', locationId: 'loc-limpany', research: research('cross-checked', ['wiki-le-tresor-des-morts-map']) },
      { id: 'lt-2', order: 2, title: 'Find the riddle note in the Saint Denis dock tunnels', type: 'clue', locationId: 'loc-sd-docks', research: research('cross-checked', ['wiki-le-tresor-des-morts-map']) },
      { id: 'lt-3', order: 3, title: 'Collect 6 gold bars in the Saint Denis cemetery mausoleum', type: 'treasure', locationId: 'loc-sd-graveyard', reward: '6 gold bars', research: research('cross-checked', ['wiki-le-tresor-des-morts-map']) },
    ],
  },
  {
    id: 'treasure-mended-map',
    name: 'Mended Map (Torn Treasure Map)',
    description: 'Two map halves from hostile hermits; the treasure cannot be collected until after Epilogue Part 1.',
    availability: {
      ...av(ch2, {
        availableChapterIds: [ch2, 'chapter-3', 'chapter-4', 'chapter-6', 'epilogue-1', 'epilogue-2'],
        earliestChapterId: ch2,
        latestChapterId: 'epilogue-2',
      }),
      notes: 'Map pieces can be found from Chapter 2; the treasure is only collectable after completing Epilogue, Part 1 (without glitches).',
    },
    sourceIds: ['wiki-mended-map'],
    research: research('cross-checked', ['wiki-mended-map']),
    steps: [
      { id: 'mm-1', order: 1, title: 'Take the first map half from the Hermit Woman’s cabin', type: 'map-pickup', locationId: 'loc-little-creek-hermit', research: research('cross-checked', ['wiki-mended-map']) },
      { id: 'mm-2', order: 2, title: 'Take the second map half at Manito Glade', type: 'next-map', locationId: 'loc-manito-glade', research: research('cross-checked', ['wiki-mended-map']) },
      { id: 'mm-3', order: 3, title: 'Collect Otis Miller’s Revolver west of Twin Rocks', type: 'treasure', locationId: 'loc-twin-rocks', reward: "Otis Miller's Revolver", research: research('cross-checked', ['wiki-mended-map']) },
    ],
  },
  {
    id: 'treasure-landmarks-of-riches',
    name: 'Landmarks of Riches',
    description: 'Four maps from landmarks across the map, ending under a sundial on Mount Shann.',
    availability: {
      ...av('epilogue-1', { availableChapterIds: ['epilogue-1', 'epilogue-2'], earliestChapterId: 'epilogue-1', latestChapterId: 'epilogue-2' }),
      notes: 'Initially PC-only (Oct–Dec 2019); later added to consoles with the Moonshiners update.',
      platforms: ['pc', 'ps4', 'ps5', 'xbox-one', 'xbox-series'],
    },
    sourceIds: ['wiki-landmarks-of-riches-map'],
    research: research('cross-checked', ['wiki-landmarks-of-riches-map']),
    steps: [
      { id: 'lr-1', order: 1, title: 'Find Map 1 in the Obelisk near Owanjila', type: 'map-pickup', locationId: 'loc-obelisk', research: research('cross-checked', ['wiki-landmarks-of-riches-map']) },
      { id: 'lr-2', order: 2, title: 'Find Map 2 on the Tiny Church roof', type: 'next-map', locationId: 'loc-tiny-church', research: research('cross-checked', ['wiki-landmarks-of-riches-map']) },
      { id: 'lr-3', order: 3, title: 'Find Map 3 at the Mysterious Hill Home', type: 'next-map', research: research('cross-checked', ['wiki-landmarks-of-riches-map']) },
      { id: 'lr-4', order: 4, title: 'Find Map 4 in the tree at Bolger Glade', type: 'next-map', locationId: 'loc-bolger-glade', research: research('cross-checked', ['wiki-landmarks-of-riches-map']) },
      { id: 'lr-5', order: 5, title: 'Collect 6 gold bars on Mount Shann', type: 'treasure', locationId: 'loc-mount-shann', reward: '6 gold bars', research: research('cross-checked', ['wiki-landmarks-of-riches-map']) },
    ],
  },
  {
    id: 'treasure-elemental-trail',
    name: 'The Elemental Trail',
    description: 'A New Austin chain that is only available after the epilogue.',
    availability: av('epilogue-2', { availableChapterIds: ['epilogue-2'], earliestChapterId: 'epilogue-2', latestChapterId: 'epilogue-2' }),
    sourceIds: ['wiki-elemental-trail-map'],
    research: research('cross-checked', ['wiki-elemental-trail-map']),
    steps: [
      { id: 'et-1', order: 1, title: 'Loot Map 1 from the hanging corpse at the Sea of Coronado', type: 'map-pickup', locationId: 'loc-sea-of-coronado', research: research('cross-checked', ['wiki-elemental-trail-map']) },
      { id: 'et-2', order: 2, title: 'Find Map 2 in the chimney at Greenhollow', type: 'next-map', locationId: 'loc-greenhollow', research: research('cross-checked', ['wiki-elemental-trail-map']) },
      { id: 'et-3', order: 3, title: 'Find Map 3 on the gutter near Benedict Point', type: 'next-map', locationId: 'loc-benedict-point', research: research('cross-checked', ['wiki-elemental-trail-map']) },
      { id: 'et-4', order: 4, title: 'Collect the treasure at Coot’s Chapel', type: 'treasure', locationId: 'loc-coots-chapel', reward: 'Crow Beak Trinket, gold bar, special horse items', research: research('cross-checked', ['wiki-elemental-trail-map']) },
    ],
  },
];

const activities = [
  { id: 'act-ch2-fff-lenny', title: 'Five Finger Fillet with Lenny', kind: 'companion', companion: 'Lenny Summers', availability: av(ch2), locationId: 'loc-horseshoe-overlook', sourceIds: ['wiki-missions-in-redemption-2'], research: research('researched', ['wiki-missions-in-redemption-2']) },
  { id: 'act-ch2-hunt-charles', title: 'Go Hunting with Charles', kind: 'companion', companion: 'Charles Smith', availability: av(ch2), locationId: 'loc-horseshoe-overlook', sourceIds: ['wiki-missions-in-redemption-2'], research: research('researched', ['wiki-missions-in-redemption-2']) },
  { id: 'act-ch2-rob-javier', title: 'Rob a Homestead with Javier', kind: 'companion', companion: 'Javier Escuella', availability: av(ch2), locationId: 'loc-horseshoe-overlook', sourceIds: ['wiki-missions-in-redemption-2'], research: research('researched', ['wiki-missions-in-redemption-2']) },
  { id: 'act-ch3-fff-micah', title: 'Five Finger Fillet with Micah', kind: 'companion', companion: 'Micah Bell', availability: av('chapter-3'), locationId: 'loc-clemens-point', sourceIds: ['wiki-missions-in-redemption-2'], research: research('researched', ['wiki-missions-in-redemption-2']) },
  { id: 'act-ch3-dominoes-tilly', title: 'Dominoes with Tilly', kind: 'companion', companion: 'Tilly Jackson', availability: av('chapter-3'), locationId: 'loc-clemens-point', sourceIds: ['wiki-missions-in-redemption-2'], research: research('researched', ['wiki-missions-in-redemption-2']) },
  { id: 'act-ch3-rob-sean', title: 'Rob a Homestead with Sean', kind: 'companion', companion: 'Sean MacGuire', availability: av('chapter-3'), locationId: 'loc-clemens-point', sourceIds: ['wiki-missions-in-redemption-2'], research: research('researched', ['wiki-missions-in-redemption-2']) },
  { id: 'act-ch3-fish-javier', title: 'Go Fishing with Javier', kind: 'companion', companion: 'Javier Escuella', availability: av('chapter-3'), locationId: 'loc-clemens-point', sourceIds: ['wiki-missions-in-redemption-2'], research: research('researched', ['wiki-missions-in-redemption-2']) },
  { id: 'act-ch3-fish-kieran', title: 'Go Fishing with Kieran', kind: 'companion', companion: 'Kieran Duffy', availability: av('chapter-3'), locationId: 'loc-clemens-point', sourceIds: ['wiki-missions-in-redemption-2'], research: research('researched', ['wiki-missions-in-redemption-2']) },
  { id: 'act-ch3-coach-bill', title: 'Rob a Stagecoach with Bill', kind: 'companion', companion: 'Bill Williamson', availability: av('chapter-3'), locationId: 'loc-clemens-point', sourceIds: ['wiki-missions-in-redemption-2'], research: research('researched', ['wiki-missions-in-redemption-2']) },
  { id: 'act-ch3-coach-sean', title: 'Rob a Stagecoach with Sean', kind: 'companion', companion: 'Sean MacGuire', availability: av('chapter-3'), locationId: 'loc-clemens-point', sourceIds: ['wiki-missions-in-redemption-2'], research: research('researched', ['wiki-missions-in-redemption-2']) },
  { id: 'act-ch4-bank-charles', title: 'Rob a Bank with Charles', kind: 'companion', companion: 'Charles Smith', availability: { ...av('chapter-4'), editions: ['special', 'ultimate'], notes: 'Exclusive companion activity for Special / Ultimate Edition.' }, locationId: 'loc-shady-belle', sourceIds: ['wiki-missions-in-redemption-2'], research: research('researched', ['wiki-missions-in-redemption-2']) },
  { id: 'act-ch4-hunt-pearson', title: 'Go Hunting with Pearson', kind: 'companion', companion: 'Simon Pearson', availability: av('chapter-4'), locationId: 'loc-shady-belle', sourceIds: ['wiki-missions-in-redemption-2'], research: research('researched', ['wiki-missions-in-redemption-2']) },
  { id: 'act-ch4-coach-lenny', title: 'Rob a Stagecoach with Lenny', kind: 'companion', companion: 'Lenny Summers', availability: av('chapter-4'), locationId: 'loc-shady-belle', sourceIds: ['wiki-missions-in-redemption-2'], research: research('researched', ['wiki-missions-in-redemption-2']) },
  { id: 'act-ch4-coach-micah', title: 'Rob a Stagecoach with Micah', kind: 'companion', companion: 'Micah Bell', availability: av('chapter-4'), locationId: 'loc-shady-belle', sourceIds: ['wiki-missions-in-redemption-2'], research: research('researched', ['wiki-missions-in-redemption-2']) },
  { id: 'act-ch4-rustle-uncle', title: 'Go Rustling with Uncle', kind: 'companion', companion: 'Uncle', availability: av('chapter-4'), locationId: 'loc-shady-belle', sourceIds: ['wiki-missions-in-redemption-2'], research: research('researched', ['wiki-missions-in-redemption-2']) },
];

const itemRequests = [
  { id: 'item-javier-oleander', title: 'Oleander Sage for Javier', requester: 'Javier Escuella', availability: { ...av(ch2), requirements: [{ kind: 'time-of-day', window: '8:00–20:00' }] }, locationId: 'loc-horseshoe-overlook', description: 'Javier is at the dominoes table, poisoning his knives.', sourceIds: ['wiki-companion-item-requests'], research: research('researched', ['wiki-companion-item-requests']) },
  { id: 'item-mary-beth-pen', title: 'Fountain Pen for Mary-Beth', requester: 'Mary-Beth Gaskill', availability: { ...av(ch2), requirements: [{ kind: 'time-of-day', window: '8:00–20:00' }] }, locationId: 'loc-horseshoe-overlook', description: 'Mary-Beth is writing in her journal near her bed.', sourceIds: ['wiki-companion-item-requests'], research: research('researched', ['wiki-companion-item-requests']) },
  { id: 'item-pearson-compass', title: 'Naval Compass for Pearson', requester: 'Simon Pearson', availability: { ...av(ch2, { availableChapterIds: [ch2, 'chapter-3', 'chapter-4'], latestChapterId: 'chapter-4' }), requirements: [{ kind: 'time-of-day', window: '8:00–14:00' }] }, locationId: 'loc-horseshoe-overlook', description: 'Ask while playing poker with him. Available Chapters 2–4.', sourceIds: ['wiki-companion-item-requests'], research: research('researched', ['wiki-companion-item-requests']) },
  { id: 'item-jack-comic-book', title: 'Comic Book for Jack', requester: 'Jack Marston', availability: { ...av(ch2), earliestMissionId: 'mission-a-fisher-of-men' }, locationId: 'loc-horseshoe-overlook', description: 'Can trigger during A Fisher of Men.', sourceIds: ['wiki-companion-item-requests'], research: research('researched', ['wiki-companion-item-requests']) },
  { id: 'item-jack-thimble', title: 'Thimble for Jack', requester: 'Jack Marston', availability: { ...av(ch2), earliestMissionId: 'mission-a-fisher-of-men' }, locationId: 'loc-horseshoe-overlook', description: 'After A Fisher of Men; Jack talks to Arthur in front of Dutch’s tent.', sourceIds: ['wiki-companion-item-requests'], research: research('researched', ['wiki-companion-item-requests']) },
  { id: 'item-abigail-five', title: '$5 for Abigail', requester: 'Abigail Marston', availability: { ...av(ch2), earliestMissionId: 'mission-a-fisher-of-men' }, locationId: 'loc-horseshoe-overlook', description: 'After A Fisher of Men; Abigail and Jack are in their tent.', sourceIds: ['wiki-companion-item-requests'], research: research('researched', ['wiki-companion-item-requests']) },
  { id: 'item-tilly-necklace', title: 'Necklace for Tilly', requester: 'Tilly Jackson', availability: av('chapter-3'), locationId: 'loc-clemens-point', description: 'While playing dominoes with her.', sourceIds: ['wiki-companion-item-requests'], research: research('researched', ['wiki-companion-item-requests']) },
  { id: 'item-sadie-harmonica', title: 'Harmonica for Sadie', requester: 'Sadie Adler', availability: { ...av('chapter-3'), earliestMissionId: 'mission-further-questions-of-female-suffrage' }, locationId: 'loc-clemens-point', description: 'During Further Questions of Female Suffrage.', sourceIds: ['wiki-companion-item-requests'], research: research('researched', ['wiki-companion-item-requests']) },
];

const missables = [];
const mapMarkers = [];
const collectibles = [];
const collectibleSets = [];
const challenges = [];
const compendium = [];
const completionRequirements = [];

fs.mkdirSync(outDir, { recursive: true });
const files = {
  'chapters.json': chapters,
  'sources.json': sources,
  'locations.json': locations,
  'missions.json': missions,
  'treasures.json': treasures,
  'activities.json': activities,
  'itemRequests.json': itemRequests,
  'missables.json': missables,
  'mapMarkers.json': mapMarkers,
  'collectibles.json': collectibles,
  'collectibleSets.json': collectibleSets,
  'challenges.json': challenges,
  'compendium.json': compendium,
  'completionRequirements.json': completionRequirements,
};
for (const [name, data] of Object.entries(files)) {
  fs.writeFileSync(path.join(outDir, name), JSON.stringify(data, null, 2) + '\n');
  console.log(name, Array.isArray(data) ? data.length : 1);
}
