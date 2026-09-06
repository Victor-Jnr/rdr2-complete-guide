import type { Availability } from './availability';
import type { ResearchMetadata } from './research';

export type CollectibleKind =
  | 'cigarette-card'
  | 'dinosaur-bone'
  | 'rock-carving'
  | 'dreamcatcher'
  | 'exotic'
  | 'hunting-request'
  | 'point-of-interest'
  | 'other';

export interface Collectible {
  id: string;
  setId?: string;
  kind: CollectibleKind;
  title: string;
  availability?: Availability;
  locationId?: string;
  sourceIds?: string[];
  research: ResearchMetadata;
}

export interface CollectibleSet {
  id: string;
  kind: CollectibleKind;
  title: string;
  collectibleIds: string[];
  research: ResearchMetadata;
}

export interface ChallengeRank {
  id: string;
  rank: number;
  description: string;
  research?: ResearchMetadata;
}

export interface Challenge {
  id: string;
  category: string;
  title: string;
  ranks: ChallengeRank[];
  sourceIds?: string[];
  research: ResearchMetadata;
}

export type CompendiumKind =
  | 'animal'
  | 'legendary-animal'
  | 'fish'
  | 'legendary-fish'
  | 'plant'
  | 'weapon'
  | 'horse'
  | 'equipment'
  | 'gang'
  | 'other';

export interface CompendiumEntry {
  id: string;
  kind: CompendiumKind;
  title: string;
  sourceIds?: string[];
  research: ResearchMetadata;
}

export interface CompletionRequirement {
  id: string;
  category: string;
  title: string;
  targetCount?: number;
  entityIds?: string[];
  countsToward100: boolean;
  platforms?: Availability['platforms'];
  editions?: Availability['editions'];
  sourceIds?: string[];
  research: ResearchMetadata;
}
