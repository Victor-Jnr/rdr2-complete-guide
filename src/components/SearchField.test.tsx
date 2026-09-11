import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { SearchField } from '@/components/SearchField';

function Harness() {
  const [value, setValue] = useState('');
  return <SearchField label="Search" value={value} onChange={setValue} placeholder="Find a mission" />;
}

describe('SearchField', () => {
  it('uses a visible labeled text box instead of type=search', async () => {
    const { container } = render(<Harness />);

    const input = screen.getByRole('searchbox', { name: 'Search' });
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('size', '1');
    expect(input).not.toHaveAttribute('type', 'search');
    expect(container.querySelector('input[type="search"]')).toBeNull();
    expect(container.querySelector('.search-field__control')).not.toBeNull();
    expect(screen.getByText('Search')).toBeVisible();

    await userEvent.type(input, 'dutch');
    expect(input).toHaveValue('dutch');
  });
});
