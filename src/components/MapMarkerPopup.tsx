import { Link } from 'react-router';
import { getSource } from '@/data';
import { putEntityState, putMissionState, putTreasureState } from '@/db/repositories';
import { markerMarkAction, markerPopupLinks } from '@/services/mapPopup';
import type { MapMarker } from '@/types';

export function MapMarkerPopup({ marker, collected }: { marker: MapMarker; collected?: boolean }) {
  const links = markerPopupLinks(marker);
  const mark = markerMarkAction(marker);
  const source = marker.sourceIds?.[0] ? getSource(marker.sourceIds[0]) : undefined;

  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <strong>{marker.title}</strong>
      {marker.subtitle ? <div>{marker.subtitle}</div> : null}
      <div className="stack" style={{ marginTop: 8 }}>
        {links.map((l) => (
          <Link key={l.href + l.label} to={l.href}>
            {l.label}
          </Link>
        ))}
        {marker.missionId ? (
          <button
            type="button"
            onClick={() => void putMissionState({ missionId: marker.missionId!, completed: true })}
          >
            Mark Complete
          </button>
        ) : null}
        {marker.treasureId && marker.treasureStepId ? (
          <button
            type="button"
            onClick={() =>
              void putTreasureState({
                chainId: marker.treasureId!,
                stepsCompleted: [marker.treasureStepId!],
              })
            }
          >
            Mark step complete
          </button>
        ) : null}
        {mark ? (
          <button
            type="button"
            onClick={() =>
              void putEntityState({
                entityType: mark.entityType,
                entityId: mark.entityId,
                completed: !collected,
                completedAt: !collected ? new Date().toISOString() : undefined,
              })
            }
          >
            {collected ? `Undo ${mark.label.replace(/^Mark /, '').toLowerCase()}` : mark.label}
          </button>
        ) : null}
        {source ? (
          <div style={{ color: 'var(--ink-muted)', fontSize: '0.85rem' }}>Source: {source.sourceName}</div>
        ) : null}
      </div>
    </div>
  );
}
