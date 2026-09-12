import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router';
import { chapters, missionsForChapter } from '@/data';
import { MissionCard } from '@/components/MissionCard';
import { FilterChips } from '@/components/FilterChips';
import { Checkbox } from '@/components/Checkbox';
import { SectionHeader } from '@/components/SectionHeader';
import { useAllMissionState, putMissionState, useFavorites, useSettings } from '@/hooks/useGuideState';
import type { Mission } from '@/types';
import { isMissableLeavingChapter } from '@/services/availability';

const chips = [
  { id: 'all', label: 'All' },
  { id: 'main', label: 'Main' },
  { id: 'optional', label: 'Optional' },
  { id: 'stranger', label: 'Stranger' },
  { id: 'bounty', label: 'Bounty' },
  { id: 'missable', label: 'Missable' },
  { id: 'completed', label: 'Completed' },
  { id: 'incomplete', label: 'Not Completed' },
];

function matches(m: Mission, filter: string, q: string, completed: boolean, favOnly: boolean, isFav: boolean): boolean {
  if (favOnly && !isFav) return false;
  if (q && !`${m.title} ${m.questGiver ?? ''}`.toLowerCase().includes(q.toLowerCase())) return false;
  if (filter === 'main' && !m.tags.includes('main-story')) return false;
  if (filter === 'optional' && !m.tags.some((t) => t === 'optional-story' || t === 'honor' || t === 'debt-collection')) return false;
  if (filter === 'stranger' && !m.tags.includes('stranger')) return false;
  if (filter === 'bounty' && !m.tags.includes('bounty')) return false;
  if (filter === 'missable' && !m.missable && !m.tags.includes('missable')) return false;
  if (filter === 'completed' && !completed) return false;
  if (filter === 'incomplete' && completed) return false;
  return true;
}

export default function JourneyPage() {
  const [params, setParams] = useSearchParams();
  const settings = useSettings();
  const filter = params.get('filter') ?? (settings.hideCompletedByDefault ? 'incomplete' : 'all');
  const q = params.get('q') ?? '';
  const favOnly = params.get('fav') === '1';
  const checklist = params.get('mode') === 'checklist';
  const states = useAllMissionState();
  const favs = useFavorites();
  const stateById = useMemo(() => new Map(states.map((s) => [s.missionId, s])), [states]);
  const favSet = useMemo(
    () => new Set(favs.filter((f) => f.entityType === 'mission').map((f) => f.entityId)),
    [favs],
  );

  const set = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (!value) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  return (
    <main className="page stack">
      <SectionHeader title="Journey" aside={checklist ? 'Checklist mode' : undefined} />
      <label>
        <span className="sr-only">Search missions</span>
        <input
          value={q}
          onChange={(e) => set('q', e.target.value || null)}
          placeholder="Search this journal…"
          style={{ width: '100%', minHeight: 44, padding: '0 12px' }}
        />
      </label>
      <FilterChips chips={chips} value={filter} onChange={(id) => set('filter', id)} />
      <div className="row">
        <Checkbox
          checked={favOnly}
          onChange={(next) => set('fav', next ? '1' : null)}
          label="Saved"
          confirmUncheck={false}
        />
        <Checkbox
          checked={checklist}
          onChange={(next) => set('mode', next ? 'checklist' : null)}
          label="Checklist mode"
          confirmUncheck={false}
        />
      </div>

      {chapters.map((ch) => {
        const list = missionsForChapter(ch.id).filter((m) => {
          const st = stateById.get(m.id);
          const completed = Boolean(st?.completed);
          return matches(m, filter, q, completed, favOnly, favSet.has(m.id));
        });
        const leaving = missionsForChapter(ch.id).filter(
          (m) => (m.missable || m.tags.includes('missable')) && isMissableLeavingChapter(m.availability, ch.id),
        );
        if (!list.length && !checklist) return null;
        return (
          <section key={ch.id} className="stack">
            <SectionHeader
              title={`${ch.title} — ${ch.subtitle ?? ''}`}
              aside={`${list.length}`}
            />
            <Link to={`/journey/chapter/${ch.id}`}>Open chapter checklist</Link>
            {checklist && leaving.length ? (
              <div className="journal-panel" style={{ padding: 12 }}>
                <strong>Before continuing</strong>
                <ul>
                  {leaving.map((m) => (
                    <li key={m.id}>⚠ {m.title}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {list.map((m) => (
              <MissionCard
                key={m.id}
                mission={m}
                state={stateById.get(m.id)}
                compact={checklist}
                onToggleComplete={(complete) => void putMissionState({ missionId: m.id, completed: complete })}
              />
            ))}
          </section>
        );
      })}
    </main>
  );
}
