import { useMemo, useState } from 'react';
import { getSource } from '@/data';
import { ExternalLink } from './ExternalLink';
import type { ResearchMetadata } from '@/types';

interface Props {
  sourceIds?: string[];
  extra?: Array<ResearchMetadata | undefined>;
}

export function SourceAttribution({ sourceIds, extra }: Props) {
  const ids = useMemo(() => {
    const all = [...(sourceIds ?? []), ...(extra ?? []).flatMap((r) => r?.sourceIds ?? [])];
    return [...new Set(all)];
  }, [sourceIds, extra]);
  const sources = ids.map(getSource).filter((s) => s?.publicAttribution !== false);
  const [open, setOpen] = useState(sources.length <= 2);
  if (!sources.length) return null;

  return (
    <section style={{ marginTop: 24 }}>
      <hr className="ink-rule" />
      <button type="button" onClick={() => setOpen((v) => !v)} style={{ background: 'none', border: 0 }}>
        <h2 style={{ fontSize: '1rem' }}>
          Sources & Attribution{sources.length > 2 ? ` (${sources.length})` : ''}
        </h2>
      </button>
      {open ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {sources.map((s) =>
            s ? (
              <li key={s.id} style={{ marginBottom: 8 }}>
                <strong>{s.sourceName}</strong>
                {s.pageTitle ? <div>{s.pageTitle}</div> : null}
                {s.url ? <ExternalLink href={s.url}>↗ Open source</ExternalLink> : null}
              </li>
            ) : null,
          )}
        </ul>
      ) : null}
      <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem' }}>
        Reference information researched with help from the Red Dead Wiki. This project is independent
        and is not endorsed by Rockstar Games, Take-Two Interactive, Fandom, or the Red Dead Wiki.
      </p>
    </section>
  );
}
