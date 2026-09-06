import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { getLocation, getTreasure } from '@/data';
import { EmptyState } from '@/components/EmptyState';
import { Checkbox } from '@/components/Checkbox';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { SourceAttribution } from '@/components/SourceAttribution';
import { AvailabilityPanel } from '@/components/AvailabilityPanel';
import {
  putTreasureState,
  setFavorite,
  useIsFavorite,
  useTreasureState,
} from '@/hooks/useGuideState';

export default function TreasureDetailPage() {
  const { treasureId = '' } = useParams();
  const chain = getTreasure(treasureId);
  const state = useTreasureState(treasureId);
  const fav = useIsFavorite('treasure', treasureId);
  const [confirm, setConfirm] = useState(false);

  if (!chain || !state) {
    return (
      <main className="page">
        <EmptyState title="Treasure not found" />
      </main>
    );
  }

  const toggle = (stepId: string) => {
    const set = new Set<string>(state.stepsCompleted);
    if (set.has(stepId)) set.delete(stepId);
    else set.add(stepId);
    const stepsCompleted = [...set];
    void putTreasureState({
      chainId: treasureId,
      stepsCompleted,
      completed: stepsCompleted.length === chain.steps.length,
    });
  };

  return (
    <main className="page stack">
      <p>
        <Link to="/treasures">← Treasures</Link>
      </p>
      <header className="journal-panel" style={{ padding: 16 }}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h1>{chain.name}</h1>
          <button type="button" onClick={() => void setFavorite('treasure', treasureId, !fav)}>
            {fav ? '★ Saved' : '☆ Save'}
          </button>
        </div>
        <p>
          {state.stepsCompleted.length} / {chain.steps.length} steps complete
        </p>
        {chain.description ? <p>{chain.description}</p> : null}
      </header>
      <AvailabilityPanel availability={chain.availability} />
      {state.completed ? <EmptyState title="Treasure chain completed" body="You can still review steps or reset." /> : null}
      {chain.steps.map((step) => {
        const loc = step.locationId ? getLocation(step.locationId) : undefined;
        return (
          <article key={step.id} className="journal-panel" style={{ padding: 12 }}>
            <Checkbox
              checked={state.stepsCompleted.includes(step.id)}
              onChange={() => toggle(step.id)}
              label={`${step.order}. ${step.title}`}
              description={step.description}
            />
            {loc ? (
              <p>
                {loc.name}
                <br />
                <Link to={`/map?marker=marker-treasure-${chain.id}-${step.id}`}>Show on Map</Link>
              </p>
            ) : (
              <p style={{ color: 'var(--ink-muted)' }}>No verified map pin yet</p>
            )}
          </article>
        );
      })}
      <section>
        <h2>Notes</h2>
        <textarea
          aria-label="Private notes"
          defaultValue={state.notes ?? ''}
          onBlur={(e) => void putTreasureState({ chainId: treasureId, notes: e.target.value })}
          rows={3}
          style={{ width: '100%' }}
        />
      </section>
      <button type="button" onClick={() => setConfirm(true)}>
        Reset treasure progress
      </button>
      <SourceAttribution
        sourceIds={chain.sourceIds}
        extra={[chain.research, ...chain.steps.map((s) => s.research).filter(Boolean)]}
      />
      <ConfirmDialog
        open={confirm}
        title="Reset this chain?"
        body="Step checkboxes for this treasure will be cleared."
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          void putTreasureState({ chainId: treasureId, stepsCompleted: [], completed: false });
          setConfirm(false);
        }}
      />
    </main>
  );
}
