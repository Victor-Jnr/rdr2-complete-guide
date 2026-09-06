import type { VerificationStatus } from '@/types';

const labels: Record<VerificationStatus, string> = {
  unresearched: 'Needs research',
  researched: 'Researched',
  'cross-checked': 'Cross-checked',
  verified: 'Verified',
  'needs-review': 'Needs review',
};

export function ResearchStatusBadge({ status }: { status: VerificationStatus }) {
  if (status === 'cross-checked' || status === 'verified') return null;
  return (
    <span style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>{labels[status]}</span>
  );
}
