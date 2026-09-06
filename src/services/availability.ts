import type { Availability, EditionId, PlatformId } from '@/types';
import { chaptersById } from '@/data';

export function isAvailableInChapter(availability: Availability, chapterId: string): boolean {
  if (availability.availableChapterIds?.includes(chapterId)) return true;
  return availability.displayChapterId === chapterId;
}

export function isMissableLeavingChapter(
  availability: Availability,
  chapterId: string,
): boolean {
  return availability.latestChapterId === chapterId;
}

export function chapterOrder(chapterId: string): number {
  return chaptersById.get(chapterId)?.order ?? Number.MAX_SAFE_INTEGER;
}

export function availabilityWindowValid(availability: Availability): boolean {
  if (!availability.earliestChapterId || !availability.latestChapterId) return true;
  return chapterOrder(availability.earliestChapterId) <= chapterOrder(availability.latestChapterId);
}

export function editionLabel(editions?: EditionId[]): string | undefined {
  if (!editions?.length) return undefined;
  return editions.map((e: EditionId) => e[0]!.toUpperCase() + e.slice(1)).join(', ');
}

export function platformLabel(platforms?: PlatformId[]): string | undefined {
  if (!platforms?.length) return undefined;
  const names: Record<PlatformId, string> = {
    pc: 'PC',
    ps4: 'PS4',
    ps5: 'PS5',
    'xbox-one': 'Xbox One',
    'xbox-series': 'Xbox Series',
  };
  return platforms.map((p: PlatformId) => names[p]).join(', ');
}
