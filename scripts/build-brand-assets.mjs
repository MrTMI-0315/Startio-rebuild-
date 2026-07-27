import fs from 'node:fs/promises';
import path from 'node:path';
import {
  createManifestEntry,
  fromRoot,
  renderSvg,
  renderer,
  repoRoot,
  writeJson,
} from './brand-assets-lib.mjs';
import { generateAllContactSheets } from './generate-brand-contact-sheet.mjs';

const planFile = fromRoot('assets/brand/asset-plan.json');
const activeRoots = [
  fromRoot('assets/brand/ci'),
  fromRoot('assets/brand/header'),
  fromRoot('assets/app-icon'),
  fromRoot('assets/icons/custom'),
];

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function collectFiles(directory, extension, results = []) {
  if (!(await exists(directory))) return results;
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await collectFiles(file, extension, results);
    } else if (entry.name.toLowerCase().endsWith(extension)) {
      results.push(file);
    }
  }
  return results;
}

function resolvePlannedPath(relativePath, extension) {
  if (typeof relativePath !== 'string' || !relativePath.endsWith(extension)) {
    throw new Error(`Expected a repository-relative ${extension} path.`);
  }
  const resolved = path.resolve(repoRoot, relativePath);
  if (!resolved.startsWith(`${repoRoot}${path.sep}`)) {
    throw new Error(`Asset plan path escapes the repository: ${relativePath}`);
  }
  if (!activeRoots.some((root) => resolved === root || resolved.startsWith(`${root}${path.sep}`))) {
    throw new Error(`Asset plan path is outside the retained brand pipeline roots: ${relativePath}`);
  }
  return resolved;
}

function validateAssetSpec(asset) {
  if (!asset || typeof asset !== 'object') throw new Error('Asset plan entry must be an object.');
  if (!asset.name || !asset.variant) throw new Error('Asset plan entries require name and variant.');
  if (!Number.isInteger(asset.width) || asset.width <= 0) {
    throw new Error(`${asset.name}: width must be a positive integer.`);
  }
  if (asset.height !== undefined && (!Number.isInteger(asset.height) || asset.height <= 0)) {
    throw new Error(`${asset.name}: height must be a positive integer.`);
  }
  if (typeof asset.transparent !== 'boolean') {
    throw new Error(`${asset.name}: transparent must be boolean.`);
  }
}

async function buildFromPlan(plan) {
  if (plan.schemaVersion !== 1 || !Array.isArray(plan.groups) || plan.groups.length === 0) {
    throw new Error('assets/brand/asset-plan.json must contain schemaVersion 1 and at least one group.');
  }

  const generatedAt = new Date().toISOString();

  for (const group of plan.groups) {
    if (!group.group || !Array.isArray(group.assets) || group.assets.length === 0) {
      throw new Error('Each asset plan group requires a group name and at least one asset.');
    }

    const manifest = resolvePlannedPath(group.manifest, '.json');
    const entries = [];

    for (const asset of group.assets) {
      validateAssetSpec(asset);
      const source = resolvePlannedPath(asset.source, '.svg');
      const output = resolvePlannedPath(asset.output, '.png');
      if (!(await exists(source))) throw new Error(`${asset.name}: missing source SVG ${asset.source}`);

      await renderSvg({
        source,
        output,
        width: asset.width,
        height: asset.height ?? asset.width,
        replacements: asset.replacements ?? {},
      });
      entries.push(await createManifestEntry({
        name: asset.name,
        source,
        output,
        variant: asset.variant,
        transparent: asset.transparent,
        generatedAt,
      }));
    }

    await writeJson(manifest, {
      schemaVersion: 1,
      group: group.group,
      renderer,
      assets: entries,
    });
  }

  await generateAllContactSheets();
  console.log(`Built ${plan.groups.length} Startio asset group(s) from approved SVG sources.`);
}

async function main() {
  if (!(await exists(planFile))) {
    const svgFiles = [];
    for (const root of activeRoots) await collectFiles(root, '.svg', svgFiles);
    if (svgFiles.length > 0) {
      throw new Error(
        'SVG sources exist but assets/brand/asset-plan.json is missing. ' +
        'Do not infer output geometry or sizes; complete reference intake and add an explicit build plan.',
      );
    }
    console.log('Startio brand assets: awaiting-design; no active SVG sources or build plan.');
    return;
  }

  const plan = JSON.parse(await fs.readFile(planFile, 'utf8'));
  await buildFromPlan(plan);
}

await main();
