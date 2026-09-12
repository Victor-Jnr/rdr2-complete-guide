/**
 * Capacitor Android WebView pans the *layout* viewport to keep a focused
 * control on screen. This app scrolls inside `.content`; html/body must stay
 * pinned at (0, 0) or the whole chrome slides off the top.
 */
export function lockLayoutViewport(): () => void {
  const pin = () => {
    if (window.scrollX !== 0 || window.scrollY !== 0) {
      window.scrollTo(0, 0);
    }
    if (document.documentElement.scrollTop) document.documentElement.scrollTop = 0;
    if (document.body.scrollTop) document.body.scrollTop = 0;
  };

  pin();
  window.addEventListener('scroll', pin, { capture: true, passive: true });
  window.addEventListener('focusin', pin);
  const viewport = window.visualViewport;
  viewport?.addEventListener('scroll', pin);

  return () => {
    window.removeEventListener('scroll', pin, { capture: true });
    window.removeEventListener('focusin', pin);
    viewport?.removeEventListener('scroll', pin);
  };
}
