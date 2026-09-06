import { describe, expect, it } from 'vitest';
import { missions, missionsForChapter } from '@/data';

describe('journey dataset', () => {
  it('lists Chapter 1 Colter missions with gold medals', () => {
    const list = missionsForChapter('chapter-1');
    expect(list.map((m) => m.title)).toContain('Outlaws from the West');
    expect(list.every((m) => m.availability.displayChapterId === 'chapter-1')).toBe(true);
    expect(list.filter((m) => (m.goldRequirements?.length ?? 0) >= 3).length).toBeGreaterThanOrEqual(4);
  });

  it('keeps later chapters as a researched title skeleton', () => {
    const late = missions.filter((m) => m.chapterId === 'chapter-6');
    expect(late.length).toBeGreaterThan(0);
    expect(late.every((m) => m.title.length > 0 && m.research.verificationStatus !== 'unresearched')).toBe(
      true,
    );
  });
});
