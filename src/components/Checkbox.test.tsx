import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Checkbox } from '@/components/Checkbox';

function Harness() {
  const [checked, setChecked] = useState(false);
  return <Checkbox checked={checked} onChange={setChecked} label="Complete within 5 minutes" />;
}

describe('Checkbox', () => {
  it('toggles with a button checkbox instead of a native input', async () => {
    const { container } = render(<Harness />);

    const box = screen.getByRole('checkbox', { name: 'Complete within 5 minutes' });
    expect(box.tagName).toBe('BUTTON');
    expect(box).toHaveAttribute('aria-checked', 'false');
    expect(container.querySelector('input[type="checkbox"]')).toBeNull();

    await userEvent.click(box);
    expect(box).toHaveAttribute('aria-checked', 'true');
  });
});
