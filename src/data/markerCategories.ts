import type { ChecklistEntityType, MarkerType } from '@/types';

export type MarkerGroupId = 'collectibles' | 'wildlife' | 'places' | 'amenities' | 'journey';

export type MarkerMarkEntity = Extract<ChecklistEntityType, 'map-marker' | 'compendium'> | null;

export interface MarkerCategory {
  type: MarkerType;
  group: MarkerGroupId;
  label: string;
  icon: string;
  color: string;
  defaultOn: boolean;
  dense?: boolean;
  markEntity: MarkerMarkEntity;
  markLabel?: string;
}

export const MARKER_GROUPS: { id: MarkerGroupId; label: string }[] = [
  { id: 'collectibles', label: 'Collectibles' },
  { id: 'wildlife', label: 'Wildlife and Herbs' },
  { id: 'places', label: 'Places' },
  { id: 'amenities', label: 'Amenities' },
  { id: 'journey', label: 'Journey' },
];

export const MARKER_CATEGORIES: MarkerCategory[] = [
  { type: 'dinosaur-bone', group: 'collectibles', label: 'Dinosaur Bones', icon: 'Bone', color: '#c4a35a', defaultOn: true, markEntity: 'map-marker', markLabel: 'Mark found' },
  { type: 'dreamcatcher', group: 'collectibles', label: 'Dreamcatchers', icon: 'CircleDot', color: '#7eb8c9', defaultOn: true, markEntity: 'map-marker', markLabel: 'Mark found' },
  { type: 'rock-carving', group: 'collectibles', label: 'Rock Carvings', icon: 'Mountain', color: '#9a8b73', defaultOn: true, markEntity: 'map-marker', markLabel: 'Mark found' },
  { type: 'grave', group: 'collectibles', label: 'Graves', icon: 'Cross', color: '#b8a88a', defaultOn: true, markEntity: 'map-marker', markLabel: 'Mark found' },
  { type: 'point-of-interest', group: 'collectibles', label: 'Points of Interest', icon: 'Landmark', color: '#d4b36a', defaultOn: true, markEntity: 'map-marker', markLabel: 'Mark found' },
  { type: 'wilderness-chest', group: 'collectibles', label: 'Wilderness Chests', icon: 'Box', color: '#8a7038', defaultOn: true, markEntity: 'map-marker', markLabel: 'Mark found' },
  { type: 'orchid', group: 'collectibles', label: 'Orchids', icon: 'Flower2', color: '#c97eb0', defaultOn: true, markEntity: 'map-marker', markLabel: 'Mark collected' },
  { type: 'legendary-animal', group: 'wildlife', label: 'Legendary Animals', icon: 'PawPrint', color: '#c45a3a', defaultOn: true, markEntity: 'compendium', markLabel: 'Mark hunted' },
  { type: 'legendary-fish', group: 'wildlife', label: 'Legendary Fish', icon: 'Fish', color: '#3a7ec4', defaultOn: true, markEntity: 'compendium', markLabel: 'Mark caught' },
  { type: 'animal-habitat', group: 'wildlife', label: 'Animal habitats', icon: 'Trees', color: '#6a8f4e', defaultOn: false, dense: true, markEntity: 'compendium', markLabel: 'Mark studied' },
  { type: 'herb', group: 'wildlife', label: 'Herbs', icon: 'Leaf', color: '#4e8f6a', defaultOn: false, dense: true, markEntity: 'compendium', markLabel: 'Mark collected' },
  { type: 'town', group: 'places', label: 'Towns', icon: 'Building2', color: '#8b2e2e', defaultOn: true, markEntity: null },
  { type: 'gang-camp', group: 'places', label: 'Gang camps', icon: 'Tent', color: '#6b4a32', defaultOn: true, markEntity: null },
  { type: 'landmark', group: 'places', label: 'Landmarks', icon: 'MapPin', color: '#8a6a28', defaultOn: true, markEntity: null },
  { type: 'fast-travel', group: 'places', label: 'Fast travel', icon: 'Navigation', color: '#c4a35a', defaultOn: true, markEntity: null },
  { type: 'general-store', group: 'amenities', label: 'General stores', icon: 'Store', color: '#8a7038', defaultOn: true, markEntity: null },
  { type: 'gunsmith', group: 'amenities', label: 'Gunsmiths', icon: 'Crosshair', color: '#5c4a38', defaultOn: true, markEntity: null },
  { type: 'stable', group: 'amenities', label: 'Stables', icon: 'Warehouse', color: '#6b4a32', defaultOn: true, markEntity: null },
  { type: 'doctor', group: 'amenities', label: 'Doctors', icon: 'HeartPulse', color: '#8b2e2e', defaultOn: true, markEntity: null },
  { type: 'fence', group: 'amenities', label: 'Fences', icon: 'BrickWall', color: '#5c4a38', defaultOn: true, markEntity: null },
  { type: 'trapper', group: 'amenities', label: 'Trappers', icon: 'Footprints', color: '#6a8f4e', defaultOn: true, markEntity: null },
  { type: 'post-office', group: 'amenities', label: 'Post offices', icon: 'Mail', color: '#8a6a28', defaultOn: true, markEntity: null },
  { type: 'saloon', group: 'amenities', label: 'Saloons', icon: 'Beer', color: '#c4a35a', defaultOn: true, markEntity: null },
  { type: 'butcher', group: 'amenities', label: 'Butchers', icon: 'Beef', color: '#8b2e2e', defaultOn: true, markEntity: null },
  { type: 'barber', group: 'amenities', label: 'Barbers', icon: 'Scissors', color: '#7eb8c9', defaultOn: true, markEntity: null },
  { type: 'tailor', group: 'amenities', label: 'Tailors', icon: 'Shirt', color: '#9a8b73', defaultOn: true, markEntity: null },
  { type: 'photo-studio', group: 'amenities', label: 'Photo studios', icon: 'Camera', color: '#b8a88a', defaultOn: true, markEntity: null },
  { type: 'bait-shop', group: 'amenities', label: 'Bait shops', icon: 'Anchor', color: '#3a7ec4', defaultOn: true, markEntity: null },
  { type: 'mission-start', group: 'journey', label: 'Missions', icon: 'Scroll', color: '#8b2e2e', defaultOn: true, markEntity: null },
  { type: 'stranger', group: 'journey', label: 'Strangers', icon: 'User', color: '#c4a35a', defaultOn: true, markEntity: null },
  { type: 'camp-activity', group: 'journey', label: 'Camp activities', icon: 'Tent', color: '#6b4a32', defaultOn: true, markEntity: null },
  { type: 'treasure-map', group: 'journey', label: 'Treasure maps', icon: 'Map', color: '#d4b36a', defaultOn: true, markEntity: null },
  { type: 'treasure-clue', group: 'journey', label: 'Treasure clues', icon: 'Search', color: '#8a6a28', defaultOn: true, markEntity: null },
  { type: 'final-treasure', group: 'journey', label: 'Treasures', icon: 'Gem', color: '#c4a35a', defaultOn: true, markEntity: null },
  { type: 'missable', group: 'journey', label: 'Missables', icon: 'AlertTriangle', color: '#d45b4a', defaultOn: true, markEntity: null },
  { type: 'robbery', group: 'journey', label: 'Robberies', icon: 'Ban', color: '#8b2e2e', defaultOn: true, markEntity: null },
  { type: 'item-request', group: 'journey', label: 'Item requests', icon: 'Gift', color: '#8faf6a', defaultOn: true, markEntity: null },
  { type: 'unique-item', group: 'journey', label: 'Unique items', icon: 'Sparkles', color: '#c4a35a', defaultOn: true, markEntity: null },
  { type: 'other', group: 'journey', label: 'Other', icon: 'Circle', color: '#8a7038', defaultOn: true, markEntity: null },
];

export const MARKER_TYPES: MarkerType[] = MARKER_CATEGORIES.map((c) => c.type);

export const MARKER_CATEGORY_BY_TYPE = new Map(MARKER_CATEGORIES.map((c) => [c.type, c]));

export const DENSE_MARKER_TYPES = new Set(
  MARKER_CATEGORIES.filter((c) => c.dense).map((c) => c.type),
);

export const DEFAULT_HIDDEN_MARKER_TYPES: MarkerType[] = MARKER_CATEGORIES.filter((c) => !c.defaultOn).map(
  (c) => c.type,
);

export function isMarkerType(value: string): value is MarkerType {
  return MARKER_CATEGORY_BY_TYPE.has(value as MarkerType);
}

export function categoryFor(type: MarkerType): MarkerCategory | undefined {
  return MARKER_CATEGORY_BY_TYPE.get(type);
}
