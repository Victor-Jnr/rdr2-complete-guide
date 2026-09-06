/**
 * Dexie schema v1.
 * Never delete this database merely because static guide content changed.
 * Preserve matching stable IDs, ignore removed IDs, initialize new checklist
 * entries as incomplete.
 */
import Dexie, { type Table } from 'dexie';
import type {
  FavoriteRecord,
  UserEntityState,
  UserMissionState,
  UserTreasureState,
} from '@/types';

export interface SettingRow {
  key: string;
  value: unknown;
}

export class GuideDatabase extends Dexie {
  missionState!: Table<UserMissionState, string>;
  treasureState!: Table<UserTreasureState, string>;
  entityChecklistState!: Table<UserEntityState, [string, string]>;
  favorites!: Table<FavoriteRecord, [string, string]>;
  settings!: Table<SettingRow, string>;

  constructor() {
    super('rdr2-complete-guide');
    this.version(1).stores({
      missionState: 'missionId, completed, favorite, updatedAt',
      treasureState: 'chainId, completed, favorite, updatedAt',
      entityChecklistState: '[entityType+entityId], entityType, entityId, completed',
      favorites: '[entityType+entityId], entityType, entityId',
      settings: 'key',
    });
  }
}

export const db = new GuideDatabase();
