import { db } from '@/db/db';
import { getSettings, resetAllProgress } from '@/db/repositories';
import { userDataExportSchema } from '@/data/schemas';
import {
  EXPORT_SCHEMA_VERSION,
  type UserDataExport,
} from '@/types';

export async function buildExport(): Promise<UserDataExport> {
  const [missions, treasures, entities, favorites, settings] = await Promise.all([
    db.missionState.toArray(),
    db.treasureState.toArray(),
    db.entityChecklistState.toArray(),
    db.favorites.toArray(),
    getSettings(),
  ]);
  return {
    schemaVersion: EXPORT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    missions,
    treasures,
    entities,
    favorites,
    settings,
  };
}

export interface ImportSummary {
  missions: number;
  treasures: number;
  entities: number;
  favorites: number;
  unknownMissionIds: string[];
  unknownTreasureIds: string[];
}

export function parseExport(raw: unknown): { ok: true; data: UserDataExport } | { ok: false; error: string } {
  const parsed = userDataExportSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid export file' };
  }
  return { ok: true, data: parsed.data };
}

export function summarizeImport(
  data: UserDataExport,
  knownMissionIds: Set<string>,
  knownTreasureIds: Set<string>,
): ImportSummary {
  return {
    missions: data.missions.length,
    treasures: data.treasures.length,
    entities: data.entities.length,
    favorites: data.favorites.length,
    unknownMissionIds: data.missions.map((m) => m.missionId).filter((id) => !knownMissionIds.has(id)),
    unknownTreasureIds: data.treasures.map((t) => t.chainId).filter((id) => !knownTreasureIds.has(id)),
  };
}

export async function applyImport(data: UserDataExport): Promise<void> {
  await db.transaction(
    'rw',
    db.missionState,
    db.treasureState,
    db.entityChecklistState,
    db.favorites,
    db.settings,
    async () => {
      await db.missionState.clear();
      await db.treasureState.clear();
      await db.entityChecklistState.clear();
      await db.favorites.clear();
      if (data.missions.length) await db.missionState.bulkPut(data.missions);
      if (data.treasures.length) await db.treasureState.bulkPut(data.treasures);
      if (data.entities.length) await db.entityChecklistState.bulkPut(data.entities);
      if (data.favorites.length) await db.favorites.bulkPut(data.favorites);
      await db.settings.put({ key: 'user', value: data.settings });
    },
  );
}

export async function replaceAllFromExport(data: UserDataExport): Promise<void> {
  await applyImport(data);
}

export { resetAllProgress };
