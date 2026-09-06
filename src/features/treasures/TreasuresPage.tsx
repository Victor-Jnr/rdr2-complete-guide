import { Link, useSearchParams } from 'react-router';
import { treasures } from '@/data';
import { FilterChips } from '@/components/FilterChips';
import { SectionHeader } from '@/components/SectionHeader';
import { useAllTreasureState } from '@/hooks/useGuideState';
import { editionLabel, platformLabel } from '@/services/availability';

const chips = [
  { id: 'all', label: 'All' },
  { id: 'progress', label: 'In progress' },
  { id: 'completed', label: 'Completed' },
  { id: 'new', label: 'Not started' },
];

export default function TreasuresPage() {
  const [params, setParams] = useSearchParams();
  const filter = params.get('filter') ?? 'all';
  const states = useAllTreasureState();
  const byId = new Map(states.map((s) => [s.chainId, s]));

  return (
    <main className="page stack">
      <SectionHeader title="Treasures" />
      <FilterChips
        chips={chips}
        value={filter}
        onChange={(id) => {
          const next = new URLSearchParams(params);
          if (id === 'all') next.delete('filter');
          else next.set('filter', id);
          setParams(next, { replace: true });
        }}
      />
      {treasures.map((t) => {
        const st = byId.get(t.id);
        const n = st?.stepsCompleted.length ?? 0;
        const started = n > 0;
        const done = Boolean(st?.completed) || n === t.steps.length;
        if (filter === 'progress' && (!started || done)) return null;
        if (filter === 'completed' && !done) return null;
        if (filter === 'new' && started) return null;
        return (
          <article key={t.id} className="journal-panel" style={{ padding: 12 }}>
            <h2 style={{ fontSize: '1.1rem' }}>
              <Link to={`/treasures/${t.id}`}>{t.name}</Link>
            </h2>
            <p>
              {n} / {t.steps.length} steps complete
            </p>
            <p style={{ color: 'var(--ink-muted)' }}>
              {platformLabel(t.availability.platforms)}
              {editionLabel(t.availability.editions)
                ? ` · ${editionLabel(t.availability.editions)}`
                : ''}
              {t.availability.preorderOnly ? ' · Pre-order' : ''}
            </p>
          </article>
        );
      })}
    </main>
  );
}
