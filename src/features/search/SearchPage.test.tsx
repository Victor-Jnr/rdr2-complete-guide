import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import SearchPage from '@/features/search/SearchPage';

describe('SearchPage', () => {
  it('shows a visible text search box on the Search tab', () => {
    const { container } = render(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('searchbox', { name: 'Search' })).toHaveAttribute('type', 'text');
    expect(container.querySelector('input[type="search"]')).toBeNull();
  });
});
