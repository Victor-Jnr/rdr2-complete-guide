import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Checkbox } from '@/components/Checkbox';
import { EmptyState } from '@/components/EmptyState';
import { FilterChips } from '@/components/FilterChips';
import { SearchField } from '@/components/SearchField';
import { SectionHeader } from '@/components/SectionHeader';
import { compendium, regions } from '@/data';
import { putEntityState, setFavorite, useAllEntityState, useFavorites } from '@/hooks/useGuideState';
import { pinCountsByCompendium } from '@/services/content';
import {
  COMPENDIUM_KIND_TABS,
  filterCompendiumEntries,
  groupCompendiumByFamily,
  markLabelForKind,
  parseKindParam,
  parseRegionParam,
} from '@/services/compendium';
import type { CompendiumEntry } from '@/types';
import styles from './CompendiumPage.module.css';

export default function CompendiumPage() {
  const [params, setParams] = useSearchParams();
  const kind = parseKindParam(params.get('kind'));
  const region = parseRegionParam(params.get('region'));
  const query = params.get('q') ?? '';
  const incompleteOnly = params.get('incomplete') === '1';
  const entityStates = useAllEntityState();
  const favorites = useFavorites();
  const completedIds = useMemo(
    () => new Set(entityStates.filter((s) => s.entityType === 'compendium' && s.completed).map((s) => s.entityId)),
    [entityStates],
  );
  const favSet = useMemo(
    () => new Set(favorites.filter((f) => f.entityType === 'compendium').map((f) => f.entityId)),
    [favorites],
  );
  const pinCounts = useMemo(() => pinCountsByCompendium(), []);
  const filtered = useMemo(
    () =>
      filterCompendiumEntries(compendium, {
        kind,
        region,
        query,
        incompleteOnly,
        completedIds,
      }),
    [kind, region, query, incompleteOnly, completedIds],
  );
  const groups =
    kind === 'animal' ? groupCompendiumByFamily(filtered) : [{ family: '', entries: filtered }];

  const set = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (!value) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const mark = (entry: CompendiumEntry, next: boolean) => {
    void putEntityState({
      entityType: 'compendium',
      entityId: entry.id,
      completed: next,
      completedAt: next ? new Date().toISOString() : undefined,
    });
  };

  return (
    <main className="page stack">
      <SectionHeader title="Compendium" aside={`${filtered.length} entries`} />
      <div className={styles.tabs}>
        <FilterChips
          ariaLabel="Compendium kind"
          chips={COMPENDIUM_KIND_TABS}
          value={kind}
          onChange={(id) => set('kind', id)}
        />
      </div>
      <FilterChips
        ariaLabel="Region"
        chips={[{ id: 'all', label: 'All regions' }, ...regions.map((r) => ({ id: r.id, label: r.name }))]}
        value={region ?? 'all'}
        onChange={(id) => set('region', id === 'all' ? null : id)}
      />
      <SearchField
        label="Search"
        value={query}
        onChange={(value) => set('q', value || null)}
        placeholder="Filter by name or place…"
      />
      <label className="row">
        <input
          type="checkbox"
          checked={incompleteOnly}
          onChange={(e) => set('incomplete', e.target.checked ? '1' : null)}
        />
        Show incomplete only
      </label>
      {!filtered.length ? (
        <EmptyState title="No matching entries" body="Try another region, kind, or a shorter name." />
      ) : null}
      {groups.map((group) => (
        <section key={group.family || 'list'}>
          {group.family ? <h2>{group.family}</h2> : null}
          {group.entries.map((entry) => {
            const done = completedIds.has(entry.id);
            const pins = pinCounts.get(entry.id) ?? 0;
            const regionNames = (entry.generalLocation?.regionIds ?? [])
              .map((id) => regions.find((r) => r.id === id)?.name)
              .filter(Boolean);
            return (
              <article key={entry.id} className={`journal-panel ${styles.item}`}>
                <div className={styles.main}>
                  <Link className={styles.title} to={`/compendium/${entry.id}`}>
                    <strong>{entry.title}</strong>
                  </Link>
                  <div className={styles.meta}>
                    {regionNames.length ? regionNames.join(' · ') : 'No regions listed'}
                    {pins ? ` · ${pins} pin${pins === 1 ? '' : 's'}` : ''}
                  </div>
                  <Checkbox
                    checked={done}
                    onChange={(next) => mark(entry, next)}
                    label={markLabelForKind(entry.kind)}
                  />
                </div>
                <div className={styles.actions}>
                  <button
                    type="button"
                    aria-pressed={favSet.has(entry.id)}
                    onClick={() => void setFavorite('compendium', entry.id, !favSet.has(entry.id))}
                  >
                    {favSet.has(entry.id) ? '★ Saved' : '☆ Save'}
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      ))}
    </main>
  );
}
