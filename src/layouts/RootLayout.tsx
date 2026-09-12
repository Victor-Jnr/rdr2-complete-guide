import { NavLink, Outlet, ScrollRestoration, useNavigate } from 'react-router';
import { BookOpen, Compass, Gem, Menu, PawPrint, Search, Settings, Trophy } from 'lucide-react';
import { useEffect } from 'react';
import { applySystemBars, listenBackButton } from '@/platform/capacitor';
import { lockLayoutViewport } from '@/platform/viewport';
import { useSettings } from '@/hooks/useGuideState';
import { PwaUpdatePrompt } from '@/components/PwaUpdatePrompt';
import { ToastHost } from '@/components/Toast';
import { useToast } from '@/components/toastContext';
import styles from './RootLayout.module.css';

const tabs = [
  { to: '/journey', label: 'Journey', icon: BookOpen },
  { to: '/treasures', label: 'Treasures', icon: Gem },
  { to: '/map', label: 'Map', icon: Compass },
  { to: '/compendium', label: 'Compendium', icon: PawPrint },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/progress', label: 'Progress', icon: Trophy },
];

export function RootLayout() {
  const settings = useSettings();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
    document.documentElement.setAttribute('data-text', settings.textSize);
    document.documentElement.setAttribute('data-texture', settings.textureIntensity);
    localStorage.setItem('rdr2-theme', settings.theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', settings.theme === 'parchment' ? '#efe0b8' : '#2a1c14');
    }
    void applySystemBars(settings.theme);
  }, [settings.theme, settings.textSize, settings.textureIntensity]);

  useEffect(() => {
    return listenBackButton(() => {
      const dialog = document.querySelector('dialog[open]');
      if (dialog) {
        (dialog as HTMLDialogElement).close();
        return true;
      }
      return false;
    });
  }, [navigate]);

  useEffect(() => lockLayoutViewport(), []);

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <NavLink to="/journey" className={styles.brand}>
          RDR2 Complete Guide
        </NavLink>
        <div className={styles.overflow}>
          <NavLink to="/settings" className={styles.iconBtn} aria-label="Settings">
            <Settings size={22} />
          </NavLink>
          <NavLink to="/about" className={styles.iconBtn} aria-label="About">
            <Menu size={22} />
          </NavLink>
        </div>
      </header>

      <nav className={styles.rail} aria-label="Primary">
        {tabs.map((t) => (
          <NavLink key={t.to} to={t.to} title={t.label} aria-label={t.label}>
            <t.icon size={22} aria-hidden />
            <span>{t.label}</span>
          </NavLink>
        ))}
      </nav>
      <nav className={styles.sidebar} aria-label="Primary">
        {tabs.map((t) => (
          <NavLink key={t.to} to={t.to}>
            <t.icon size={22} aria-hidden />
            <span>{t.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.content}>
        <Outlet />
      </div>

      <nav className={styles.bottomNav} aria-label="Primary">
        {tabs.map((t) => (
          <NavLink key={t.to} to={t.to} aria-label={t.label}>
            <t.icon size={22} aria-hidden />
            <span>{t.label}</span>
          </NavLink>
        ))}
      </nav>
      <ScrollRestoration />
      <PwaUpdatePrompt />
      <ToastHost message={toast.message} />
    </div>
  );
}
