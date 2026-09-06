import { useEffect, useId, useRef } from 'react';

interface Props {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  typedToken?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = 'Confirm',
  typedToken,
  onCancel,
  onConfirm,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const inputId = useId();
  const typed = useRef('');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onCancel}
      className="journal-panel"
      style={{ padding: 20, maxWidth: 420, border: '1px solid var(--rule)' }}
    >
      <h2>{title}</h2>
      <p>{body}</p>
      {typedToken ? (
        <p>
          <label htmlFor={inputId}>
            Type <strong>{typedToken}</strong> to confirm
          </label>
          <input
            id={inputId}
            onChange={(e) => {
              typed.current = e.target.value;
            }}
            style={{ display: 'block', width: '100%', marginTop: 8, minHeight: 44 }}
          />
        </p>
      ) : null}
      <div className="row" style={{ justifyContent: 'flex-end', marginTop: 12 }}>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            if (typedToken && typed.current !== typedToken) return;
            onConfirm();
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
