import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { getChapter, getLocation, getMission } from '@/data';
import { EmptyState } from '@/components/EmptyState';
import { MissionTagBadge } from '@/components/MissionTag';
import { ResearchStatusBadge } from '@/components/ResearchStatusBadge';
import { Checkbox } from '@/components/Checkbox';
import { AvailabilityPanel } from '@/components/AvailabilityPanel';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { SourceAttribution } from '@/components/SourceAttribution';
import { GameMap } from '@/components/GameMap';
import {
  putMissionState,
  setFavorite,
  useIsFavorite,
  useMissionState,
} from '@/hooks/useGuideState';
import { derivedMarkers } from '@/services/content';

export default function MissionDetailPage() {
  const { missionId = '' } = useParams();
  const mission = getMission(missionId);
  const state = useMissionState(missionId);
  const fav = useIsFavorite('mission', missionId);
  const [confirm, setConfirm] = useState<'reset' | 'gold' | 'all' | null>(null);
  const loc = mission?.startLocationId ? getLocation(mission.startLocationId) : undefined;
  const chapter = mission ? getChapter(mission.chapterId) : undefined;
  const previewMarkers = useMemo(
    () => derivedMarkers().filter((m) => m.missionId === missionId),
    [missionId],
  );

  if (!mission || !state) {
    return (
      <main className="page">
        <EmptyState title="Mission not found" body="This entry is not in the local dataset." />
      </main>
    );
  }

  const toggleList = (field: 'objectivesCompleted' | 'goldRequirementsCompleted' | 'missablesObtained', id: string) => {
    const cur = new Set(state[field]);
    if (cur.has(id)) cur.delete(id);
    else cur.add(id);
    void putMissionState({ missionId, [field]: [...cur] });
  };

  return (
    <main className="page stack">
      <p>
        <Link to="/journey">← Journey</Link>
        {chapter ? (
          <>
            {' · '}
            <Link to={`/journey/chapter/${chapter.id}`}>{chapter.title}</Link>
          </>
        ) : null}
      </p>
      <header className="journal-panel" style={{ padding: 16 }}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h1>{mission.title}</h1>
          <button type="button" onClick={() => void setFavorite('mission', missionId, !fav)} aria-pressed={fav}>
            {fav ? '★ Saved' : '☆ Save'}
          </button>
        </div>
        <div className="row">
          {mission.tags.map((t) => (
            <MissionTagBadge key={t} tag={t} />
          ))}
          <ResearchStatusBadge status={mission.research.verificationStatus} />
        </div>
        {mission.questGiver ? <p>Quest giver: {mission.questGiver}</p> : null}
        {loc ? <p>Starts at {loc.name}{loc.region ? `, ${loc.region}` : ''}</p> : null}
        {mission.missable && mission.missableWarning ? (
          <p className="stamp">⚠ {mission.missableWarning}</p>
        ) : null}
        <Checkbox
          checked={state.completed}
          onChange={(c) => void putMissionState({ missionId, completed: c, completedAt: c ? new Date().toISOString() : undefined })}
          label={state.completed ? 'Mission complete' : 'Mark mission complete'}
        />
      </header>

      <AvailabilityPanel availability={mission.availability} />

      {mission.summary ? (
        <section>
          <h2>Overview</h2>
          <p>{mission.summary}</p>
        </section>
      ) : (
        <p style={{ color: 'var(--ink-muted)' }}>Detailed overview has not been researched yet.</p>
      )}

      {loc?.coordinate ? (
        <section className="stack">
          <h2>Starting location</h2>
          <p>
            {loc.name}
            {loc.region ? ` · ${loc.region}` : ''}
          </p>
          <GameMap markers={previewMarkers} staticPreview height={180} center={loc.coordinate} />
          <Link to={`/map?marker=marker-mission-${mission.id}`}>Show on Map</Link>
        </section>
      ) : null}

      {mission.objectives?.length ? (
        <section>
          <h2>Objectives</h2>
          {mission.objectives.map((o) => (
            <Checkbox
              key={o.id}
              checked={state.objectivesCompleted.includes(o.id)}
              onChange={() => toggleList('objectivesCompleted', o.id)}
              label={o.label}
            />
          ))}
        </section>
      ) : null}

      {mission.goldRequirements?.length ? (
        <section>
          <h2>
            Gold Medal ({state.goldRequirementsCompleted.length} / {mission.goldRequirements.length} requirements)
          </h2>
          <p style={{ color: 'var(--ink-muted)' }}>Independent of story completion. Replay later if you need to.</p>
          {mission.goldRequirements.map((o) => (
            <Checkbox
              key={o.id}
              checked={state.goldRequirementsCompleted.includes(o.id)}
              onChange={() => toggleList('goldRequirementsCompleted', o.id)}
              label={o.label}
            />
          ))}
        </section>
      ) : null}

      {mission.missables?.length ? (
        <section>
          <h2>Missables</h2>
          {mission.missables.map((o) => (
            <Checkbox
              key={o.id}
              checked={state.missablesObtained.includes(o.id)}
              onChange={() => toggleList('missablesObtained', o.id)}
              label={o.label}
              description={o.description ?? o.warning}
            />
          ))}
        </section>
      ) : null}

      <section>
        <h2>Notes</h2>
        <textarea
          aria-label="Private notes"
          defaultValue={state.notes ?? ''}
          onBlur={(e) => void putMissionState({ missionId, notes: e.target.value })}
          rows={4}
          style={{ width: '100%' }}
        />
      </section>

      <div className="row">
        <button type="button" onClick={() => setConfirm('reset')}>
          Reset mission checklist
        </button>
        <button type="button" onClick={() => setConfirm('gold')}>
          Reset Gold Medal checklist
        </button>
        <button type="button" onClick={() => setConfirm('all')}>
          Reset mission progress
        </button>
      </div>

      <SourceAttribution
        sourceIds={mission.sourceIds}
        extra={[
          mission.research,
          ...(mission.objectives?.map((o) => o.research) ?? []),
          ...(mission.goldRequirements?.map((o) => o.research) ?? []),
          ...(mission.missables?.map((o) => o.research) ?? []),
        ]}
      />

      <ConfirmDialog
        open={confirm !== null}
        title="Reset progress?"
        body="This only clears your local checklist for this mission."
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm === 'reset') void putMissionState({ missionId, objectivesCompleted: [] });
          if (confirm === 'gold') void putMissionState({ missionId, goldRequirementsCompleted: [] });
          if (confirm === 'all') {
            void putMissionState({
              missionId,
              completed: false,
              objectivesCompleted: [],
              goldRequirementsCompleted: [],
              missablesObtained: [],
              notes: '',
            });
          }
          setConfirm(null);
        }}
      />
    </main>
  );
}
