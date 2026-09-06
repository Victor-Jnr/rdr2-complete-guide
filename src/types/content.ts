import type { Availability } from './availability';
import type { ResearchMetadata } from './research';

export interface Chapter {
  id: string;
  order: number;
  title: string;
  subtitle?: string;
  region?: string;
  description?: string;
  research?: ResearchMetadata;
}

export type MissionTag =
  | 'main-story'
  | 'optional-story'
  | 'honor'
  | 'stranger'
  | 'companion-activity'
  | 'camp-activity'
  | 'debt-collection'
  | 'robbery'
  | 'item-request'
  | 'missable'
  | 'treasure-opportunity'
  | 'other-optional';

export interface ChecklistItem {
  id: string;
  label: string;
  description?: string;
  research?: ResearchMetadata;
}

export interface MissableReference {
  id: string;
  missableId?: string;
  label: string;
  description?: string;
  warning?: string;
  research?: ResearchMetadata;
}

export interface Mission {
  id: string;
  slug: string;
  title: string;
  chapterId: string;
  order: number;
  tags: MissionTag[];
  questGiver?: string;
  startLocationId?: string;
  prerequisiteMissionIds?: string[];
  followUpMissionIds?: string[];
  summary?: string;
  availability: Availability;
  missable?: boolean;
  missableWarning?: string;
  objectives?: ChecklistItem[];
  goldRequirements?: ChecklistItem[];
  missables?: MissableReference[];
  sourceIds?: string[];
  research: ResearchMetadata;
}

export interface MapCoordinate {
  /** Normalized 0–1, origin top-left, x right, y down. Independent of map pixel size. */
  x: number;
  y: number;
}

export interface Location {
  id: string;
  name: string;
  region?: string;
  coordinate?: MapCoordinate;
  sourceIds?: string[];
  research?: ResearchMetadata;
}

export type MarkerType =
  | 'mission-start'
  | 'stranger'
  | 'camp-activity'
  | 'treasure-map'
  | 'treasure-clue'
  | 'final-treasure'
  | 'missable'
  | 'robbery'
  | 'item-request'
  | 'unique-item'
  | 'other';

export interface MapMarker {
  id: string;
  type: MarkerType;
  title: string;
  subtitle?: string;
  locationId?: string;
  x: number;
  y: number;
  missionId?: string;
  treasureId?: string;
  treasureStepId?: string;
  chapterIds?: string[];
  tags?: string[];
}

export type TreasureStepType = 'map-pickup' | 'clue' | 'next-map' | 'treasure' | 'reward';

export interface TreasureStep {
  id: string;
  order: number;
  title: string;
  type: TreasureStepType;
  locationId?: string;
  description?: string;
  reward?: string;
  research?: ResearchMetadata;
}

export interface TreasureChain {
  id: string;
  name: string;
  description?: string;
  missable?: boolean;
  availability: Availability;
  steps: TreasureStep[];
  sourceIds?: string[];
  research: ResearchMetadata;
}

export interface Activity {
  id: string;
  title: string;
  kind: 'camp' | 'companion' | 'other';
  companion?: string;
  availability: Availability;
  locationId?: string;
  description?: string;
  sourceIds?: string[];
  research: ResearchMetadata;
}

export interface ItemRequest {
  id: string;
  title: string;
  requester?: string;
  availability: Availability;
  locationId?: string;
  description?: string;
  sourceIds?: string[];
  research: ResearchMetadata;
}

export interface Missable {
  id: string;
  title: string;
  category?: string;
  availability: Availability;
  locationId?: string;
  description?: string;
  relatedMissionIds?: string[];
  sourceIds?: string[];
  research: ResearchMetadata;
}

export interface MapManifest {
  width: number;
  height: number;
  tileSize: number;
  maxNativeZoom: number;
  tileUrlTemplate: string;
  previewUrl: string;
  sourceFileUrl?: string;
  attribution: string;
}

