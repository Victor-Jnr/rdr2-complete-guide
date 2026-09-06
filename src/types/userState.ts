export type ThemeId = 'campfire' | 'parchment';
export type TextSize = 's' | 'm' | 'l';
export type TextureIntensity = 'low' | 'medium' | 'high';

export type EntityType =
  | 'mission'
  | 'treasure'
  | 'treasure-step'
  | 'activity'
  | 'itemRequest'
  | 'missable'
  | 'location'
  | 'collectible'
  | 'challenge'
  | 'compendium'
  | 'completionRequirement'
  | 'map-marker';

export interface UserMissionState {
  missionId: string;
  completed: boolean;
  completedAt?: string;
  objectivesCompleted: string[];
  goldRequirementsCompleted: string[];
  missablesObtained: string[];
  favorite: boolean;
  notes?: string;
  updatedAt: string;
}

export interface UserTreasureState {
  chainId: string;
  stepsCompleted: string[];
  completed: boolean;
  completedAt?: string;
  favorite: boolean;
  notes?: string;
  updatedAt: string;
}

export type ChecklistEntityType = Exclude<
  EntityType,
  'mission' | 'treasure' | 'location'
>;

export interface UserEntityState {
  entityType: ChecklistEntityType;
  entityId: string;
  completed: boolean;
  completedAt?: string;
  notes?: string;
  updatedAt: string;
}

export interface FavoriteRecord {
  entityType: EntityType;
  entityId: string;
  createdAt: string;
}

export interface UserSettings {
  theme: ThemeId;
  textSize: TextSize;
  textureIntensity: TextureIntensity;
  confirmOnUncheck: boolean;
  hideCompletedByDefault: boolean;
  fullResMapDownloaded: boolean;
  mapHiddenMarkerTypes: string[];
  mapHideCollected: boolean;
}

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'campfire',
  textSize: 'm',
  textureIntensity: 'medium',
  confirmOnUncheck: true,
  hideCompletedByDefault: false,
  fullResMapDownloaded: false,
  mapHiddenMarkerTypes: ['animal-habitat', 'herb'],
  mapHideCollected: false,
};
