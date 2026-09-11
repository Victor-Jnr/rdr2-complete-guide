import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { EmptyState } from '@/components/EmptyState';
import { searchGuide, SEARCH_GROUP_ORDER, type SearchKind } from '@/services/search';

const labels: Record<SearchKind, string> = {
  mission: 'Missions',
  treasure: 'Treasures',
  location: 'Locations',
  missable: 'Missables',
  activity: 'Activities',
  'item-request': 'Item requests',
  collectible: 'Collectibles',
  challenge: 'Challenges',
  compendium: 'Compendium',
  chapter: 'Chapters',
};

export default function SearchPage() {
  const [q, setQ] = useState('');
  const results = useMemo(() => searchGuide(q), [q]);
  const grouped = SEARCH_GROUP_ORDER.map((kind) => ({
    kind,
    items: results.filter((r) => r.kind === kind),
  })).filter((g) => g.items.length);

  return (
    <main className="page stack">
      <h1>Search</h1>
      <label className="search-field">
        <span className="sr-only">Search the guide</span>
        <input
          type="search"
          inputMode="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Missions, treasures, places…"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="search"
        />
      </label>
      {!q ? <p style={{ color: 'var(--ink-muted)' }}>Search works fully offline.</p> : null}
      {q && !results.length ? <EmptyState title="No search results" body="Try a shorter name or a location." /> : null}
      {grouped.map((g) => (
        <section key={g.kind}>
          <h2>{labels[g.kind]}</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {g.items.map((hit) => (
              <li key={hit.id} style={{ minHeight: 44 }}>
                <Link to={hit.href}>{hit.title}</Link>
                {hit.subtitle ? <div style={{ color: 'var(--ink-muted)' }}>{hit.subtitle}</div> : null}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
