import { useId } from 'react';

/**
 * Android WebView paints `input[type=search]` as an empty/zero-size control
 * once `-webkit-appearance: none` (or hidden `::-webkit-search-*` decorations)
 * is applied. Use a text field with an on-screen label instead.
 */
export function SearchField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <div className="search-field">
      <label htmlFor={id} className="search-field__label">
        {label}
      </label>
      <input
        id={id}
        className="search-field__input"
        type="text"
        inputMode="search"
        enterKeyHint="search"
        role="searchbox"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
