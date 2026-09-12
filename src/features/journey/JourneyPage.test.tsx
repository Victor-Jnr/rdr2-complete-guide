import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';
import JourneyPage from '@/features/journey/JourneyPage';

afterEach(() => {
  cleanup();
});

describe('JourneyPage filters', () => {
  it('keeps Saved and Checklist mode on-theme and does not duplicate Not Completed', () => {
    render(
      <MemoryRouter>
        <JourneyPage />
      </MemoryRouter>,
    );
    expect(screen.queryByRole('checkbox', { name: 'Show incomplete only' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Not Completed' })).toBeVisible();
    const saved = screen.getByRole('checkbox', { name: 'Saved' });
    expect(saved.tagName).toBe('BUTTON');
    expect(screen.getByRole('checkbox', { name: 'Checklist mode' }).tagName).toBe('BUTTON');
    expect(screen.getByRole('button', { name: 'Stranger' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Bounty' })).toBeVisible();
  });

  it('lists stranger strands and board bounties under their chips', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <JourneyPage />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: 'Stranger' }));
    expect(screen.getByText('Good, Honest, Snake Oil')).toBeVisible();
    expect(screen.getByText('The Noblest of Men, and a Woman')).toBeVisible();
    expect(screen.queryByText('Bounty: Joshua Brown')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Bounty' }));
    expect(screen.getByText('Bounty: Joshua Brown')).toBeVisible();
    expect(screen.getByText('Good, Honest, Snake Oil')).toBeVisible();
    expect(screen.queryByText('The Noblest of Men, and a Woman')).toBeNull();
  });
});
