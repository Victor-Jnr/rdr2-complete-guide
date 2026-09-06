import { Link } from 'react-router';
import { activities, chapters, completionRequirements, itemRequests, missions, missables, treasures } from '@/data';
import { Checkbox } from '@/components/Checkbox';
import { ProgressBar } from '@/components/ProgressBar';
import { overallCategories, percent, evaluateCompletionRequirement } from '@/services/progress';
import {
  putEntityState,
  useAllEntityState,
  useAllMissionState,
  useAllTreasureState,
  useFavorites,
} from '@/hooks/useGuideState';
import { missionsForChapter } from '@/data';

const COMPLETION_GROUPS: { id: string; label: string }[] = [
  { id: 'missions-and-events', label: 'Missions and events' },
  { id: 'collectibles', label: 'Collectibles' },
  { id: 'compendium', label: 'Compendium' },
  { id: 'player', label: 'Player' },
  { id: 'miscellaneous', label: 'Miscellaneous' },
];

export default function ProgressPage() {
  const missionStates = useAllMissionState();
  const treasureStates = useAllTreasureState();
  const entityStates = useAllEntityState();
  const favorites = useFavorites();
  const mMap = new Map(missionStates.map((s) => [s.missionId, s]));
  const tMap = new Map(treasureStates.map((s) => [s.chainId, s]));
  const eMap = new Map(entityStates.map((s) => [`${s.entityType}:${s.entityId}`, s]));
  const cats = overallCategories(missions, treasures, mMap, tMap, eMap, {
    campIds: activities.filter((a) => a.kind === 'camp').map((a) => a.id),
    companionIds: activities.filter((a) => a.kind === 'companion').map((a) => a.id),
    itemTotal: itemRequests.length,
    missableTotal: missables.length,
  });
  const overallDone = cats.reduce((n, c) => n + c.done, 0);
  const overallTotal = cats.reduce((n, c) => n + c.total, 0);
  const completedEntityIds = new Set<string>([
    ...missionStates.filter((s) => s.completed).map((s) => s.missionId),
    ...treasureStates.filter((s) => s.completed).map((s) => s.chainId),
    ...entityStates.filter((s) => s.completed).map((s) => s.entityId),
  ]);
  const unfinishedFavs = favorites.filter((f) => {
    if (f.entityType === 'mission') return !mMap.get(f.entityId)?.completed;
    if (f.entityType === 'treasure') return !tMap.get(f.entityId)?.completed;
    return !eMap.get(`${f.entityType}:${f.entityId}`)?.completed;
  });
  const required = completionRequirements.filter((r) => r.countsToward100);
  const requiredDone = required.filter((r) => evaluateCompletionRequirement(r, { completedEntityIds }).complete).length;

  return (
    <main className="page stack">
      <h1>Progress</h1>
      <ProgressBar done={overallDone} total={overallTotal} label="Tracked items" />
      {cats.map((c) => (
        <ProgressBar key={c.id} done={c.done} total={c.total} label={c.label} />
      ))}
      <section>
        <h2>Chapters</h2>
        {chapters.map((ch) => {
          const list = missionsForChapter(ch.id);
          const done = list.filter((m) => mMap.get(m.id)?.completed).length;
          return (
            <Link key={ch.id} to={`/journey/chapter/${ch.id}`} className="journal-panel" style={{ display: 'block', padding: 12, marginBottom: 8, color: 'inherit', textDecoration: 'none' }}>
              <strong>
                {ch.title} — {ch.subtitle}
              </strong>
              <ProgressBar done={done} total={list.length} />
              <span style={{ color: 'var(--ink-muted)' }}>{percent(done, list.length)}%</span>
            </Link>
          );
        })}
      </section>
      <section>
        <h2>100% Total Completion</h2>
        <ProgressBar done={requiredDone} total={required.length} label="Official 100% criteria" />
        {COMPLETION_GROUPS.map((group) => {
          const rows = required.filter((r) => r.category === group.id);
          if (!rows.length) return null;
          const done = rows.filter((r) => evaluateCompletionRequirement(r, { completedEntityIds }).complete).length;
          return (
            <div key={group.id} className="journal-panel" style={{ padding: 12, marginBottom: 8 }}>
              <h3>
                {group.label} ({done}/{rows.length})
              </h3>
              {rows.map((req) => {
                const complete = evaluateCompletionRequirement(req, { completedEntityIds }).complete;
                return (
                  <Checkbox
                    key={req.id}
                    checked={complete}
                    label={req.title}
                    onChange={(next) => {
                      void putEntityState({
                        entityType: 'completionRequirement',
                        entityId: req.id,
                        completed: next,
                        completedAt: next ? new Date().toISOString() : undefined,
                      });
                    }}
                  />
                );
              })}
            </div>
          );
        })}
      </section>
      <section>
        <h2>To Do / Saved</h2>
        <p>
          <Link to="/progress/saved">Open saved list</Link>
        </p>
        {unfinishedFavs.length === 0 ? (
          <p style={{ color: 'var(--ink-muted)' }}>No unfinished saved items.</p>
        ) : (
          <p>{unfinishedFavs.length} unfinished saved items</p>
        )}
      </section>
    </main>
  );
}
