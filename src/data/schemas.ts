import { z } from 'zod';

export const verificationStatusSchema = z.enum([
  'unresearched',
  'researched',
  'cross-checked',
  'verified',
  'needs-review',
]);

export const researchSchema = z.object({
  verificationStatus: verificationStatusSchema,
  sourceIds: z.array(z.string()),
  lastReviewedAt: z.string().optional(),
});

export const platformSchema = z.enum(['pc', 'ps4', 'ps5', 'xbox-one', 'xbox-series']);
export const editionSchema = z.enum(['standard', 'special', 'ultimate']);

export const availabilityRequirementSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('honor'),
    minimum: z.number().optional(),
    maximum: z.number().optional(),
    description: z.string().optional(),
  }),
  z.object({
    kind: z.literal('time-of-day'),
    window: z.string(),
    description: z.string().optional(),
  }),
  z.object({
    kind: z.literal('weather'),
    description: z.string(),
  }),
  z.object({
    kind: z.literal('item-owned'),
    itemId: z.string().optional(),
    description: z.string(),
  }),
  z.object({
    kind: z.literal('story-flag'),
    flag: z.string(),
    description: z.string(),
  }),
  z.object({ kind: z.literal('online-only') }),
  z.object({ kind: z.literal('other'), description: z.string() }),
]);

export const availabilitySchema = z.object({
  displayChapterId: z.string(),
  availableChapterIds: z.array(z.string()).optional(),
  earliestChapterId: z.string().optional(),
  latestChapterId: z.string().optional(),
  earliestMissionId: z.string().optional(),
  latestMissionId: z.string().optional(),
  missableAfterMissionId: z.string().optional(),
  platforms: z.array(platformSchema).optional(),
  editions: z.array(editionSchema).optional(),
  preorderOnly: z.boolean().optional(),
  requirements: z.array(availabilityRequirementSchema).optional(),
  notes: z.string().optional(),
  research: researchSchema.optional(),
});

export const checklistItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().optional(),
  research: researchSchema.optional(),
});

export const userMissionStateSchema = z.object({
  missionId: z.string(),
  completed: z.boolean(),
  completedAt: z.string().optional(),
  objectivesCompleted: z.array(z.string()),
  goldRequirementsCompleted: z.array(z.string()),
  missablesObtained: z.array(z.string()),
  favorite: z.boolean(),
  notes: z.string().optional(),
  updatedAt: z.string(),
});

export const userTreasureStateSchema = z.object({
  chainId: z.string(),
  stepsCompleted: z.array(z.string()),
  completed: z.boolean(),
  completedAt: z.string().optional(),
  favorite: z.boolean(),
  notes: z.string().optional(),
  updatedAt: z.string(),
});

export const userEntityStateSchema = z.object({
  entityType: z.enum([
    'activity',
    'itemRequest',
    'missable',
    'collectible',
    'challenge',
    'compendium',
    'completionRequirement',
    'treasure-step',
    'map-marker',
  ]),
  entityId: z.string(),
  completed: z.boolean(),
  completedAt: z.string().optional(),
  notes: z.string().optional(),
  updatedAt: z.string(),
});

export const favoriteRecordSchema = z.object({
  entityType: z.enum([
    'mission',
    'treasure',
    'treasure-step',
    'activity',
    'itemRequest',
    'missable',
    'location',
    'collectible',
    'challenge',
    'compendium',
    'completionRequirement',
    'map-marker',
  ]),
  entityId: z.string(),
  createdAt: z.string(),
});

export const userSettingsSchema = z.object({
  theme: z.enum(['campfire', 'parchment']),
  textSize: z.enum(['s', 'm', 'l']),
  textureIntensity: z.enum(['low', 'medium', 'high']),
  confirmOnUncheck: z.boolean(),
  hideCompletedByDefault: z.boolean(),
  fullResMapDownloaded: z.boolean(),
  mapHiddenMarkerTypes: z.array(z.string()).default(['animal-habitat', 'herb']),
  mapHideCollected: z.boolean().default(false),
});

export const userDataExportSchema = z.object({
  schemaVersion: z.literal(1),
  exportedAt: z.string(),
  missions: z.array(userMissionStateSchema),
  treasures: z.array(userTreasureStateSchema),
  entities: z.array(userEntityStateSchema),
  favorites: z.array(favoriteRecordSchema),
  settings: userSettingsSchema,
});
