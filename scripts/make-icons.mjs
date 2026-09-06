import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#2a1c14"/>
  <circle cx="256" cy="256" r="180" fill="none" stroke="#c4a35a" stroke-width="18"/>
  <path d="M256 70 L290 256 L256 442 L222 256 Z" fill="#8b2e2e"/>
  <circle cx="256" cy="256" r="28" fill="#c4a35a"/>
</svg>`;

const iconDir = join(root, 'public', 'assets', 'icons');
mkdirSync(iconDir, { recursive: true });
mkdirSync(join(root, 'public', 'assets', 'maps'), { recursive: true });

await sharp(Buffer.from(svg)).png().resize(192, 192).toFile(join(iconDir, 'icon-192.png'));
await sharp(Buffer.from(svg)).png().resize(512, 512).toFile(join(iconDir, 'icon-512.png'));
await sharp(Buffer.from(svg)).png().resize(512, 512).extend({ top: 48, bottom: 48, left: 48, right: 48, background: '#2a1c14' }).resize(512, 512).toFile(join(iconDir, 'icon-512-maskable.png'));

const previewSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="768">
  <rect width="1024" height="768" fill="#cbb892"/>
  <rect x="40" y="40" width="944" height="688" fill="none" stroke="#6b4a32" stroke-width="4"/>
  <text x="512" y="120" text-anchor="middle" font-size="36" fill="#2a1c14" font-family="serif">RDR2 World Map</text>
  <text x="512" y="170" text-anchor="middle" font-size="18" fill="#5c4a38" font-family="serif">Run npm run prepare:map for native tiles</text>
  <text x="420" y="260" font-size="20" fill="#3d2a1f">Ambarino</text>
  <text x="480" y="360" font-size="20" fill="#3d2a1f">New Hanover</text>
  <text x="280" y="420" font-size="20" fill="#3d2a1f">West Elizabeth</text>
  <text x="620" y="480" font-size="20" fill="#3d2a1f">Lemoyne</text>
  <text x="220" y="580" font-size="20" fill="#3d2a1f">New Austin</text>
  <text x="820" y="640" font-size="18" fill="#3d2a1f">Guarma</text>
</svg>`;
await sharp(Buffer.from(previewSvg)).webp({ quality: 80 }).toFile(join(root, 'public', 'assets', 'maps', 'preview.webp'));
console.log('icons + preview written');
