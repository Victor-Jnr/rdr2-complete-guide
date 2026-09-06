import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { GameMap } from '@/components/GameMap';
import { MapLayerPanel } from '@/components/MapLayerPanel';
import { MARKER_TYPES } from '@/data/markerCategories';
import { derivedMarkers } from '@/services/content';
import {
  countMarkersByType,
  filterMapMarkers,
  hiddenFromVisible,
  markerIsCollected,
  parseLayersParam,
  serializeLayersParam,
} from '@/services/mapLayers';
import { putSettings, useAllEntityState, useAllMissionState, useAllTreasureState, useSettings } from '@/hooks/useGuideState';
import type { MarkerType } from '@/types';
import styles from './MapPage.module.css';

export default function MapPage() {
  const [params, setParams] = useSearchParams();
  const settings = useSettings();
  const focusId = params.get('marker') ?? undefined;
  const compendiumId = params.get('compendium') ?? undefined;
  const calibrate = import.meta.env.DEV && params.get('calibrate') === '1';
  const [selected, setSelected] = useState<string | undefined>(focusId);
  const [query, setQuery] = useState('');
  const [panelOpen, setPanelOpen] = useState(
    () => (typeof window === 'undefined' ? false : window.innerWidth >= 768),
  );
  const all = useMemo(() => derivedMarkers(), []);
  const entityStates = useAllEntityState();
  const missionStates = useAllMissionState();
  const treasureStates = useAllTreasureState();
  const eMap = useMemo(
    () => new Map(entityStates.map((s) => [`${s.entityType}:${s.entityId}`, s])),
    [entityStates],
  );
  const mMap = useMemo(() => new Map(missionStates.map((s) => [s.missionId, s])), [missionStates]);
  const tMap = useMemo(() => new Map(treasureStates.map((s) => [s.chainId, s])), [treasureStates]);
  const collectedIds = useMemo(() => {
    const ids = new Set<string>();
    for (const marker of all) {
      if (markerIsCollected(marker, eMap, mMap, tMap)) ids.add(marker.id);
    }
    return ids;
  }, [all, eMap, mMap, tMap]);

  const visibleTypes = parseLayersParam(params.get('layers'), settings.mapHiddenMarkerTypes);
  const hideCollected = params.has('hideCollected')
    ? params.get('hideCollected') === '1'
    : settings.mapHideCollected;

  const markers = useMemo(
    () =>
      filterMapMarkers({
        markers: all,
        visibleTypes,
        query,
        hideCollected,
        collectedIds,
        forceMarkerId: focusId,
        compendiumId,
      }),
    [all, visibleTypes, query, hideCollected, collectedIds, focusId, compendiumId],
  );

  const counts = useMemo(() => countMarkersByType(all), [all]);

  const writeLayers = (next: Set<MarkerType>) => {
    void putSettings({ mapHiddenMarkerTypes: hiddenFromVisible(next) });
    setParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        p.set('layers', serializeLayersParam(next));
        return p;
      },
      { replace: true },
    );
  };

  const writeHideCollected = (next: boolean) => {
    void putSettings({ mapHideCollected: next });
    setParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        if (next) p.set('hideCollected', '1');
        else p.delete('hideCollected');
        return p;
      },
      { replace: true },
    );
  };

  return (
    <main className={styles.page}>
      <h1 className="sr-only">Map</h1>
      <div className={styles.mapWrap}>
        <GameMap
          markers={markers}
          focusId={focusId}
          selectedId={selected}
          onSelect={(m) => setSelected(m.id)}
          center={compendiumId && markers[0] ? { x: markers[0].x, y: markers[0].y } : undefined}
          height="100%"
          collectedIds={collectedIds}
          calibrate={calibrate}
        />
        <button type="button" className={styles.layersBtn} onClick={() => setPanelOpen((v) => !v)}>
          {panelOpen ? 'Hide layers' : 'Layers'}
        </button>
        <MapLayerPanel
          open={panelOpen}
          visibleTypes={visibleTypes}
          counts={counts}
          query={query}
          hideCollected={hideCollected}
          onQuery={setQuery}
          onToggleType={(type) => {
            const next = new Set(visibleTypes);
            if (next.has(type)) next.delete(type);
            else next.add(type);
            writeLayers(next);
          }}
          onShowAll={() => writeLayers(new Set(MARKER_TYPES))}
          onHideAll={() => writeLayers(new Set())}
          onHideCollected={writeHideCollected}
        />
      </div>
    </main>
  );
}
