import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { Checkbox } from '@/components/Checkbox';
import { EmptyState } from '@/components/EmptyState';
import { GameMap } from '@/components/GameMap';
import { ResearchStatusBadge } from '@/components/ResearchStatusBadge';
import { SourceAttribution } from '@/components/SourceAttribution';
import { getCompendium, locationsById, regionsById } from '@/data';
import { putEntityState, setFavorite, useEntityState, useIsFavorite } from '@/hooks/useGuideState';
import { markersForCompendium } from '@/services/content';
import { locationIdForNamedPlace, markLabelForKind } from '@/services/compendium';

export default function CompendiumEntryPage() {
  const { entryId = '' } = useParams();
  const entry = getCompendium(entryId);
  const entity = useEntityState('compendium', entryId);
  const fav = useIsFavorite('compendium', entryId);
  const markers = useMemo(() => (entry ? markersForCompendium(entry.id) : []), [entry]);
  const [draftNotes, setDraftNotes] = useState<string | null>(null);
  const notes = draftNotes ?? entity?.notes ?? '';

  useEffect(() => {
    if (!entry || draftNotes === null) return;
    if (draftNotes === (entity?.notes ?? '')) return;
    const timer = window.setTimeout(() => {
      void putEntityState({
        entityType: 'compendium',
        entityId: entry.id,
        completed: entity?.completed ?? false,
        completedAt: entity?.completedAt,
        notes: draftNotes,
      });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [entry, draftNotes, entity?.completed, entity?.completedAt, entity?.notes]);

  if (!entry) {
    return (
      <main className="page">
        <EmptyState title="Entry not found" body="This Compendium row is not in the local dataset." />
      </main>
    );
  }

  const loc = entry.generalLocation;
  const completed = Boolean(entity?.completed);

  return (
    <main className="page stack">
      <p>
        <Link to={`/compendium?kind=${entry.kind}`}>← Compendium</Link>
      </p>
      <header className="journal-panel" style={{ padding: 16 }}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h1>{entry.title}</h1>
          <button type="button" onClick={() => void setFavorite('compendium', entry.id, !fav)} aria-pressed={fav}>
            {fav ? '★ Saved' : '☆ Save'}
          </button>
        </div>
        <div className="row">
          {entry.familyTitle ? <span style={{ color: 'var(--ink-muted)' }}>{entry.familyTitle}</span> : null}
          <ResearchStatusBadge status={entry.research.verificationStatus} />
        </div>
        {entry.description ? <p>{entry.description}</p> : null}
        <Checkbox
          checked={completed}
          onChange={(next) =>
            void putEntityState({
              entityType: 'compendium',
              entityId: entry.id,
              completed: next,
              completedAt: next ? new Date().toISOString() : undefined,
              notes,
            })
          }
          label={markLabelForKind(entry.kind)}
        />
      </header>

      <section>
        <h2>General location</h2>
        {!loc ? (
          <p style={{ color: 'var(--ink-muted)' }}>No location info researched yet.</p>
        ) : (
          <>
            {loc.regionIds.length ? (
              <div className="row">
                {loc.regionIds.map((id) => {
                  const region = regionsById.get(id);
                  return region ? (
                    <Link key={id} to={`/compendium?kind=${entry.kind}&region=${id}`}>
                      {region.name}
                    </Link>
                  ) : null;
                })}
              </div>
            ) : null}
            {loc.summary ? <p>{loc.summary}</p> : null}
            {loc.namedPlaces.length ? (
              <p>
                {loc.namedPlaces.map((name, i) => {
                  const id = locationIdForNamedPlace(name, loc.locationIds, locationsById);
                  return (
                    <span key={`${name}-${i}`}>
                      {i ? ', ' : ''}
                      {id ? <Link to={`/locations/${id}`}>{name}</Link> : name}
                    </span>
                  );
                })}
              </p>
            ) : null}
          </>
        )}
      </section>

      {markers.length ? (
        <section>
          <h2>Map</h2>
          <GameMap
            markers={markers}
            center={{ x: markers[0]!.x, y: markers[0]!.y }}
            height={220}
            collectedIds={completed ? new Set(markers.map((m) => m.id)) : undefined}
          />
          <p>
            <Link to={`/map?compendium=${entry.id}`}>Show on Map</Link>
          </p>
        </section>
      ) : null}

      <section>
        <h2>Notes</h2>
        <textarea
          aria-label="Private notes"
          value={notes}
          onChange={(e) => setDraftNotes(e.target.value)}
          rows={4}
          style={{ width: '100%' }}
        />
      </section>

      <SourceAttribution sourceIds={entry.sourceIds} extra={[entry.research, loc?.research]} />
    </main>
  );
}
