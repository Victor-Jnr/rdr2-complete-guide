import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  Anchor,
  Ban,
  Beef,
  Beer,
  Bone,
  Box,
  BrickWall,
  Building2,
  Camera,
  Circle,
  CircleDot,
  Cross,
  Crosshair,
  Fish,
  Flower2,
  Footprints,
  Gem,
  Gift,
  HeartPulse,
  Landmark,
  Leaf,
  Mail,
  Map,
  MapPin,
  Mountain,
  Navigation,
  PawPrint,
  Scissors,
  Scroll,
  Search,
  Shirt,
  Sparkles,
  Store,
  Tent,
  Trees,
  User,
  Warehouse,
} from 'lucide-react';
import { MARKER_CATEGORIES, MARKER_GROUPS } from '@/data/markerCategories';
import type { MarkerType } from '@/types';
import styles from './MapLayerPanel.module.css';

const ICONS: Record<string, LucideIcon> = {
  AlertTriangle,
  Anchor,
  Ban,
  Beef,
  Beer,
  Bone,
  Box,
  BrickWall,
  Building2,
  Camera,
  Circle,
  CircleDot,
  Cross,
  Crosshair,
  Fish,
  Flower2,
  Footprints,
  Gem,
  Gift,
  HeartPulse,
  Landmark,
  Leaf,
  Mail,
  Map,
  MapPin,
  Mountain,
  Navigation,
  PawPrint,
  Scissors,
  Scroll,
  Search,
  Shirt,
  Sparkles,
  Store,
  Tent,
  Trees,
  User,
  Warehouse,
};

export function MapLayerPanel({
  open,
  visibleTypes,
  counts,
  query,
  hideCollected,
  onQuery,
  onToggleType,
  onShowAll,
  onHideAll,
  onHideCollected,
}: {
  open: boolean;
  visibleTypes: Set<MarkerType>;
  counts: Map<MarkerType, number>;
  query: string;
  hideCollected: boolean;
  onQuery: (q: string) => void;
  onToggleType: (type: MarkerType) => void;
  onShowAll: () => void;
  onHideAll: () => void;
  onHideCollected: (next: boolean) => void;
}) {
  if (!open) return null;

  return (
    <div className={styles.panel}>
      <input
        className={styles.search}
        type="search"
        placeholder="Search pins"
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        aria-label="Search map pins"
      />
      <div className={styles.actions}>
        <button type="button" onClick={onShowAll}>
          Show all
        </button>
        <button type="button" onClick={onHideAll}>
          Hide all
        </button>
        <button type="button" aria-pressed={hideCollected} onClick={() => onHideCollected(!hideCollected)}>
          Hide collected
        </button>
      </div>
      {MARKER_GROUPS.map((group) => {
        const cats = MARKER_CATEGORIES.filter((c) => c.group === group.id);
        return (
          <section key={group.id} className={styles.group}>
            <h3>{group.label}</h3>
            {cats.map((cat) => {
              const Icon = ICONS[cat.icon] ?? Circle;
              const on = visibleTypes.has(cat.type);
              return (
                <button
                  key={cat.type}
                  type="button"
                  className={styles.row}
                  aria-pressed={on}
                  onClick={() => onToggleType(cat.type)}
                >
                  <span className="row" style={{ gap: 8 }}>
                    <Icon size={16} color={cat.color} aria-hidden />
                    {cat.label}
                  </span>
                  <span className={styles.count}>{counts.get(cat.type) ?? 0}</span>
                </button>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
