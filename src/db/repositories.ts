import { db } from './db';
import {
  DEFAULT_SETTINGS,
  type ChecklistEntityType,
  type EntityType,
  type FavoriteRecord,
  type UserEntityState,
  type UserMissionState,
  type UserSettings,
  type UserTreasureState,
} from '@/types';

function now(): string {
  return new Date().toISOString();
}

export function emptyMissionState(missionId: string): UserMissionState {
  return {
    missionId,
    completed: false,
    objectivesCompleted: [],
    goldRequirementsCompleted: [],
    missablesObtained: [],
    favorite: false,
    updatedAt: now(),
  };
}

export function emptyTreasureState(chainId: string): UserTreasureState {
  return {
    chainId,
    stepsCompleted: [],
    completed: false,
    favorite: false,
    updatedAt: now(),
  };
}

export async function getMissionState(missionId: string): Promise<UserMissionState> {
  const row = await db.missionState.get(missionId);
  return row ?? emptyMissionState(missionId);
}

export async function putMissionState(
  patch: Partial<UserMissionState> & { missionId: string },
): Promise<UserMissionState> {
  const current = await getMissionState(patch.missionId);
  const next: UserMissionState = { ...current, ...patch, updatedAt: now() };
  await db.missionState.put(next);
  return next;
}

export async function getTreasureState(chainId: string): Promise<UserTreasureState> {
  const row = await db.treasureState.get(chainId);
  return row ?? emptyTreasureState(chainId);
}

export async function putTreasureState(
  patch: Partial<UserTreasureState> & { chainId: string },
): Promise<UserTreasureState> {
  const current = await getTreasureState(patch.chainId);
  const next: UserTreasureState = { ...current, ...patch, updatedAt: now() };
  await db.treasureState.put(next);
  return next;
}

export async function getEntityState(
  entityType: ChecklistEntityType,
  entityId: string,
): Promise<UserEntityState | undefined> {
  return db.entityChecklistState.get([entityType, entityId]);
}

export async function putEntityState(
  row: Omit<UserEntityState, 'updatedAt'> & { updatedAt?: string },
): Promise<UserEntityState> {
  const current = await getEntityState(row.entityType, row.entityId);
  const next: UserEntityState = {
    entityType: row.entityType,
    entityId: row.entityId,
    completed: row.completed,
    completedAt: Object.hasOwn(row, 'completedAt') ? row.completedAt : current?.completedAt,
    notes: Object.hasOwn(row, 'notes') ? row.notes : current?.notes,
    updatedAt: now(),
  };
  await db.entityChecklistState.put(next);
  return next;
}

export async function isFavorite(entityType: EntityType, entityId: string): Promise<boolean> {
  const row = await db.favorites.get([entityType, entityId]);
  return Boolean(row);
}

export async function setFavorite(
  entityType: EntityType,
  entityId: string,
  favorite: boolean,
): Promise<void> {
  if (favorite) {
    const record: FavoriteRecord = { entityType, entityId, createdAt: now() };
    await db.favorites.put(record);
  } else {
    await db.favorites.delete([entityType, entityId]);
  }
}

export async function getSettings(): Promise<UserSettings> {
  const row = await db.settings.get('user');
  if (!row || typeof row.value !== 'object' || row.value === null) {
    return { ...DEFAULT_SETTINGS };
  }
  return { ...DEFAULT_SETTINGS, ...(row.value as Partial<UserSettings>) };
}

export async function putSettings(patch: Partial<UserSettings>): Promise<UserSettings> {
  const current = await getSettings();
  const next = { ...current, ...patch };
  await db.settings.put({ key: 'user', value: next });
  return next;
}

export async function resetAllProgress(): Promise<void> {
  await db.transaction(
    'rw',
    db.missionState,
    db.treasureState,
    db.entityChecklistState,
    db.favorites,
    async () => {
      await db.missionState.clear();
      await db.treasureState.clear();
      await db.entityChecklistState.clear();
      await db.favorites.clear();
    },
  );
}
