/**
 * Download the Red Dead Wiki world map and cut a native-resolution WebP tile pyramid.
 *
 * Zoom 5 tiles are 256px slices of the source pixels placed on an 8192px padded square
 * (no resampling of the 7200×5400 original). Lower zooms are downsampled from that canvas.
 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const FILE_TITLE = 'File:Red-Dead-Redemption-2-Full-World-Map.jpg';
const TILE = 256;
const MAX_NATIVE_ZOOM = 5;
const PADDED = TILE * 2 ** MAX_NATIVE_ZOOM;

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const cacheDir = join(root, 'scripts', '.cache');
const outDir = join(root, 'public', 'assets', 'maps');

async function wikiFileUrl(title: string): Promise<{ url: string; width: number; height: number; user: string; timestamp: string }> {
  const api = `https://reddead.fandom.com/api.php?action=query&prop=imageinfo&iiprop=url|size|user|timestamp&titles=${encodeURIComponent(title)}&format=json`;
  const res = await fetch(api, { headers: { 'User-Agent': 'rdr2-complete-guide/0.1 (fan project; local map prep)' } });
  if (!res.ok) throw new Error(`Wiki API ${res.status}`);
  const json = (await res.json()) as {
    query: { pages: Record<string, { imageinfo?: { url: string; width: number; height: number; user: string; timestamp: string }[] }> };
  };
  const page = Object.values(json.query.pages)[0];
  const info = page?.imageinfo?.[0];
  if (!info) throw new Error('No imageinfo');
  return info;
}

async function main() {
  mkdirSync(cacheDir, { recursive: true });
  mkdirSync(join(outDir, 'tiles'), { recursive: true });
  const info = await wikiFileUrl(FILE_TITLE);
  const srcPath = join(cacheDir, 'world-map-source.jpg');
  if (!existsSync(srcPath)) {
    console.log('Downloading', info.url);
    const img = await fetch(info.url);
    if (!img.ok) throw new Error(`Download ${img.status}`);
    writeFileSync(srcPath, Buffer.from(await img.arrayBuffer()));
  }
  const meta = await sharp(srcPath).metadata();
  const width = meta.width ?? info.width;
  const height = meta.height ?? info.height;
  console.log(`Source ${width}x${height}, padded ${PADDED}`);

  const canvas = sharp({
    create: {
      width: PADDED,
      height: PADDED,
      channels: 4,
      background: { r: 203, g: 184, b: 146, alpha: 1 },
    },
  })
    .composite([{ input: srcPath, top: 0, left: 0 }])
    .png();

  const paddedBuf = await canvas.toBuffer();

  await sharp(srcPath).resize(1024, Math.round((1024 * height) / width)).webp({ quality: 82 }).toFile(join(outDir, 'preview.webp'));

  let tiles = 0;
  let bytes = 0;
  for (let z = 0; z <= MAX_NATIVE_ZOOM; z += 1) {
    const dim = TILE * 2 ** z;
    const level = await sharp(paddedBuf).resize(dim, dim, { kernel: sharp.kernel.lanczos3 }).ensureAlpha().raw().toBuffer();
    const n = 2 ** z;
    for (let x = 0; x < n; x += 1) {
      for (let y = 0; y < n; y += 1) {
        const dir = join(outDir, 'tiles', String(z), String(x));
        mkdirSync(dir, { recursive: true });
        const dest = join(dir, `${y}.webp`);
        const tile = sharp(level, { raw: { width: dim, height: dim, channels: 4 } }).extract({
          left: x * TILE,
          top: y * TILE,
          width: TILE,
          height: TILE,
        });
        const buf = await tile.webp({ quality: 90 }).toBuffer();
        writeFileSync(dest, buf);
        tiles += 1;
        bytes += buf.length;
      }
    }
    console.log(`zoom ${z} done`);
  }

  const manifest = {
    width,
    height,
    tileSize: TILE,
    maxNativeZoom: MAX_NATIVE_ZOOM,
    tileUrlTemplate: '/assets/maps/tiles/{z}/{x}/{y}.webp',
    previewUrl: '/assets/maps/preview.webp',
    sourceFileUrl: info.url,
    attribution:
      'In-game map imagery © Rockstar Games / Take-Two Interactive. Local copy sourced from the Red Dead Wiki for this non-commercial fan project.',
  };
  writeFileSync(join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

  const provenance = `# Map provenance

- **Date accessed:** ${new Date().toISOString().slice(0, 10)}
- **Wiki file:** ${FILE_TITLE}
- **File page:** https://reddead.fandom.com/wiki/${encodeURIComponent(FILE_TITLE)}
- **Original URL:** ${info.url}
- **Uploader (Wiki):** ${info.user}
- **Wiki file timestamp:** ${info.timestamp}
- **Source pixels:** ${width}×${height}
- **License tag on file page:** none recorded by the MediaWiki API
- **Rights holder:** Rockstar Games / Take-Two Interactive (in-game cartography)
- **Fandom CC-BY-SA:** covers Wiki *text*, not this image
- **Why it is included:** non-commercial fan-made companion; Rockstar’s published fan-project statement is **not a license**
- **Tiles:** ${tiles} WebP tiles (${(bytes / 1024 / 1024).toFixed(1)} MB), zoom 0–${MAX_NATIVE_ZOOM}, native pixels at zoom ${MAX_NATIVE_ZOOM}
`;
  writeFileSync(join(outDir, 'PROVENANCE.md'), provenance);
  console.log(`Wrote ${tiles} tiles, ${(bytes / 1024 / 1024).toFixed(1)} MB`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
