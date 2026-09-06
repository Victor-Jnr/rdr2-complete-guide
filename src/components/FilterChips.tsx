interface Chip {
  id: string;
  label: string;
}

interface Props {
  chips: Chip[];
  value: string;
  onChange: (id: string) => void;
  ariaLabel?: string;
}

export function FilterChips({ chips, value, onChange, ariaLabel }: Props) {
  return (
    <div role="group" aria-label={ariaLabel} className="row">
      {chips.map((c) => (
        <button
          key={c.id}
          type="button"
          aria-pressed={value === c.id}
          onClick={() => onChange(c.id)}
          style={{
            minHeight: 40,
            padding: '0 12px',
            border: '1px solid var(--brass)',
            background: value === c.id ? 'var(--brass)' : 'transparent',
            color: value === c.id ? 'var(--paper)' : 'var(--ink)',
          }}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
