import { Link } from 'react-router';
import type { MapMarker } from '@/types';
import { putMissionState, putTreasureState } from '@/db/repositories';

export function MapMarkerPopup({ marker }: { marker: MapMarker }) {
  return (
    <div>
      <strong>{marker.title}</strong>
      {marker.subtitle ? <div>{marker.subtitle}</div> : null}
      <div className="stack" style={{ marginTop: 8 }}>
        {marker.missionId ? <Link to={`/journey/${marker.missionId}`}>Open Mission</Link> : null}
        {marker.treasureId ? <Link to={`/treasures/${marker.treasureId}`}>Open Treasure</Link> : null}
        {marker.locationId ? <Link to={`/locations/${marker.locationId}`}>Open Details</Link> : null}
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
      </div>
    </div>
  );
}
