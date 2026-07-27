import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));

export const repoRoot = path.resolve(scriptDir, '..');
export const renderer = `sharp ${sharp.versions.sharp} / libvips ${sharp.versions.vips}`;

export function fromRoot(...parts) {
  return path.join(repoRoot, ...parts);
}

export function relativeToRoot(file) {
  return path.relative(repoRoot, file).split(path.sep).join('/');
}

export async function ensureDirectory(directory) {
  await fs.mkdir(directory, { recursive: true });
}

export async function sha256(file) {
  const data = await fs.readFile(file);
  return crypto.createHash('sha256').update(data).digest('hex');
}

export async function renderSvg({
  source,
  output,
  width,
  height = width,
  replacements = {},
}) {
  let svg = await fs.readFile(source, 'utf8');

  for (const [from, to] of Object.entries(replacements)) {
    svg = svg.split(from).join(to);
  }

  await ensureDirectory(path.dirname(output));
  await sharp(Buffer.from(svg))
    .resize(width, height, { fit: 'fill', kernel: sharp.kernel.lanczos3 })
    .png({
      compressionLevel: 9,
      adaptiveFiltering: false,
      palette: false,
      progressive: false,
    })
    .toFile(output);
}

export async function pngMetadata(file) {
  const metadata = await sharp(file).metadata();
  return {
    width: metadata.width,
    height: metadata.height,
    format: metadata.format?.toUpperCase(),
    colorMode: metadata.hasAlpha ? 'RGBA' : 'RGB',
    transparent: Boolean(metadata.hasAlpha),
  };
}

export async function createManifestEntry({
  name,
  source,
  output,
  variant,
  transparent,
  generatedAt,
}) {
  const metadata = await pngMetadata(output);
  return {
    name,
    source: relativeToRoot(source),
    output: relativeToRoot(output),
    width: metadata.width,
    height: metadata.height,
    format: metadata.format,
    mode: metadata.colorMode,
    colorMode: metadata.colorMode,
    transparent,
    sha256: await sha256(output),
    generatedAt,
    renderer,
    variant,
  };
}

export async function writeJson(file, data) {
  await ensureDirectory(path.dirname(file));
  await fs.writeFile(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

export async function readRawRgba(file) {
  return sharp(file)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
}

export function alphaBounds(raw, info, threshold = 8) {
  let minX = info.width;
  let minY = info.height;
  let maxX = -1;
  let maxY = -1;
  let pixels = 0;
  let minAlpha = 255;
  let maxAlpha = 0;

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const offset = (y * info.width + x) * info.channels;
      const alpha = raw[offset + 3];
      minAlpha = Math.min(minAlpha, alpha);
      maxAlpha = Math.max(maxAlpha, alpha);
      if (alpha <= threshold) continue;
      pixels += 1;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  return {
    empty: maxX < 0,
    x: minX,
    y: minY,
    width: maxX < 0 ? 0 : maxX - minX + 1,
    height: maxY < 0 ? 0 : maxY - minY + 1,
    maxX,
    maxY,
    pixels,
    minAlpha,
    maxAlpha,
  };
}

export function colorBounds(raw, info, target, tolerance = 28) {
  let minX = info.width;
  let minY = info.height;
  let maxX = -1;
  let maxY = -1;
  let pixels = 0;

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const offset = (y * info.width + x) * info.channels;
      const matches =
        Math.abs(raw[offset] - target[0]) <= tolerance &&
        Math.abs(raw[offset + 1] - target[1]) <= tolerance &&
        Math.abs(raw[offset + 2] - target[2]) <= tolerance;
      if (!matches) continue;
      pixels += 1;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  return {
    empty: maxX < 0,
    x: minX,
    y: minY,
    width: maxX < 0 ? 0 : maxX - minX + 1,
    height: maxY < 0 ? 0 : maxY - minY + 1,
    maxX,
    maxY,
    pixels,
  };
}

export function samplePixel(raw, info, x, y) {
  const offset = (y * info.width + x) * info.channels;
  return [...raw.subarray(offset, offset + info.channels)];
}

export async function nearestBuffer(file, width, height = width) {
  return sharp(file)
    .resize(width, height, { fit: 'fill', kernel: sharp.kernel.nearest })
    .png({
      compressionLevel: 9,
      adaptiveFiltering: false,
      palette: false,
      progressive: false,
    })
    .toBuffer();
}

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function labelSvg({ width, height, text, color = '#201C19', size = 24 }) {
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <text x="0" y="${Math.round(size * 1.1)}"
        font-family="Arial, sans-serif"
        font-size="${size}"
        font-weight="700"
        fill="${color}">${escapeXml(text)}</text>
    </svg>
  `);
}

export function createCanvas(width, height, background) {
  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background,
    },
  });
}
