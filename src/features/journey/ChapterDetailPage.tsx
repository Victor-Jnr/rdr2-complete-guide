import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import {
  activities,
  getChapter,
  itemRequests,
  missionsForChapter,
  treasures,
} from '@/data';
import { Checkbox } from '@/components/Checkbox';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/EmptyState';
import { MissionCard } from '@/components/MissionCard';
import { SectionHeader } from '@/components/SectionHeader';
import {
  putEntityState,
  putMissionState,
  useAllEntityState,
  useAllMissionState,
  useAllTreasureState,
  useSettings,
} from '@/hooks/useGuideState';
import { isAvailableInChapter, isMissableLeavingChapter } from '@/services/availability';

export default function ChapterDetailPage() {
  const { chapterId = '' } = useParams();
  const chapter = getChapter(chapterId);
  const settings = useSettings();
  const [incompleteOverride, setIncompleteOverride] = useState<boolean | null>(null);
  const incompleteOnly = incompleteOverride ?? settings.hideCompletedByDefault;
  const [confirm, setConfirm] = useState<'complete' | 'reset' | null>(null);
  const missionStates = useAllMissionState();
  const entityStates = useAllEntityState();
  const treasureStates = useAllTreasureState();
  const mState = useMemo(() => new Map(missionStates.map((s) => [s.missionId, s])), [missionStates]);
  const eState = useMemo(
    () => new Map(entityStates.map((s) => [`${s.entityType}:${s.entityId}`, s])),
    [entityStates],
  );

  if (!chapter) {
    return (
      <main className="page">
        <EmptyState title="Chapter not found" />
      </main>
    );
  }

  const story = missionsForChapter(chapterId).filter((m) => m.tags.includes('main-story'));
  const optional = missionsForChapter(chapterId).filter((m) => !m.tags.includes('main-story'));
  const camp = activities.filter((a) => isAvailableInChapter(a.availability, chapterId));
  const items = itemRequests.filter((a) => isAvailableInChapter(a.availability, chapterId));
  const tre = treasures.filter((t) => isAvailableInChapter(t.availability, chapterId));
  const leaving: { id: string; title: string }[] = [
    ...missionsForChapter(chapterId)
      .filter((m) => m.missable || isMissableLeavingChapter(m.availability, chapterId))
      .map((m) => ({ id: m.id, title: m.title })),
    ...camp
      .filter((a) => isMissableLeavingChapter(a.availability, chapterId))
      .map((a) => ({ id: a.id, title: a.title })),
    ...items
      .filter((a) => isMissableLeavingChapter(a.availability, chapterId))
      .map((a) => ({ id: a.id, title: a.title })),
  ];

  const visible = (completed: boolean) => !incompleteOnly || !completed;

  return (
    <main className="page stack">
      <p>
        <Link to="/journey">← Journey</Link>
      </p>
      <h1>
        {chapter.title} — {chapter.subtitle}
      </h1>
      {chapter.description ? <p>{chapter.description}</p> : null}
      <Checkbox
        checked={incompleteOnly}
        onChange={setIncompleteOverride}
        label="Show incomplete only"
        confirmUncheck={false}
      />

      <section>
        <SectionHeader title="Story" />
        {story.filter((m) => visible(Boolean(mState.get(m.id)?.completed))).map((m) => (
          <MissionCard
            key={m.id}
            mission={m}
            state={mState.get(m.id)}
            compact
            onToggleComplete={(c) => void putMissionState({ missionId: m.id, completed: c })}
          />
        ))}
      </section>

      <section>
        <SectionHeader title="Optional" />
        {optional.filter((m) => visible(Boolean(mState.get(m.id)?.completed))).map((m) => (
          <MissionCard
            key={m.id}
            mission={m}
            state={mState.get(m.id)}
            compact
            onToggleComplete={(c) => void putMissionState({ missionId: m.id, completed: c })}
          />
        ))}
      </section>

      <section>
        <SectionHeader title="Camp / companion activities" />
        {camp.filter((a) => visible(Boolean(eState.get(`activity:${a.id}`)?.completed))).map((a) => (
          <Checkbox
            key={a.id}
            checked={Boolean(eState.get(`activity:${a.id}`)?.completed)}
            onChange={(c) =>
              void putEntityState({ entityType: 'activity', entityId: a.id, completed: c })
            }
            label={a.title}
          />
        ))}
      </section>

      <section>
        <SectionHeader title="Item requests" />
        {items.filter((a) => visible(Boolean(eState.get(`itemRequest:${a.id}`)?.completed))).map((a) => (
          <Checkbox
            key={a.id}
            checked={Boolean(eState.get(`itemRequest:${a.id}`)?.completed)}
            onChange={(c) =>
              void putEntityState({ entityType: 'itemRequest', entityId: a.id, completed: c })
            }
            label={a.title}
          />
        ))}
      </section>

      <section>
        <SectionHeader title="Treasures" />
        {tre.map((t) => {
          const st = treasureStates.find((s) => s.chainId === t.id);
          const n = st?.stepsCompleted.length ?? 0;
          if (incompleteOnly && st?.completed) return null;
          return (
            <p key={t.id}>
              <Link to={`/treasures/${t.id}`}>{t.name}</Link> — {n} / {t.steps.length} steps
            </p>
          );
        })}
      </section>

      <section className="journal-panel" style={{ padding: 12 }}>
        <h2>Before leaving this chapter</h2>
        <p>What should I finish before I move on?</p>
        {leaving.length ? (
          <ul>
            {leaving.map((item) => (
              <li key={item.id}>⚠ {item.title}</li>
            ))}
          </ul>
        ) : (
          <p>No chapter-cutoff items are recorded for this chapter yet.</p>
        )}
      </section>

      <div className="row">
        <button type="button" onClick={() => setConfirm('complete')}>
          Mark chapter items complete
        </button>
        <button type="button" onClick={() => setConfirm('reset')}>
          Reset chapter progress
        </button>
      </div>

      <ConfirmDialog
        open={confirm !== null}
        title="Bulk chapter action"
        body="This updates every listed mission in this chapter on this device."
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          const all = missionsForChapter(chapterId);
          for (const m of all) {
            void putMissionState({
              missionId: m.id,
              completed: confirm === 'complete',
              objectivesCompleted: confirm === 'reset' ? [] : m.objectives?.map((o) => o.id) ?? [],
            });
          }
          setConfirm(null);
        }}
      />
    </main>
  );
}
