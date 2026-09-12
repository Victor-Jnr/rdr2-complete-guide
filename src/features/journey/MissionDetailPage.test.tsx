import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import MissionDetailPage from '@/features/journey/MissionDetailPage';

vi.mock('@/components/GameMap', () => ({
  GameMap: () => <div data-testid="game-map" />,
}));

afterEach(() => {
  cleanup();
});

function renderMission(missionId: string) {
  return render(
    <MemoryRouter initialEntries={[`/journey/${missionId}`]}>
      <Routes>
        <Route path="/journey/:missionId" element={<MissionDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('MissionDetailPage checklists', () => {
  it('toggles mission and gold rows without a native checkbox input', async () => {
    const user = userEvent.setup();
    const { container } = renderMission('mission-outlaws-from-the-west');

    expect(screen.getByRole('heading', { name: 'Outlaws from the West' })).toBeVisible();
    expect(container.querySelector('input[type="checkbox"]')).toBeNull();

    await user.click(screen.getByRole('checkbox', { name: 'Mark mission complete' }));
    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: 'Mission complete' })).toHaveAttribute(
        'aria-checked',
        'true',
      );
    });
    expect(window.scrollY).toBe(0);

    const gold = screen.getByRole('checkbox', { name: 'Take no damage during the shootout' });
    await user.click(gold);
    await waitFor(() => {
      expect(gold).toHaveAttribute('aria-checked', 'true');
    });
    expect(window.scrollY).toBe(0);
  });

  it('shows Money Lending and Other Sins IV', () => {
    renderMission('mission-money-lending-and-other-sins-iv');
    expect(screen.getByRole('heading', { name: 'Money Lending and Other Sins IV' })).toBeVisible();
    expect(screen.getAllByText(/Gwyn Hughes/).length).toBeGreaterThan(0);
    expect(screen.queryByText('Mission not found')).toBeNull();
  });
});
