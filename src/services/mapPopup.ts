import { categoryFor } from '@/data/markerCategories';
import type { ChecklistEntityType, MapMarker } from '@/types';

export interface MarkerPopupLink {
  label: string;
  href: string;
}

export interface MarkerMarkAction {
  label: string;
  entityType: ChecklistEntityType;
  entityId: string;
}

export function markerPopupLinks(marker: MapMarker): MarkerPopupLink[] {
  const links: MarkerPopupLink[] = [];
  if (marker.missionId) links.push({ label: 'Open Mission', href: `/journey/${marker.missionId}` });
  if (marker.treasureId) links.push({ label: 'Open Treasure', href: `/treasures/${marker.treasureId}` });
  if (marker.locationId) links.push({ label: 'Open Details', href: `/locations/${marker.locationId}` });
  if (marker.compendiumId) {
    links.push({ label: 'Open Compendium entry', href: `/compendium/${marker.compendiumId}` });
  }
  if (marker.collectibleSetId) {
    links.push({ label: 'Open Collectible set', href: `/progress` });
  }
  return links;
}

export function markerMarkAction(marker: MapMarker): MarkerMarkAction | undefined {
  const cat = categoryFor(marker.type);
  if (!cat?.markEntity || !cat.markLabel) return undefined;
  if (cat.markEntity === 'compendium' && marker.compendiumId) {
    return { label: cat.markLabel, entityType: 'compendium', entityId: marker.compendiumId };
  }
  if (cat.markEntity === 'map-marker' || cat.markEntity === 'compendium') {
    return { label: cat.markLabel, entityType: 'map-marker', entityId: marker.id };
  }
  return undefined;
}
