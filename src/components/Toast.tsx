import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { ToastContext } from './toastContext';

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const show = useCallback((msg: string) => {
    setMessage(msg);
    window.setTimeout(() => setMessage(null), 4200);
  }, []);
  const value = useMemo(() => ({ message, show }), [message, show]);
  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function ToastHost({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div role="status" aria-live="polite" className="journal-panel" style={{
      position: 'fixed',
      left: '50%',
      bottom: 'calc(var(--nav-height) + 12px)',
      transform: 'translateX(-50%)',
      zIndex: 50,
      padding: '12px 16px',
      maxWidth: 'min(92vw, 420px)',
    }}>
      {message}
    </div>
  );
}
