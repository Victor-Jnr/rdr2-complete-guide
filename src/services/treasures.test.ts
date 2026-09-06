import { describe, expect, it } from 'vitest';
import { treasures } from '@/data';

describe('treasure chains', () => {
  it('includes the seven story-map chains with ordered steps', () => {
    expect(treasures).toHaveLength(7);
    for (const chain of treasures) {
      expect(chain.steps.length).toBeGreaterThan(0);
      const orders = chain.steps.map((s) => s.order);
      expect(orders).toEqual([...orders].sort((a, b) => a - b));
      expect(chain.research.sourceIds.length).toBeGreaterThan(0);
    }
  });

  it('flags Le Trésor des Morts as preorder-limited', () => {
    const chain = treasures.find((t) => t.id.includes('tresor') || t.name.toLowerCase().includes('trésor') || t.name.toLowerCase().includes('tresor'));
    expect(chain).toBeDefined();
    expect(chain?.availability.preorderOnly).toBe(true);
  });
});
