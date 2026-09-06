import { useEffect, useState } from 'react';
import { isAndroidBuild } from '@/platform/capacitor';

export function PwaUpdatePrompt() {
  const [offlineReady, setOfflineReady] = useState(false);
  const [needRefresh, setNeedRefresh] = useState(false);
  const [update, setUpdate] = useState<(() => void) | null>(null);

  useEffect(() => {
    if (isAndroidBuild() || !('serviceWorker' in navigator)) return;
    let cancelled = false;
    void import('virtual:pwa-register').then(({ registerSW }) => {
      if (cancelled) return;
      const refresh = registerSW({
        immediate: true,
        onNeedRefresh() {
          setNeedRefresh(true);
        },
        onOfflineReady() {
          setOfflineReady(true);
        },
      });
      setUpdate(() => () => refresh(true));
    }).catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  if (isAndroidBuild()) return null;
  if (!offlineReady && !needRefresh) return null;

  return (
    <div className="journal-panel" style={{
      position: 'fixed',
      right: 16,
      bottom: 'calc(var(--nav-height) + 12px)',
      zIndex: 40,
      padding: 12,
      maxWidth: 280,
    }}>
      {needRefresh ? (
        <>
          <p>Update available</p>
          <button type="button" onClick={() => update?.()}>Reload</button>
        </>
      ) : (
        <p>Ready to work offline</p>
      )}
    </div>
  );
}
