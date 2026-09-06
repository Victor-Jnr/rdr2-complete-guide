import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { GameMap } from '@/components/GameMap';
import { MapFilters } from '@/components/MapFilters';
import { derivedMarkers } from '@/services/content';
import type { MarkerType } from '@/types';

export default function MapPage() {
  const [params] = useSearchParams();
  const focusId = params.get('marker') ?? undefined;
  const [type, setType] = useState<MarkerType | 'all'>('all');
  const [selected, setSelected] = useState<string | undefined>(focusId);
  const all = useMemo(() => derivedMarkers(), []);
  const markers = useMemo(() => {
    const focused = all.find((m) => m.id === focusId);
    return all.filter((m) => {
      if (type !== 'all' && m.type !== type && m.id !== focusId) return false;
      if (focused && type !== 'all' && focused.type !== type) {
        return m.id === focusId || m.type === type;
      }
      return true;
    });
  }, [all, type, focusId]);

  const height = typeof window === 'undefined' ? 520 : Math.max(520, window.innerHeight - 200);

  return (
    <main className="page stack">
      <h1>Map</h1>
      <MapFilters
        type={type}
        onType={(t) => {
          setType(t);
        }}
      />
      <GameMap
        markers={markers}
        focusId={focusId}
        selectedId={selected}
        onSelect={(m) => setSelected(m.id)}
        height={height}
      />
    </main>
  );
}
