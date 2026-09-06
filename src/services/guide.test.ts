import { describe, expect, it } from 'vitest';
import { toLeaflet, fromLeaflet, isNormalized } from '@/services/mapCoords';
import { evaluateCompletionRequirement, percent } from '@/services/progress';
import { availabilityWindowValid } from '@/services/availability';
import { searchGuide } from '@/services/search';
import { derivedMarkers } from '@/services/content';
import { parseExport } from '@/services/exportImport';
import { chapters, missions } from '@/data';

const manifest = {
  width: 7200,
  height: 5400,
  tileSize: 256,
  maxNativeZoom: 5,
  tileUrlTemplate: '/assets/maps/tiles/{z}/{x}/{y}.webp',
  previewUrl: '/assets/maps/preview.webp',
  attribution: 'test',
};

describe('mapCoords', () => {
  it('round-trips normalized coordinates', () => {
    const c = { x: 0.25, y: 0.4 };
    const [lat, lng] = toLeaflet(c, manifest);
    const back = fromLeaflet({ lat, lng }, manifest);
    expect(back.x).toBeCloseTo(c.x);
    expect(back.y).toBeCloseTo(c.y);
    expect(isNormalized(c)).toBe(true);
  });
});

describe('progress', () => {
  it('does not blend empty completion requirements into 100%', () => {
    const r = evaluateCompletionRequirement(
      {
        id: 'x',
        category: 'story',
        title: 'Test',
        countsToward100: true,
        targetCount: 10,
        research: { verificationStatus: 'unresearched', sourceIds: [] },
      },
      { completedEntityIds: new Set() },
    );
    expect(r.complete).toBe(false);
    expect(percent(0, 10)).toBe(0);
    expect(percent(1, 0)).toBe(0);
  });
});

describe('availability', () => {
  it('accepts equal earliest and latest chapters', () => {
    expect(
      availabilityWindowValid({
        displayChapterId: 'chapter-1',
        earliestChapterId: 'chapter-1',
        latestChapterId: 'chapter-1',
      }),
    ).toBe(true);
  });
});

describe('search', () => {
  it('finds a chapter 1 story mission', () => {
    const hits = searchGuide('Outlaws');
    expect(hits.some((h) => h.title.includes('Outlaws'))).toBe(true);
  });

  it('groups kinds without requiring a network', () => {
    const hits = searchGuide('Valentine');
    expect(hits.length).toBeGreaterThan(0);
    expect(new Set(hits.map((h) => h.kind)).size).toBeGreaterThan(0);
  });
});

describe('markers', () => {
  it('derives markers only for locations with coordinates', () => {
    const markers = derivedMarkers();
    expect(markers.length).toBeGreaterThan(0);
    expect(markers.every((m) => m.x >= 0 && m.x <= 1 && m.y >= 0 && m.y <= 1)).toBe(true);
  });
});

describe('dataset', () => {
  it('has eight chapters and chapter 1–2 gold detail', () => {
    expect(chapters).toHaveLength(8);
    const ch1 = missions.filter((m) => m.chapterId === 'chapter-1');
    const ch2 = missions.filter((m) => m.chapterId === 'chapter-2');
    expect(ch1.length).toBeGreaterThanOrEqual(6);
    expect(ch2.length).toBeGreaterThanOrEqual(10);
    const withGold = [...ch1, ...ch2].filter((m) => (m.goldRequirements?.length ?? 0) > 0);
    expect(withGold.length).toBeGreaterThanOrEqual(8);
  });
});

describe('import validation', () => {
  it('rejects malformed files', () => {
    const res = parseExport({ schemaVersion: 99 });
    expect(res.ok).toBe(false);
  });
});
