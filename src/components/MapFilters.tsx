import { FilterChips } from './FilterChips';
import type { MarkerType } from '@/types';

const types: { id: MarkerType | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'mission-start', label: 'Missions' },
  { id: 'stranger', label: 'Stranger' },
  { id: 'treasure-map', label: 'Maps' },
  { id: 'treasure-clue', label: 'Clues' },
  { id: 'final-treasure', label: 'Treasure' },
  { id: 'missable', label: 'Missable' },
];

export function MapFilters({
  type,
  onType,
}: {
  type: MarkerType | 'all';
  onType: (t: MarkerType | 'all') => void;
}) {
  return (
    <FilterChips
      ariaLabel="Marker filters"
      chips={types}
      value={type}
      onChange={(id) => onType(id as MarkerType | 'all')}
    />
  );
}
