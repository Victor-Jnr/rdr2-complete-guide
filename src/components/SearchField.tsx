import { useId } from 'react';

/**
 * Android WebView paints `input[type=search]` as an empty/zero-size control
 * once `-webkit-appearance: none` (or hidden `::-webkit-search-*` decorations)
 * is applied. Use a text field with an on-screen label instead.
 *
 * The visible brass box is the `<input>` itself (in-flow, no absolute positioning).
 * A wrapping `<label>` covers only the caption + that chrome so a tap on the box
 * still focuses when WebView fails to hit-test the native editor. `size={1}`
 * removes the UA 20-ch min-width.
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
    <label className="search-field" htmlFor={id}>
      <span className="search-field__label">{label}</span>
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
    </label>
  );
}
