import { describe, expect, it, beforeEach } from 'vitest';
import { db } from '@/db/db';
import { getEntityState, getMissionState, getTreasureState, putEntityState, putMissionState, putTreasureState, resetAllProgress } from '@/db/repositories';
import { applyImport, buildExport, parseExport } from '@/services/exportImport';

describe('mission state repository', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  it('toggles completion without copying mission content', async () => {
    const a = await putMissionState({ missionId: 'mission-outlaws-from-the-west', completed: true });
    expect(a.completed).toBe(true);
    expect(a.objectivesCompleted).toEqual([]);
    const b = await getMissionState('mission-outlaws-from-the-west');
    expect(b.completed).toBe(true);
    await resetAllProgress();
    const c = await getMissionState('mission-outlaws-from-the-west');
    expect(c.completed).toBe(false);
  });

  it('tracks gold independently from mission completion', async () => {
    await putMissionState({
      missionId: 'm1',
      completed: true,
      goldRequirementsCompleted: ['g1'],
    });
    const row = await getMissionState('m1');
    expect(row.completed).toBe(true);
    expect(row.goldRequirementsCompleted).toEqual(['g1']);
  });

  it('marks a treasure chain complete only after every step', async () => {
    await putTreasureState({
      chainId: 'treasure-jack-hall-gang',
      stepsCompleted: ['jh-1', 'jh-2'],
      completed: false,
    });
    let row = await getTreasureState('treasure-jack-hall-gang');
    expect(row.completed).toBe(false);
    expect(row.stepsCompleted).toHaveLength(2);
    await putTreasureState({
      chainId: 'treasure-jack-hall-gang',
      stepsCompleted: ['jh-1', 'jh-2', 'jh-3', 'jh-4'],
      completed: true,
    });
    row = await getTreasureState('treasure-jack-hall-gang');
    expect(row.completed).toBe(true);
  });

  it('round-trips export and import without touching guide JSON', async () => {
    await putMissionState({ missionId: 'mission-outlaws-from-the-west', completed: true });
    const data = await buildExport();
    const parsed = parseExport(JSON.parse(JSON.stringify(data)));
    expect(parsed.ok).toBe(true);
    await resetAllProgress();
    expect((await getMissionState('mission-outlaws-from-the-west')).completed).toBe(false);
    if (parsed.ok) await applyImport(parsed.data);
    expect((await getMissionState('mission-outlaws-from-the-west')).completed).toBe(true);
  });
});

describe('compendium entity state', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  it('toggles completion without wiping notes', async () => {
    await putEntityState({
      entityType: 'compendium',
      entityId: 'comp-animal-american-alligator',
      completed: false,
      notes: 'Bayou Nwa',
    });
    await putEntityState({
      entityType: 'compendium',
      entityId: 'comp-animal-american-alligator',
      completed: true,
      completedAt: '2026-09-06T00:00:00.000Z',
    });
    const row = await getEntityState('compendium', 'comp-animal-american-alligator');
    expect(row?.completed).toBe(true);
    expect(row?.notes).toBe('Bayou Nwa');
  });
});
