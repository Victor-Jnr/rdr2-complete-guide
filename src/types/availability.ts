import type { ResearchMetadata } from './research';

export type PlatformId = 'pc' | 'ps4' | 'ps5' | 'xbox-one' | 'xbox-series';
export type EditionId = 'standard' | 'special' | 'ultimate';

export type AvailabilityRequirement =
  | { kind: 'honor'; minimum?: number; maximum?: number; description?: string }
  | { kind: 'time-of-day'; window: string; description?: string }
  | { kind: 'weather'; description: string }
  | { kind: 'item-owned'; itemId?: string; description: string }
  | { kind: 'story-flag'; flag: string; description: string }
  | { kind: 'online-only' }
  | { kind: 'other'; description: string };

export interface Availability {
  displayChapterId: string;
  availableChapterIds?: string[];
  earliestChapterId?: string;
  latestChapterId?: string;
  earliestMissionId?: string;
  latestMissionId?: string;
  missableAfterMissionId?: string;
  platforms?: PlatformId[];
  editions?: EditionId[];
  preorderOnly?: boolean;
  requirements?: AvailabilityRequirement[];
  notes?: string;
  research?: ResearchMetadata;
}
