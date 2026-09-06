import { Link } from 'react-router';
import { getCompendium, getMission, getTreasure } from '@/data';
import { EmptyState } from '@/components/EmptyState';
import { useAllMissionState, useAllTreasureState, useFavorites } from '@/hooks/useGuideState';

export default function SavedPage() {
  const favs = useFavorites();
  const missions = useAllMissionState();
  const treasures = useAllTreasureState();
  const mMap = new Map(missions.map((s) => [s.missionId, s]));
  const tMap = new Map(treasures.map((s) => [s.chainId, s]));
  const unfinished = favs.filter((f) => {
    if (f.entityType === 'mission') return !mMap.get(f.entityId)?.completed;
    if (f.entityType === 'treasure') return !tMap.get(f.entityId)?.completed;
    return true;
  });

  return (
    <main className="page stack">
      <p>
        <Link to="/progress">← Progress</Link>
      </p>
      <h1>Saved / To Do</h1>
      {!unfinished.length ? <EmptyState title="No favorites" body="Star missions or treasures to build a play-session list." /> : null}
      {unfinished.map((f) => {
        if (f.entityType === 'mission') {
          const m = getMission(f.entityId);
          return m ? (
            <p key={`${f.entityType}-${f.entityId}`}>
              <Link to={`/journey/${m.id}`}>{m.title}</Link>
            </p>
          ) : null;
        }
        if (f.entityType === 'treasure') {
          const t = getTreasure(f.entityId);
          return t ? (
            <p key={`${f.entityType}-${f.entityId}`}>
              <Link to={`/treasures/${t.id}`}>{t.name}</Link>
            </p>
          ) : null;
        }
        if (f.entityType === 'compendium') {
          const c = getCompendium(f.entityId);
          return c ? (
            <p key={`${f.entityType}-${f.entityId}`}>
              <Link to={`/compendium/${c.id}`}>{c.title}</Link>
            </p>
          ) : null;
        }
        return (
          <p key={`${f.entityType}-${f.entityId}`}>
            {f.entityType}: {f.entityId}
          </p>
        );
      })}
    </main>
  );
}
