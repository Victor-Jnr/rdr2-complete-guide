import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const icon = join(root, 'public', 'assets', 'icons', 'icon-512.png');
const maskable = join(root, 'public', 'assets', 'icons', 'icon-512-maskable.png');
const res = join(root, 'android', 'app', 'src', 'main', 'res');

const densities = {
  mdpi: { launcher: 48, fg: 108 },
  hdpi: { launcher: 72, fg: 162 },
  xhdpi: { launcher: 96, fg: 216 },
  xxhdpi: { launcher: 144, fg: 324 },
  xxxhdpi: { launcher: 192, fg: 432 },
};

for (const [d, size] of Object.entries(densities)) {
  const dir = join(res, `mipmap-${d}`);
  await sharp(icon).resize(size.launcher, size.launcher).png().toFile(join(dir, 'ic_launcher.png'));
  await sharp(icon).resize(size.launcher, size.launcher).png().toFile(join(dir, 'ic_launcher_round.png'));
  await sharp(maskable).resize(size.fg, size.fg).png().toFile(join(dir, 'ic_launcher_foreground.png'));
}

async function paintSplashes(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      await paintSplashes(full);
      continue;
    }
    if (name !== 'splash.png') continue;
    const meta = await sharp(full).metadata();
    const w = meta.width ?? 480;
    const h = meta.height ?? 480;
    const mark = Math.round(Math.min(w, h) * 0.42);
    const overlay = await sharp(icon).resize(mark, mark).png().toBuffer();
    await sharp({
      create: {
        width: w,
        height: h,
        channels: 3,
        background: { r: 26, g: 20, b: 16 },
      },
    })
      .composite([{ input: overlay, gravity: 'centre' }])
      .png()
      .toFile(full);
  }
}

await paintSplashes(res);

const sdk = process.env.ANDROID_HOME ?? process.env.ANDROID_SDK_ROOT ?? '';
if (sdk) {
  const escaped = sdk.replace(/\\/g, '\\\\');
  writeFileSync(join(root, 'android', 'local.properties'), `sdk.dir=${escaped}\n`);
}

console.log('Android launcher icons, splash, and local.properties written');
