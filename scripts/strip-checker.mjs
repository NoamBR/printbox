// Strip baked-in transparency-checker pattern from a PNG, making it truly transparent.
// Usage: node scripts/strip-checker.mjs <input.png> <output.png>
//
// Heuristic: a checker pixel is achromatic (R≈G≈B) AND its luminance is close to
// either ~255 (white square) or ~204 (light gray square). Warm cup/splash pixels
// have a strong color cast and are preserved.

import sharp from "sharp";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const [, , inArg, outArg] = process.argv;
if (!inArg || !outArg) {
  console.error("usage: node scripts/strip-checker.mjs <input.png> <output.png>");
  process.exit(1);
}

const inPath = resolve(inArg);
const outPath = resolve(outArg);

const img = sharp(inPath).ensureAlpha();
const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
if (channels !== 4) {
  console.error(`expected 4 channels, got ${channels}`);
  process.exit(1);
}

// Checker pattern is achromatic with two square shades around lum 178 and 231,
// plus anti-aliased intermediate values where squares meet. We knock out any
// achromatic pixel inside the full band [LUM_MIN, LUM_MAX]. Cups & splash are
// warm brown — their chroma exceeds CHROMA_TOLERANCE and they survive.
const LUM_MIN = 160;
const LUM_MAX = 245;
const CHROMA_TOLERANCE = 7;

let killed = 0;
const total = width * height;

for (let i = 0; i < data.length; i += 4) {
  const r = data[i], g = data[i + 1], b = data[i + 2];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max - min > CHROMA_TOLERANCE) continue;
  const lum = (r + g + b) / 3;
  if (lum < LUM_MIN || lum > LUM_MAX) continue;
  data[i + 3] = 0;
  killed++;
}

// Second pass: feather edges. Any opaque pixel that touches a now-transparent
// neighbor and is itself nearly achromatic gets its alpha reduced — kills the
// 1-pixel halo where the checker square meets the cup outline.
const HALO_CHROMA = 12;
const HALO_LUM_MIN = 170; // only fade light halo pixels, not dark cup edges
const stride = width * 4;
for (let y = 1; y < height - 1; y++) {
  for (let x = 1; x < width - 1; x++) {
    const idx = y * stride + x * 4;
    if (data[idx + 3] === 0) continue;
    const r = data[idx], g = data[idx + 1], b = data[idx + 2];
    const lum = (r + g + b) / 3;
    if (lum < HALO_LUM_MIN) continue;
    if (Math.max(r, g, b) - Math.min(r, g, b) > HALO_CHROMA) continue;
    // any transparent 4-neighbor?
    const neighborsTransparent =
      data[idx - 4 + 3] === 0 ||
      data[idx + 4 + 3] === 0 ||
      data[idx - stride + 3] === 0 ||
      data[idx + stride + 3] === 0;
    if (neighborsTransparent) {
      data[idx + 3] = Math.min(data[idx + 3], 64);
    }
  }
}

await sharp(data, { raw: { width, height, channels: 4 } })
  .png({ compressionLevel: 9 })
  .toFile(outPath);

console.log(`${inArg} → ${outArg}`);
console.log(`  ${width}×${height}, removed ${killed.toLocaleString()} / ${total.toLocaleString()} px (${((killed / total) * 100).toFixed(1)}%)`);
