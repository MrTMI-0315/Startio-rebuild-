import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {
  createCanvas,
  ensureDirectory,
  fromRoot,
  labelSvg,
  nearestBuffer,
} from './brand-assets-lib.mjs';

const activeRoots = [
  fromRoot('assets/brand/ci'),
  fromRoot('assets/brand/header'),
  fromRoot('assets/app-icon'),
  fromRoot('assets/icons/custom'),
];
const backgrounds = [
  { name: 'white', value: '#FFFFFF', label: '#201C19' },
  { name: 'warm paper', value: '#FAF8F6', label: '#201C19' },
  { name: 'black', value: '#000000', label: '#FFFFFF' },
  { name: 'near black', value: '#121212', label: '#FFFFFF' },
];
const pngOptions = {
  compressionLevel: 9,
  adaptiveFiltering: false,
  palette: false,
  progressive: false,
};

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function collectManifests(directory, results = []) {
  if (!(await exists(directory))) return results;
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'preview') await collectManifests(file, results);
    } else if (entry.name === 'manifest.json') {
      results.push(file);
    }
  }
  return results;
}

function safeGroupName(value) {
  return String(value || 'assets').replace(/[^a-z0-9_-]+/gi, '-').toLowerCase();
}

async function renderAssetPreview(asset, cellSize) {
  const file = fromRoot(...asset.output.split('/'));
  const metadata = await sharp(file).metadata();
  const longest = Math.max(metadata.width ?? 1, metadata.height ?? 1);
  const scale = Math.max(1, Math.floor(128 / longest));
  const width = Math.max(1, (metadata.width ?? 1) * scale);
  const height = Math.max(1, (metadata.height ?? 1) * scale);
  return {
    buffer: await nearestBuffer(file, width, height),
    leftOffset: Math.floor((cellSize - width) / 2),
    topOffset: Math.floor((160 - height) / 2),
    label: `${asset.name} · ${metadata.width}×${metadata.height} · ${scale}×`,
  };
}

async function generateManifestContactSheet(manifestFile, manifest) {
  const assets = [];
  for (const asset of manifest.assets ?? []) {
    const file = fromRoot(...asset.output.split('/'));
    if (await exists(file)) assets.push(asset);
  }
  if (assets.length === 0) return null;

  const columns = Math.min(6, assets.length);
  const assetRows = Math.ceil(assets.length / columns);
  const cellWidth = 220;
  const cellHeight = 220;
  const headingHeight = 54;
  const blockHeight = headingHeight + assetRows * cellHeight;
  const width = columns * cellWidth;
  const height = backgrounds.length * blockHeight;
  const composites = [];

  for (let backgroundIndex = 0; backgroundIndex < backgrounds.length; backgroundIndex += 1) {
    const background = backgrounds[backgroundIndex];
    const blockTop = backgroundIndex * blockHeight;
    composites.push({
      input: await sharp({
        create: {
          width,
          height: blockHeight,
          channels: 4,
          background: background.value,
        },
      }).png(pngOptions).toBuffer(),
      left: 0,
      top: blockTop,
    });
    composites.push({
      input: labelSvg({
        width: width - 32,
        height: 40,
        text: `${manifest.group} · ${background.name}`,
        color: background.label,
        size: 22,
      }),
      left: 20,
      top: blockTop + 12,
    });

    for (let index = 0; index < assets.length; index += 1) {
      const row = Math.floor(index / columns);
      const column = index % columns;
      const cellLeft = column * cellWidth;
      const cellTop = blockTop + headingHeight + row * cellHeight;
      const preview = await renderAssetPreview(assets[index], cellWidth);
      composites.push({
        input: preview.buffer,
        left: cellLeft + preview.leftOffset,
        top: cellTop + preview.topOffset,
      });
      composites.push({
        input: labelSvg({
          width: cellWidth - 20,
          height: 42,
          text: preview.label,
          color: background.label,
          size: 13,
        }),
        left: cellLeft + 10,
        top: cellTop + 172,
      });
    }
  }

  const output = path.join(
    path.dirname(manifestFile),
    'preview',
    `${safeGroupName(manifest.group)}-contact-sheet.png`,
  );
  await ensureDirectory(path.dirname(output));
  await createCanvas(width, height, '#FFFFFF')
    .composite(composites)
    .png(pngOptions)
    .toFile(output);
  return output;
}

export async function generateAllContactSheets() {
  const manifests = [];
  for (const root of activeRoots) await collectManifests(root, manifests);
  if (manifests.length === 0) {
    console.log('Startio contact sheets: awaiting-design; no active manifests.');
    return [];
  }

  const outputs = [];
  for (const manifestFile of manifests.sort()) {
    const manifest = JSON.parse(await fs.readFile(manifestFile, 'utf8'));
    const output = await generateManifestContactSheet(manifestFile, manifest);
    if (output) outputs.push(output);
  }
  console.log(`Generated ${outputs.length} manifest-driven contact sheet(s).`);
  return outputs;
}

const executedDirectly = process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);

if (executedDirectly) await generateAllContactSheets();
