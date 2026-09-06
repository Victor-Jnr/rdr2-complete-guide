import type { MissionTag } from '@/types';

const labels: Record<MissionTag, string> = {
  'main-story': 'Main Story',
  'optional-story': 'Optional Story',
  honor: 'Honor',
  stranger: 'Stranger',
  'companion-activity': 'Companion',
  'camp-activity': 'Camp',
  'debt-collection': 'Debt',
  robbery: 'Robbery',
  'item-request': 'Item Request',
  missable: 'Missable',
  'treasure-opportunity': 'Treasure',
  'other-optional': 'Optional',
};

export function MissionTagBadge({ tag }: { tag: MissionTag }) {
  const missable = tag === 'missable';
  return (
    <span
      className={missable ? 'stamp' : undefined}
      style={
        missable
          ? undefined
          : {
              border: '1px solid var(--rule)',
              padding: '0.1rem 0.4rem',
              fontSize: '0.75rem',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }
      }
    >
      {missable ? '⚠ Missable' : labels[tag]}
    </span>
  );
}
