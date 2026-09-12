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

  const toggle = () => {
    const next = !checked;
    if (checked && !next && settings.confirmOnUncheck) {
      const ok = window.confirm('Uncheck this item?');
      if (!ok) return;
    }
    onChange(next);
  };

  return (
    <button
      type="button"
      className={styles.wrap}
      role="checkbox"
      aria-checked={checked}
      onClick={toggle}
    >
      <span className={styles.box} data-checked={checked} aria-hidden>
        {checked ? '✓' : ''}
      </span>
      <span className={styles.copy}>
        <span>{label}</span>
        {description ? <small className={styles.hint}>{description}</small> : null}
      </span>
    </button>
  );
}
