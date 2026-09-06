import type {
  FavoriteRecord,
  UserEntityState,
  UserMissionState,
  UserSettings,
  UserTreasureState,
} from './userState';

export const EXPORT_SCHEMA_VERSION = 1 as const;

export interface UserDataExport {
  schemaVersion: typeof EXPORT_SCHEMA_VERSION;
  exportedAt: string;
  missions: UserMissionState[];
  treasures: UserTreasureState[];
  entities: UserEntityState[];
  favorites: FavoriteRecord[];
  settings: UserSettings;
}
