import type { Mission, MissionTag } from '../types';

const SRC_STRANGER = 'wiki-stranger-missions';
const SRC_BOUNTY = 'wiki-bounty-hunting';
const REVIEWED = '2026-09-13';

const FROM_CH2 = ['chapter-2', 'chapter-3', 'chapter-4', 'chapter-6', 'epilogue-1', 'epilogue-2'];
const FROM_CH3 = ['chapter-3', 'chapter-4', 'chapter-6', 'epilogue-1', 'epilogue-2'];
const FROM_CH4 = ['chapter-4', 'chapter-6', 'epilogue-1', 'epilogue-2'];
const FROM_CH6 = ['chapter-6', 'epilogue-1', 'epilogue-2'];
const FROM_EPI = ['epilogue-1', 'epilogue-2'];

function research(sourceId: string) {
  return {
    verificationStatus: 'researched' as const,
    sourceIds: [sourceId],
    lastReviewedAt: REVIEWED,
  };
}

function sideMission(p: {
  slug: string;
  title: string;
  chapterId: string;
  order: number;
  tags: MissionTag[];
  questGiver: string;
  startLocationId?: string;
  prerequisiteMissionIds?: string[];
  followUpMissionIds?: string[];
  summary: string;
  availableChapterIds: string[];
  missable?: boolean;
  missableWarning?: string;
  objective: string;
  sourceId: string;
}): Mission {
  const lastChapter = p.availableChapterIds[p.availableChapterIds.length - 1] ?? p.chapterId;
  return {
    id: `mission-${p.slug}`,
    slug: p.slug,
    title: p.title,
    chapterId: p.chapterId,
    order: p.order,
    tags: p.tags,
    questGiver: p.questGiver,
    startLocationId: p.startLocationId,
    prerequisiteMissionIds: p.prerequisiteMissionIds,
    followUpMissionIds: p.followUpMissionIds,
    summary: p.summary,
    availability: {
      displayChapterId: p.chapterId,
      availableChapterIds: p.availableChapterIds,
      earliestChapterId: p.chapterId,
      latestChapterId: lastChapter,
    },
    missable: p.missable,
    missableWarning: p.missableWarning,
    objectives: [
      {
        id: `obj-${p.slug}-strand`,
        label: p.objective,
        research: research(p.sourceId),
      },
    ],
    sourceIds: [p.sourceId],
    research: research(p.sourceId),
  };
}

const stranger = (p: Omit<Parameters<typeof sideMission>[0], 'tags' | 'sourceId' | 'objective'> & { objective?: string }): Mission =>
  sideMission({
    ...p,
    tags: ['stranger'],
    sourceId: SRC_STRANGER,
    objective: p.objective ?? 'Complete this stranger strand',
  });

const bounty = (p: Omit<Parameters<typeof sideMission>[0], 'tags' | 'sourceId' | 'objective'> & { objective?: string }): Mission =>
  sideMission({
    ...p,
    tags: ['bounty'],
    sourceId: SRC_BOUNTY,
    objective: p.objective ?? 'Take the bounty poster and bring the target in',
  });

