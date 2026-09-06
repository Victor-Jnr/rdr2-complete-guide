export type SourceType =
  | 'official'
  | 'wiki'
  | 'guide'
  | 'video'
  | 'gameplay-verification'
  | 'community'
  | 'other';

export interface SourceReference {
  id: string;
  sourceName: string;
  pageTitle?: string;
  url?: string;
  sourceType: SourceType;
  verificationStatus?:
    | 'unresearched'
    | 'researched'
    | 'cross-checked'
    | 'verified'
    | 'needs-review';
  accessedAt?: string;
  publicAttribution?: boolean;
  notes?: string;
}
