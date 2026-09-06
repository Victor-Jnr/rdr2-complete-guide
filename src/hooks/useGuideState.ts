import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';
import {
  emptyMissionState,
  emptyTreasureState,
  getSettings,
  putEntityState,
  putMissionState,
  putSettings,
  putTreasureState,
  setFavorite,
} from '@/db/repositories';
import { DEFAULT_SETTINGS, type ChecklistEntityType, type EntityType, type UserMissionState, type UserSettings, type UserTreasureState } from '@/types';

export function useMissionState(missionId: string | undefined): UserMissionState | undefined {
  const row = useLiveQuery(
    () => (missionId ? db.missionState.get(missionId) : Promise.resolve(undefined)),
    [missionId],
  );
  if (!missionId) return undefined;
  return (row as UserMissionState | undefined) ?? emptyMissionState(missionId);
}

export function useAllMissionState(): UserMissionState[] {
  return (useLiveQuery(() => db.missionState.toArray(), []) as UserMissionState[] | undefined) ?? [];
}

export function useTreasureState(chainId: string | undefined): UserTreasureState | undefined {
  const row = useLiveQuery(
    () => (chainId ? db.treasureState.get(chainId) : Promise.resolve(undefined)),
    [chainId],
  );
  if (!chainId) return undefined;
  return (row as UserTreasureState | undefined) ?? emptyTreasureState(chainId);
}

export function useAllTreasureState(): UserTreasureState[] {
  return (useLiveQuery(() => db.treasureState.toArray(), []) as UserTreasureState[] | undefined) ?? [];
}

export function useEntityState(entityType: ChecklistEntityType, entityId: string) {
  return useLiveQuery(
    () => db.entityChecklistState.get([entityType, entityId]),
    [entityType, entityId],
  );
}

export function useAllEntityState() {
  return (useLiveQuery(() => db.entityChecklistState.toArray(), []) as import('@/types').UserEntityState[] | undefined) ?? [];
}

export function useFavorites() {
  return (useLiveQuery(() => db.favorites.toArray(), []) as import('@/types').FavoriteRecord[] | undefined) ?? [];
}

export function useIsFavorite(entityType: EntityType, entityId: string) {
  const row = useLiveQuery(
    () => db.favorites.get([entityType, entityId]),
    [entityType, entityId],
  );
  return Boolean(row);
}

export function useSettings(): UserSettings {
  const row = useLiveQuery(() => getSettings(), []);
  return row ?? DEFAULT_SETTINGS;
}

export { putMissionState, putTreasureState, putEntityState, putSettings, setFavorite };
