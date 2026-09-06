import { Link, useParams } from 'react-router';
import { getLocation, missions, treasures } from '@/data';
import { EmptyState } from '@/components/EmptyState';
import { GameMap } from '@/components/GameMap';
import { SourceAttribution } from '@/components/SourceAttribution';
import { derivedMarkers } from '@/services/content';

export default function LocationPage() {
  const { locationId = '' } = useParams();
  const loc = getLocation(locationId);
  if (!loc) {
    return (
      <main className="page">
        <EmptyState title="Location not found" />
      </main>
    );
  }
  const relatedM = missions.filter((m) => m.startLocationId === loc.id);
  const relatedT = treasures.filter((t) => t.steps.some((s) => s.locationId === loc.id));
  const markers = derivedMarkers().filter((m) => m.locationId === loc.id);
  const nearbyPins = markers.filter((m) => !m.missionId && !m.treasureId);

  return (
    <main className="page stack">
      <h1>{loc.name}</h1>
      {loc.region ? <p>{loc.region}</p> : null}
      {loc.coordinate ? (
        <>
          <GameMap markers={markers} center={loc.coordinate} height={220} />
          <Link to={`/map?marker=${markers[0]?.id ?? ''}`}>Show on Map</Link>
        </>
      ) : (
        <p>No verified map pin for this location yet.</p>
      )}
      {relatedM.length ? (
        <section>
          <h2>Missions</h2>
          {relatedM.map((m) => (
            <p key={m.id}>
              <Link to={`/journey/${m.id}`}>{m.title}</Link>
            </p>
          ))}
        </section>
      ) : null}
      {relatedT.length ? (
        <section>
          <h2>Treasures</h2>
          {relatedT.map((t) => (
            <p key={t.id}>
              <Link to={`/treasures/${t.id}`}>{t.name}</Link>
            </p>
          ))}
        </section>
      ) : null}
      {nearbyPins.length ? (
        <section>
          <h2>Pins here</h2>
          {nearbyPins.map((m) => (
            <p key={m.id}>
              <Link to={`/map?marker=${m.id}`}>{m.title}</Link>
            </p>
          ))}
        </section>
      ) : null}
      <SourceAttribution sourceIds={loc.sourceIds} extra={[loc.research]} />
    </main>
  );
}
