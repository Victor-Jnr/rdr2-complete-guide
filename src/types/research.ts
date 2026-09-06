export type VerificationStatus =
  | 'unresearched'
  | 'researched'
  | 'cross-checked'
  | 'verified'
  | 'needs-review';

export interface ResearchMetadata {
  verificationStatus: VerificationStatus;
  sourceIds: string[];
  lastReviewedAt?: string;
}
