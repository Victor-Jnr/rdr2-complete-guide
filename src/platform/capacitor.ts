import { Capacitor, SystemBars, SystemBarsStyle } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import type { ThemeId } from '@/types';

export function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

export function isAndroidBuild(): boolean {
  return import.meta.env.VITE_TARGET === 'android' || isNative();
}

const HTTPS = /^https:\/\//;

export async function openExternal(url: string): Promise<{ ok: true } | { ok: false; reason: 'offline' | 'blocked' }> {
  if (!HTTPS.test(url)) return { ok: false, reason: 'blocked' };
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return { ok: false, reason: 'offline' };
  }
  if (isNative()) {
    await Browser.open({ url });
    return { ok: true };
  }
  window.open(url, '_blank', 'noopener,noreferrer');
  return { ok: true };
}

export async function exportJsonFile(filename: string, json: string): Promise<void> {
  if (isNative()) {
    const path = filename;
    await Filesystem.writeFile({
      path,
      data: json,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    });
    const uri = await Filesystem.getUri({ path, directory: Directory.Cache });
    await Share.share({
      title: 'RDR2 Complete Guide progress',
      url: uri.uri,
      dialogTitle: 'Export progress',
    });
    return;
  }
  const blob = new Blob([json], { type: 'application/json' });
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(href);
}

export async function applySystemBars(theme: ThemeId): Promise<void> {
  if (!isNative()) return;
  try {
    await SystemBars.setStyle({
      style: theme === 'parchment' ? SystemBarsStyle.Dark : SystemBarsStyle.Light,
    });
  } catch {
    /* web or unsupported */
  }
}

export function listenBackButton(handler: () => boolean): () => void {
  if (!isNative()) return () => undefined;
  const sub = App.addListener('backButton', ({ canGoBack }) => {
    const handled = handler();
    if (handled) return;
    if (canGoBack) window.history.back();
    else void App.exitApp();
  });
  return () => {
    void sub.then((s) => s.remove());
  };
}
