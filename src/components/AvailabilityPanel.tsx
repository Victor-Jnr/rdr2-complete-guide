import type { Availability, AvailabilityRequirement } from '@/types';
import { editionLabel, platformLabel } from '@/services/availability';
import { getChapter, getMission } from '@/data';

export function AvailabilityPanel({ availability }: { availability: Availability }) {
  const display = getChapter(availability.displayChapterId);
  const earliest = availability.earliestChapterId
    ? getChapter(availability.earliestChapterId)
    : undefined;
  const latest = availability.latestChapterId
    ? getChapter(availability.latestChapterId)
    : undefined;
  const platforms = platformLabel(availability.platforms);
  const editions = editionLabel(availability.editions);
  const after = availability.missableAfterMissionId
    ? getMission(availability.missableAfterMissionId)
    : undefined;

  return (
    <section className="journal-panel" style={{ padding: 12 }}>
      <h2 style={{ fontSize: '1rem' }}>Availability</h2>
      <dl>
        {display ? (
          <>
            <dt>Listed in</dt>
            <dd>{display.title}{display.subtitle ? ` — ${display.subtitle}` : ''}</dd>
          </>
        ) : null}
        {earliest ? (
          <>
            <dt>Earliest</dt>
            <dd>{earliest.title}</dd>
          </>
        ) : null}
        {latest ? (
          <>
            <dt>Latest safe chapter</dt>
            <dd>{latest.title}</dd>
          </>
        ) : null}
        {after ? (
          <>
            <dt>Missable after</dt>
            <dd>{after.title}</dd>
          </>
        ) : null}
        {platforms ? (
          <>
            <dt>Platforms</dt>
            <dd>{platforms}</dd>
          </>
        ) : null}
        {editions ? (
          <>
            <dt>Editions</dt>
            <dd>{editions}</dd>
          </>
        ) : null}
        {availability.preorderOnly ? (
          <>
            <dt>Restriction</dt>
            <dd>Pre-order exclusive</dd>
          </>
        ) : null}
        {availability.requirements?.map((r: AvailabilityRequirement, i: number) => (
          <div key={i}>
            <dt>{r.kind}</dt>
            <dd>{'description' in r ? r.description : r.kind === 'time-of-day' ? r.window : r.kind}</dd>
          </div>
        ))}
        {availability.notes ? (
          <>
            <dt>Notes</dt>
            <dd>{availability.notes}</dd>
          </>
        ) : null}
      </dl>
    </section>
  );
}
