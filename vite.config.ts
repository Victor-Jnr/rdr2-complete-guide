import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(({ mode }) => {
  const isAndroid = mode === 'android';

  return {
    plugins: [
      react(),
      ...(!isAndroid
        ? [
            VitePWA({
              registerType: 'prompt',
              injectRegister: false,
              includeAssets: ['favicon.svg', 'assets/icons/*.png', 'assets/icons/*.svg'],
              manifest: {
                name: 'RDR2 Complete Guide',
                short_name: 'RDR2 Guide',
                description:
                  'Unofficial offline companion for Red Dead Redemption 2 — missions, missables, treasures, and progression.',
                theme_color: '#2a1c14',
                background_color: '#1a1410',
                display: 'standalone',
                start_url: '/',
                scope: '/',
                icons: [
                  { src: '/assets/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
                  { src: '/assets/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
                  {
                    src: '/assets/icons/icon-512-maskable.png',
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'maskable',
                  },
                ],
              },
              workbox: {
                globPatterns: ['**/*.{js,css,html,ico,svg,png,webp,woff2,json}'],
                globIgnores: ['**/assets/maps/tiles/4/**', '**/assets/maps/tiles/5/**'],
                navigateFallback: 'index.html',
                cleanupOutdatedCaches: true,
                maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
                runtimeCaching: [
                  {
                    urlPattern: /\/assets\/maps\/tiles\/[45]\/.*/,
                    handler: 'CacheFirst',
                    options: {
                      cacheName: 'rdr2-map-tiles-hires',
                      expiration: { maxEntries: 2000, maxAgeSeconds: 60 * 60 * 24 * 365 },
                      cacheableResponse: { statuses: [0, 200] },
                    },
                  },
                ],
              },
            }),
          ]
        : []),
    ],
    resolve: {
      alias: { '@': path.join(here, 'src') },
    },
    define: {
      'import.meta.env.VITE_TARGET': JSON.stringify(isAndroid ? 'android' : 'web'),
    },
  };
});
