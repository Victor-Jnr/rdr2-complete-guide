import { useId } from 'react';

/**
 * Android WebView paints `input[type=search]` as an empty/zero-size control
 * once `-webkit-appearance: none` (or hidden `::-webkit-search-*` decorations)
 * is applied. Use a text field with an on-screen label instead.
 *
 * Brass chrome is painted on the in-flow input so the tap target matches the
 * visible box. The control wrapper only clips width. `size={1}` removes the
 * UA 20-ch min-width.
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
      <div className="search-field__control">
        <input
          id={id}
          className="search-field__input"
          type="text"
          size={1}
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
    </div>
  );
}
