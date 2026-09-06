import { Link } from 'react-router';
import { MissionTagBadge } from './MissionTag';
import { ResearchStatusBadge } from './ResearchStatusBadge';
import { Checkbox } from './Checkbox';
import type { Mission } from '@/types';
import type { UserMissionState } from '@/types';
import { getChapter, getLocation } from '@/data';

interface Props {
  mission: Mission;
  state?: UserMissionState;
  compact?: boolean;
  onToggleComplete?: (complete: boolean) => void;
}

export function MissionCard({ mission, state, compact, onToggleComplete }: Props) {
  const chapter = getChapter(mission.chapterId);
  const loc = mission.startLocationId ? getLocation(mission.startLocationId) : undefined;
  const incomplete =
    (mission.objectives?.length ?? 0) - (state?.objectivesCompleted.length ?? 0);
  const goldDone = state?.goldRequirementsCompleted.length ?? 0;
  const goldTotal = mission.goldRequirements?.length ?? 0;

  return (
    <article className="journal-panel" style={{ padding: 12 }}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <Link to={`/journey/${mission.id}`} style={{ color: 'inherit', textDecoration: 'none', flex: 1 }}>
          <h3 style={{ fontSize: '1.05rem' }}>{mission.title}</h3>
          <p style={{ color: 'var(--ink-muted)', margin: 0, fontSize: '0.9rem' }}>
            {chapter?.title}
            {chapter?.subtitle ? ` — ${chapter.subtitle}` : ''}
            {mission.questGiver ? ` · ${mission.questGiver}` : ''}
            {loc ? ` · ${loc.name}` : ''}
          </p>
        </Link>
        {onToggleComplete ? (
          <Checkbox
            checked={Boolean(state?.completed)}
            onChange={onToggleComplete}
            label={state?.completed ? 'Done' : 'Mark done'}
          />
        ) : null}
      </div>
      {!compact ? (
        <>
          <div className="row" style={{ marginTop: 8 }}>
            {mission.tags.map((t) => (
              <MissionTagBadge key={t} tag={t} />
            ))}
            <ResearchStatusBadge status={mission.research.verificationStatus} />
          </div>
          {mission.missable && mission.missableWarning ? (
            <p className="stamp" style={{ marginTop: 8 }}>
              ⚠ {mission.missableWarning}
            </p>
          ) : null}
          <p style={{ margin: '8px 0 0', color: 'var(--ink-muted)', fontSize: '0.85rem' }}>
            {incomplete > 0 ? `${incomplete} checklist items left` : 'Checklist clear'}
            {goldTotal > 0 ? ` · Gold ${goldDone}/${goldTotal}` : ''}
            {state?.favorite ? ' · Saved' : ''}
          </p>
        </>
      ) : (
        mission.missable ? <span className="stamp">⚠ Missable</span> : null
      )}
    </article>
  );
}
