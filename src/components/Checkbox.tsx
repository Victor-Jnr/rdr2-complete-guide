import styles from './Checkbox.module.css';
import { useSettings } from '@/hooks/useGuideState';

interface Props {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
}

export function Checkbox({ checked, onChange, label, description }: Props) {
  const settings = useSettings();
  return (
    <label className={styles.wrap}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => {
          const next = e.target.checked;
          if (checked && !next && settings.confirmOnUncheck) {
            const ok = window.confirm('Uncheck this item?');
            if (!ok) return;
          }
          onChange(next);
        }}
      />
      <span className={styles.box} data-checked={checked} aria-hidden>
        {checked ? '✓' : ''}
      </span>
      <span>
        <span>{label}</span>
        {description ? <small style={{ display: 'block', color: 'var(--ink-muted)' }}>{description}</small> : null}
      </span>
    </label>
  );
}
