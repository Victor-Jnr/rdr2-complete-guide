import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MapLayerPanel } from '@/components/MapLayerPanel';

describe('MapLayerPanel', () => {
  it('keeps a visible text pin search in the sheet toolbar', () => {
    const { container } = render(
      <MapLayerPanel
        open
        visibleTypes={new Set()}
        counts={new Map()}
        query=""
        hideCollected={false}
        onQuery={vi.fn()}
        onToggleType={vi.fn()}
        onShowAll={vi.fn()}
        onHideAll={vi.fn()}
        onHideCollected={vi.fn()}
      />,
    );

    expect(screen.getByRole('searchbox', { name: 'Search pins' })).toHaveAttribute('type', 'text');
    expect(container.querySelector('input[type="search"]')).toBeNull();
  });
});
