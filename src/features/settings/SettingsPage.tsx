import { useRef, useState } from 'react';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { putSettings, useSettings } from '@/hooks/useGuideState';
import { applyImport, buildExport, parseExport, summarizeImport } from '@/services/exportImport';
import { missionsById, treasuresById } from '@/data';
import { exportJsonFile, isNative } from '@/platform/capacitor';
import { resetAllProgress } from '@/db/repositories';
import type { ThemeId } from '@/types';
import { DEFAULT_MANIFEST } from '@/data/mapManifest';

export default function SettingsPage() {
  const settings = useSettings();
  const [resetOpen, setResetOpen] = useState(false);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const [mapProgress, setMapProgress] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const downloadFullMap = async () => {
    const max = DEFAULT_MANIFEST.maxNativeZoom;
    const size = 2 ** max;
    const urls: string[] = [];
    for (let z = 4; z <= max; z += 1) {
      const n = 2 ** z;
      for (let x = 0; x < n; x += 1) {
        for (let y = 0; y < n; y += 1) {
          urls.push(
            DEFAULT_MANIFEST.tileUrlTemplate.replace('{z}', String(z)).replace('{x}', String(x)).replace('{y}', String(y)),
          );
        }
      }
    }
    let done = 0;
    for (const url of urls) {
      try {
        await fetch(url, { cache: 'reload' });
      } catch {
        /* continue */
      }
      done += 1;
      if (done % 40 === 0) setMapProgress(`Downloading tiles ${done} / ${urls.length} (padded grid ${size}×${size} at z${max})`);
    }
    await putSettings({ fullResMapDownloaded: true });
    setMapProgress(`Full-resolution map cached (${urls.length} high-zoom tiles).`);
  };

  return (
    <main className="page stack">
      <h1>Settings</h1>
      <section className="journal-panel" style={{ padding: 16 }}>
        <h2>Appearance</h2>
        <label>
          Theme
          <select
            value={settings.theme}
            onChange={(e) => void putSettings({ theme: e.target.value as ThemeId })}
            style={{ display: 'block', minHeight: 44, width: '100%' }}
          >
            <option value="campfire">Campfire / Dark</option>
            <option value="parchment">Parchment / Day</option>
          </select>
        </label>
        <label>
          Text size
          <select
            value={settings.textSize}
            onChange={(e) => void putSettings({ textSize: e.target.value as 's' | 'm' | 'l' })}
            style={{ display: 'block', minHeight: 44, width: '100%' }}
          >
            <option value="s">Small</option>
            <option value="m">Medium</option>
            <option value="l">Large</option>
          </select>
        </label>
        <label>
          Paper texture
          <select
            value={settings.textureIntensity}
            onChange={(e) =>
              void putSettings({ textureIntensity: e.target.value as 'low' | 'medium' | 'high' })
            }
            style={{ display: 'block', minHeight: 44, width: '100%' }}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
      </section>
      <section className="journal-panel" style={{ padding: 16 }}>
        <h2>Checklists</h2>
        <label className="row">
          <input
            type="checkbox"
            checked={settings.confirmOnUncheck}
            onChange={(e) => void putSettings({ confirmOnUncheck: e.target.checked })}
          />
          Confirm when unchecking items
        </label>
        <label className="row">
          <input
            type="checkbox"
            checked={settings.hideCompletedByDefault}
            onChange={(e) => void putSettings({ hideCompletedByDefault: e.target.checked })}
          />
          Hide completed by default
        </label>
      </section>
      {!isNative() ? (
        <section className="journal-panel" style={{ padding: 16 }}>
          <h2>Offline map</h2>
          <p>
            The app precaches overview tiles. Download zoom 4–5 for full native resolution offline browsing
            (Android already bundles all tiles).
          </p>
          <button type="button" onClick={() => void downloadFullMap()}>
            {settings.fullResMapDownloaded ? 'Re-download full-resolution map' : 'Download full-resolution map for offline use'}
          </button>
          {mapProgress ? <p>{mapProgress}</p> : null}
        </section>
      ) : null}
      <section className="journal-panel" style={{ padding: 16 }}>
        <h2>Data</h2>
        <div className="row">
          <button
            type="button"
            onClick={() =>
              void buildExport().then((data) =>
                exportJsonFile(`rdr2-guide-progress-${data.exportedAt.slice(0, 10)}.json`, JSON.stringify(data, null, 2)),
              )
            }
          >
            Export progress
          </button>
          <button type="button" onClick={() => fileRef.current?.click()}>
            Import progress
          </button>
          <input
            ref={fileRef}
            className="sr-only"
            type="file"
            accept="application/json"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              void file.text().then((text) => {
                try {
                  const parsed = parseExport(JSON.parse(text));
                  if (!parsed.ok) {
                    setImportMsg(parsed.error);
                    return;
                  }
                  const summary = summarizeImport(
                    parsed.data,
                    new Set(missionsById.keys()),
                    new Set(treasuresById.keys()),
                  );
                  if (!window.confirm(`Import ${summary.missions} missions, ${summary.treasures} treasures, ${summary.entities} other items? Unknown IDs are kept but unused.`)) {
                    return;
                  }
                  void applyImport(parsed.data).then(() => setImportMsg('Import complete.'));
                } catch {
                  setImportMsg('Could not read that file. Existing progress was not changed.');
                }
              });
            }}
          />
          <button type="button" onClick={() => setResetOpen(true)}>
            Reset all progress
          </button>
        </div>
        {importMsg ? <p>{importMsg}</p> : null}
      </section>
      <ConfirmDialog
        open={resetOpen}
        title="Reset all progress?"
        body="This cannot be undone. Type RESET to confirm."
        typedToken="RESET"
        confirmLabel="Erase progress"
        onCancel={() => setResetOpen(false)}
        onConfirm={() => {
          void resetAllProgress().then(() => setResetOpen(false));
        }}
      />
    </main>
  );
}