/** Story-adjacent stranger strands and sheriff-board bounties missing from the seed list. */
export const sideMissions: Mission[] = [
  stranger({
    slug: 'the-noblest-of-men-and-a-woman',
    title: 'The Noblest of Men, and a Woman',
    chapterId: 'chapter-2',
    order: 100,
    questGiver: 'Theodore Levin',
    startLocationId: 'loc-valentine',
    prerequisiteMissionIds: ['mission-polite-society-valentine-style'],
    summary:
      'A biographer in the Valentine saloon wants living gunslingers tracked down: Flaco Hernández, Emmet Granger, Billy Midnight, Black Belle, and later Jim “Boy” Calloway.',
    availableChapterIds: FROM_CH2,
  }),
  stranger({
    slug: 'all-that-glitters',
    title: 'All That Glitters',
    chapterId: 'chapter-2',
    order: 101,
    questGiver: 'Stranger',
    startLocationId: 'loc-diablo-ridge',
    summary:
      'A prospector on Diablo Ridge, west of Strawberry, talks about a nearby treasure. This encounter points toward a treasure-map chain.',
    availableChapterIds: FROM_CH2,
  }),
  stranger({
    slug: 'arcadia-for-amateurs',
    title: 'Arcadia for Amateurs',
    chapterId: 'chapter-2',
    order: 102,
    questGiver: 'Albert Mason',
    startLocationId: 'loc-valentine',
    prerequisiteMissionIds: ['mission-eastward-bound'],
    summary:
      'Wildlife photographer Albert Mason keeps getting himself into trouble with horses, wolves, and other beasts across the Heartlands and beyond.',
    availableChapterIds: FROM_CH2,
  }),
  stranger({
    slug: 'hes-british-of-course',
    title: "He's British, of Course",
    chapterId: 'chapter-2',
    order: 103,
    questGiver: 'Margaret',
    startLocationId: 'loc-emerald-ranch',
    prerequisiteMissionIds: ['mission-eastward-bound'],
    summary:
      'Margaret at Emerald Ranch asks for help recovering escaped circus animals — a zebra, a tiger, and a lion — over several parts.',
    availableChapterIds: FROM_CH2,
  }),
  stranger({
    slug: 'a-test-of-faith',
    title: 'A Test of Faith',
    chapterId: 'chapter-2',
    order: 104,
    questGiver: 'Deborah MacGuiness',
    startLocationId: 'loc-valentine',
    prerequisiteMissionIds: ['mission-eastward-bound'],
    summary:
      'Paleontologist Deborah MacGuiness will pay for dinosaur bones. Collect and mail the bones found across the map.',
    availableChapterIds: FROM_CH2,
  }),
  stranger({
    slug: 'geology-for-beginners',
    title: 'Geology for Beginners',
    chapterId: 'chapter-2',
    order: 105,
    questGiver: 'Francis Sinclair',
    startLocationId: 'loc-mount-shann',
    prerequisiteMissionIds: ['mission-eastward-bound'],
    summary:
      'Francis Sinclair’s cabin west of Strawberry is the drop-off for rock carvings found around the world.',
    availableChapterIds: FROM_CH2,
  }),
  stranger({
    slug: 'smoking-and-other-hobbies',
    title: 'Smoking and Other Hobbies',
    chapterId: 'chapter-2',
    order: 106,
    questGiver: 'Phineas T. Ramsbottom',
    startLocationId: 'loc-flatneck-station',
    prerequisiteMissionIds: ['mission-eastward-bound'],
    summary:
      'A collector at Flatneck Station wants cigarette cards. Send complete sets through the mail.',
    availableChapterIds: FROM_CH2,
  }),
  stranger({
    slug: 'a-fisher-of-fish',
    title: 'A Fisher of Fish',
    chapterId: 'chapter-2',
    order: 107,
    questGiver: 'Jeremy Gill',
    startLocationId: 'loc-flatneck-station',
    prerequisiteMissionIds: ['mission-eastward-bound'],
    summary:
      'Jeremy Gill, north of Flatneck Station on the Dakota River, wants legendary fish mailed in as you catch them.',
    availableChapterIds: FROM_CH2,
  }),
  stranger({
    slug: 'oh-brother',
    title: 'Oh, Brother',
    chapterId: 'chapter-2',
    order: 108,
    questGiver: 'Ethan and Egbert',
    startLocationId: 'loc-calibans-seat',
    prerequisiteMissionIds: ['mission-polite-society-valentine-style'],
    summary:
      'Rival twins keep picking fights near Caliban’s Seat. Step in across three encounters.',
    availableChapterIds: FROM_CH2,
  }),
  stranger({
    slug: 'hunting-requests',
    title: 'Hunting Requests',
    chapterId: 'chapter-2',
    order: 109,
    questGiver: 'Wildlife art exhibitor',
    startLocationId: 'loc-horseshoe-overlook',
    prerequisiteMissionIds: ['mission-eastward-bound'],
    summary:
      'Posted hunting requests at camp and post offices ask for specific animal carcasses and parts. Complete each request on the list.',
    availableChapterIds: FROM_CH2,
  }),
  stranger({
    slug: 'american-dreams',
    title: 'American Dreams',
    chapterId: 'chapter-2',
    order: 110,
    questGiver: 'Serial killer clues',
    summary:
      'Map pieces at murder scenes lead to a killer under a hut. Finish the investigation when you have the full map.',
    availableChapterIds: FROM_CH2,
  }),
  stranger({
    slug: 'the-wisdom-of-the-elders',
    title: 'The Wisdom of the Elders',
    chapterId: 'chapter-2',
    order: 111,
    questGiver: 'The village',
    startLocationId: 'loc-butcher-creek',
    prerequisiteMissionIds: ['mission-eastward-bound'],
    summary:
      'Butcher Creek’s residents talk of a curse. Help or challenge the story through several parts around the village.',
    availableChapterIds: FROM_CH2,
  }),
  stranger({
    slug: 'the-iniquities-of-our-forefathers',
    title: 'The Iniquities of our Forefathers',
    chapterId: 'chapter-3',
    order: 100,
    questGiver: 'Jeremiah Compson',
    startLocationId: 'loc-rhodes',
    prerequisiteMissionIds: ['mission-the-new-south'],
    summary:
      'An old man in Rhodes wants family heirlooms recovered from his former home, then a darker truth comes out.',
    availableChapterIds: FROM_CH3,
  }),
  stranger({
    slug: 'no-good-deed',
    title: 'No Good Deed',
    chapterId: 'chapter-4',
    order: 100,
    questGiver: 'Alphonse Renaud',
    startLocationId: 'loc-saint-denis',
    prerequisiteMissionIds: ['mission-the-joys-of-civilization'],
    summary:
      'A beaten man in Saint Denis asks you to recover a stolen wagon of medical supplies.',
    availableChapterIds: FROM_CH4,
  }),
  stranger({
    slug: 'the-artists-way',
    title: "The Artist's Way",
    chapterId: 'chapter-4',
    order: 101,
    questGiver: 'Charles Châtenay',
    startLocationId: 'loc-saint-denis',
    prerequisiteMissionIds: ['mission-the-joys-of-civilization'],
    summary:
      'Painter Charles Châtenay needs help with galleries, jealous husbands, and a way out of Saint Denis.',
    availableChapterIds: FROM_CH4,
  }),
  stranger({
    slug: 'a-bright-bouncing-boy',
    title: 'A Bright Bouncing Boy',
    chapterId: 'chapter-4',
    order: 102,
    questGiver: 'Marko Dragic',
    startLocationId: 'loc-saint-denis',
    prerequisiteMissionIds: ['mission-the-joys-of-civilization'],
    summary:
      'Inventor Marko Dragic shows off a remote-controlled boat in Saint Denis, then later a larger experiment at Doverhill.',
    availableChapterIds: FROM_CH4,
  }),
  stranger({
    slug: 'duchesses-and-other-animals',
    title: 'Duchesses and Other Animals',
    chapterId: 'chapter-4',
    order: 103,
    questGiver: 'Algernon Wasp',
    startLocationId: 'loc-saint-denis',
    prerequisiteMissionIds: ['mission-the-joys-of-civilization'],
    summary:
      'Algernon Wasp in Saint Denis pays for exotic plumes, orchids, and other collectibles for his exhibition.',
    availableChapterIds: FROM_CH4,
  }),
  stranger({
    slug: 'the-mercies-of-knowledge',
    title: 'The Mercies of Knowledge',
    chapterId: 'chapter-4',
    order: 104,
    questGiver: 'Andrew Bell III',
    startLocationId: 'loc-saint-denis',
    prerequisiteMissionIds: ['mission-the-joys-of-civilization'],
    summary:
      'Andrew Bell III wants parts and a test subject for an electric chair he hopes to sell to the city.',
    availableChapterIds: FROM_CH4,
  }),
  stranger({
    slug: 'idealism-and-pragmatism-for-beginners',
    title: 'Idealism and Pragmatism, for Beginners',
    chapterId: 'chapter-4',
    order: 105,
    questGiver: 'Mayor Henri Lemieux',
    startLocationId: 'loc-saint-denis',
    prerequisiteMissionIds: ['mission-the-gilded-cage'],
    summary:
      'Mayor Lemieux asks for increasingly dirty favors to keep Saint Denis under his control.',
    availableChapterIds: FROM_CH4,
    missable: true,
    missableWarning: 'Start after The Gilded Cage while the gang is still around Saint Denis',
  }),
  stranger({
    slug: 'the-ties-that-bind-us',
    title: 'The Ties That Bind Us',
    chapterId: 'chapter-4',
    order: 106,
    questGiver: 'The Hill brothers',
    startLocationId: 'loc-saint-denis',
    prerequisiteMissionIds: ['mission-the-joys-of-civilization'],
    summary:
      'Two brothers outside Saint Denis drag you into a family quarrel that stretches over several parts.',
    availableChapterIds: FROM_CH4,
  }),
  stranger({
    slug: 'the-smell-of-the-grease-paint',
    title: 'The Smell of the Grease Paint',
    chapterId: 'chapter-4',
    order: 107,
    questGiver: 'Miss Marjorie',
    startLocationId: 'loc-saint-denis',
    prerequisiteMissionIds: ['mission-the-joys-of-civilization'],
    summary:
      'Miss Marjorie needs her strongman Bertram found in Saint Denis, then later help getting the show to Van Horn.',
    availableChapterIds: FROM_CH4,
  }),
  stranger({
    slug: 'the-fundraiser',
    title: 'The Fundraiser',
    chapterId: 'chapter-4',
    order: 108,
    questGiver: 'Mayor Henri Lemieux',
    startLocationId: 'loc-saint-denis',
    prerequisiteMissionIds: ['mission-the-gilded-cage'],
    summary:
      'A short, missable party at the mayor’s house in Saint Denis. Talk to guests before the gang leaves the city.',
    availableChapterIds: ['chapter-4'],
    missable: true,
    missableWarning: 'Only available in Chapter 4 after The Gilded Cage, before the bank robbery',
  }),
  stranger({
    slug: 'a-fine-night-for-it',
    title: 'A Fine Night For It',
    chapterId: 'chapter-4',
    order: 109,
    questGiver: 'Old Cajun',
    startLocationId: 'loc-lagras',
    prerequisiteMissionIds: ['mission-the-joys-of-civilization'],
    summary:
      'At night in Lagras, an old man asks for help clearing Night Folk from a shack in the swamp.',
    availableChapterIds: FROM_CH4,
  }),
  stranger({
    slug: 'the-veteran',
    title: 'The Veteran',
    chapterId: 'chapter-6',
    order: 100,
    questGiver: 'Hamish Sinclair',
    startLocationId: 'loc-ocreaghs-run',
    followUpMissionIds: ['mission-a-better-world-a-new-friend'],
    summary:
      'A one-legged veteran at O’Creagh’s Run offers fishing, a wolf hunt, and rides with his horse Buell.',
    availableChapterIds: FROM_CH6,
  }),
  stranger({
    slug: 'the-widow-of-willards-rest',
    title: "The Widow of Willard's Rest",
    chapterId: 'chapter-6',
    order: 101,
    questGiver: 'Charlotte Balfour',
    startLocationId: 'loc-manito-glade',
    summary:
      'A newly widowed woman at Manito Glade needs help learning to hunt and survive in the north.',
    availableChapterIds: FROM_CH6,
  }),
  stranger({
    slug: 'the-american-inferno-burnt-out',
    title: 'The American Inferno, Burnt Out',
    chapterId: 'chapter-6',
    order: 102,
    questGiver: 'Evelyn Miller',
    startLocationId: 'loc-blackwater',
    summary:
      'Writer Evelyn Miller has retreated to a cabin. Check on him across several visits; John can finish the strand.',
    availableChapterIds: FROM_CH6,
  }),
  stranger({
    slug: 'a-better-world-a-new-friend',
    title: 'A Better World, A New Friend',
    chapterId: 'epilogue-1',
    order: 100,
    questGiver: 'Hamish Sinclair',
    startLocationId: 'loc-ocreaghs-run',
    prerequisiteMissionIds: ['mission-the-veteran'],
    summary:
      'As John, return to O’Creagh’s Run to continue Hamish’s story and the fate of Buell.',
    availableChapterIds: FROM_EPI,
  }),
  bounty({
    slug: 'bounty-joshua-brown',
    title: 'Bounty: Joshua Brown',
    chapterId: 'chapter-2',
    order: 120,
    questGiver: 'Valentine Sheriff',
    startLocationId: 'loc-valentine',
    prerequisiteMissionIds: ['mission-polite-society-valentine-style'],
    summary: 'Valentine sheriff-board bounty. Track Joshua Brown in the hills north of town.',
    availableChapterIds: FROM_CH2,
  }),
  bounty({
    slug: 'bounty-ellie-anne-swan',
    title: 'Bounty: Ellie Anne Swan',
    chapterId: 'chapter-2',
    order: 121,
    questGiver: 'Valentine Sheriff',
    startLocationId: 'loc-valentine',
    prerequisiteMissionIds: ['mission-polite-society-valentine-style'],
    summary: 'Valentine sheriff-board bounty. Ellie Anne Swan is wanted around the Heartlands.',
    availableChapterIds: FROM_CH2,
  }),
  bounty({
    slug: 'bounty-lindsey-wofford',
    title: 'Bounty: Lindsey Wofford',
    chapterId: 'chapter-2',
    order: 122,
    questGiver: 'Valentine Sheriff',
    startLocationId: 'loc-valentine',
    prerequisiteMissionIds: ['mission-polite-society-valentine-style'],
    summary: 'Valentine sheriff-board bounty. Lindsey Wofford hides with remaining O’Driscolls.',
    availableChapterIds: FROM_CH2,
  }),
  bounty({
    slug: 'bounty-mark-johnson',
    title: 'Bounty: Mark Johnson',
    chapterId: 'chapter-2',
    order: 123,
    questGiver: 'Strawberry Sheriff',
    startLocationId: 'loc-strawberry',
    prerequisiteMissionIds: ['mission-blessed-are-the-meek'],
    summary: 'Strawberry sheriff-board bounty, posted after the town opens. Bring Mark Johnson in.',
    availableChapterIds: FROM_CH2,
  }),
  bounty({
    slug: 'bounty-anthony-foreman',
    title: 'Bounty: Anthony Foreman',
    chapterId: 'chapter-3',
    order: 120,
    questGiver: 'Rhodes Sheriff',
    startLocationId: 'loc-rhodes',
    prerequisiteMissionIds: ['mission-the-new-south'],
    summary: 'Rhodes sheriff-board bounty. Anthony Foreman is wanted around Lemoyne.',
    availableChapterIds: FROM_CH3,
  }),
  bounty({
    slug: 'bounty-robbie-laidlaw',
    title: 'Bounty: Robbie Laidlaw',
    chapterId: 'chapter-3',
    order: 121,
    questGiver: 'Rhodes Sheriff',
    startLocationId: 'loc-rhodes',
    prerequisiteMissionIds: ['mission-the-new-south'],
    summary: 'Rhodes sheriff-board bounty. Robbie Laidlaw is hiding in the swamps.',
    availableChapterIds: FROM_CH3,
  }),
  bounty({
    slug: 'bounty-bart-cavanaugh',
    title: 'Bounty: Bart Cavanaugh',
    chapterId: 'chapter-4',
    order: 120,
    questGiver: 'Saint Denis Police',
    startLocationId: 'loc-saint-denis',
    prerequisiteMissionIds: ['mission-the-joys-of-civilization'],
    summary: 'Saint Denis police-board bounty. Bartholomew “Bart” Cavanaugh is wanted in the city.',
    availableChapterIds: FROM_CH4,
  }),
  bounty({
    slug: 'bounty-elias-green',
    title: 'Bounty: Elias Green',
    chapterId: 'chapter-4',
    order: 121,
    questGiver: 'Saint Denis Police',
    startLocationId: 'loc-saint-denis',
    prerequisiteMissionIds: ['mission-the-joys-of-civilization'],
    summary: 'Saint Denis police-board bounty. Elias Green is posted alongside other city targets.',
    availableChapterIds: FROM_CH4,
  }),
  bounty({
    slug: 'bounty-wilson-j-mcdaniels',
    title: 'Bounty: Wilson J. McDaniels',
    chapterId: 'chapter-6',
    order: 120,
    questGiver: 'Van Horn',
    startLocationId: 'loc-van-horn',
    summary: 'Bounty posted around Van Horn. Wilson J. McDaniels is wanted in Roanoke Ridge.',
    availableChapterIds: FROM_CH6,
  }),
  bounty({
    slug: 'bounty-esteban-cortez',
    title: 'Bounty: Esteban Cortez',
    chapterId: 'epilogue-1',
    order: 120,
    questGiver: 'Tumbleweed Sheriff',
    startLocationId: 'loc-tumbleweed',
    summary: 'Tumbleweed sheriff-board bounty after New Austin opens. Hunt Esteban Cortez.',
    availableChapterIds: FROM_EPI,
  }),
  bounty({
    slug: 'bounty-joaquin-arroyo',
    title: 'Bounty: Joaquin Arroyo',
    chapterId: 'epilogue-1',
    order: 121,
    questGiver: 'Tumbleweed Sheriff',
    startLocationId: 'loc-tumbleweed',
    summary: 'Tumbleweed sheriff-board bounty. Joaquin Arroyo is wanted in New Austin.',
    availableChapterIds: FROM_EPI,
  }),
];
