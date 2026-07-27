import fs from 'node:fs/promises';
import path from 'node:path';
import {
  alphaBounds,
  fromRoot,
  pngMetadata,
  readRawRgba,
  renderer,
  sha256,
  writeJson,
} from './brand-assets-lib.mjs';

const activeRoots = [
  fromRoot('assets/brand/ci'),
  fromRoot('assets/brand/header'),
  fromRoot('assets/app-icon'),
  fromRoot('assets/icons/custom'),
];
const requiredManifestFields = [
  'name',
  'source',
  'output',
  'width',
  'height',
  'format',
  'mode',
  'transparent',
  'sha256',
  'generatedAt',
  'renderer',
  'variant',
];
const referencePairs = [
  [
    fromRoot('docs/reference/design/startio-ci-concepts-v0.1.svg'),
    fromRoot('assets/brand/references/primary/startio-ci-concepts-v0.1.svg'),
  ],
  [
    fromRoot('docs/reference/design/reference-evidence-matrix-2026-07-23.md'),
    fromRoot('assets/brand/references/structural/reference-evidence-matrix-2026-07-23.md'),
  ],
  [
    fromRoot('assets/brand/product/startio/startio-ci-source.png'),
    fromRoot('assets/brand/references/form/startio-ci-source.png'),
  ],
  [
    fromRoot('docs/reference/design/startio-ci-placement-v0.1.md'),
    fromRoot('assets/brand/references/usage/startio-ci-placement-v0.1.md'),
  ],
];

const checks = [];
const failures = [];

function record(name, passed, details) {
  const item = { name, passed, details };
  checks.push(item);
  if (!passed) failures.push(item);
}

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function collectFiles(directory, predicate, results = []) {
  if (!(await exists(directory))) return results;
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await collectFiles(file, predicate, results);
    } else if (predicate(file, entry.name)) {
      results.push(file);
    }
  }
  return results;
}

async function validateDirectoryStructure() {
  for (const directory of activeRoots) {
    record(
      `${path.relative(fromRoot(), directory)}: directory retained`,
      await exists(directory),
      directory,
    );
  }
  for (const category of ['primary', 'structural', 'form', 'usage']) {
    const directory = fromRoot(`assets/brand/references/${category}`);
    record(`reference category ${category}: exists`, await exists(directory), directory);
  }
}

async function validateReferences() {
  for (const [source, copy] of referencePairs) {
    record(`${path.relative(fromRoot(), source)}: source retained`, await exists(source), source);
    record(`${path.relative(fromRoot(), copy)}: intake copy exists`, await exists(copy), copy);
    if ((await exists(source)) && (await exists(copy))) {
      const [sourceHash, copyHash] = await Promise.all([sha256(source), sha256(copy)]);
      record(`${path.relative(fromRoot(), copy)}: byte-identical copy`, sourceHash === copyHash, {
        sourceHash,
        copyHash,
      });
    }
  }
}

async function validateSvgSources(svgFiles) {
  for (const file of svgFiles) {
    const svg = await fs.readFile(file, 'utf8');
    const label = path.relative(fromRoot(), file);
    record(`${label}: no raster embed`, !/<image\b/i.test(svg), 'SVG contains no image element');
    record(
      `${label}: no visual effects`,
      !/<(?:linearGradient|radialGradient|filter)\b/i.test(svg),
      'No gradients or filters',
    );
    record(`${label}: no visible text`, !/<text\b/i.test(svg), 'No text element');
  }
}

async function validatePngAgainstManifest(file, asset) {
  const label = path.relative(fromRoot(), file);
  const fileData = await fs.readFile(file);
  const signature = fileData.subarray(0, 8).toString('hex');
  const metadata = await pngMetadata(file);
  const { data, info } = await readRawRgba(file);
  const bounds = alphaBounds(data, info);

  record(`${label}: PNG signature`, signature === '89504e470d0a1a0a', signature);
  record(
    `${label}: dimensions`,
    metadata.width === asset.width && metadata.height === asset.height,
    { manifest: [asset.width, asset.height], actual: [metadata.width, metadata.height] },
  );
  record(`${label}: format`, metadata.format === asset.format, {
    manifest: asset.format,
    actual: metadata.format,
  });
  record(`${label}: mode`, metadata.colorMode === asset.mode, {
    manifest: asset.mode,
    actual: metadata.colorMode,
  });
  record(`${label}: nonempty`, !bounds.empty && bounds.pixels > 0, bounds);
  if (asset.transparent) {
    record(`${label}: transparent background`, bounds.minAlpha === 0 && bounds.maxAlpha > 0, {
      minAlpha: bounds.minAlpha,
      maxAlpha: bounds.maxAlpha,
    });
  } else {
    record(`${label}: opaque background`, bounds.minAlpha === 255, {
      minAlpha: bounds.minAlpha,
      maxAlpha: bounds.maxAlpha,
    });
  }
  record(`${label}: SHA-256`, await sha256(file) === asset.sha256, asset.sha256);
}

async function validateManifests(manifestFiles) {
  const declaredOutputs = new Set();
  for (const manifestFile of manifestFiles) {
    const manifest = JSON.parse(await fs.readFile(manifestFile, 'utf8'));
    const label = path.relative(fromRoot(), manifestFile);
    record(`${label}: schema version`, manifest.schemaVersion === 1, manifest.schemaVersion);
    record(`${label}: group`, typeof manifest.group === 'string' && manifest.group.length > 0, manifest.group);
    record(`${label}: renderer`, manifest.renderer === renderer, manifest.renderer);
    record(`${label}: assets`, Array.isArray(manifest.assets) && manifest.assets.length > 0, manifest.assets?.length);
    if (!Array.isArray(manifest.assets)) continue;

    for (const asset of manifest.assets) {
      for (const field of requiredManifestFields) {
        record(
          `${asset.name ?? label}: manifest field ${field}`,
          Object.hasOwn(asset, field) && asset[field] !== null && asset[field] !== '',
          asset[field],
        );
      }
      if (typeof asset.output !== 'string' || typeof asset.source !== 'string') continue;

      const source = path.resolve(fromRoot(), asset.source);
      const output = path.resolve(fromRoot(), asset.output);
      const pathsAreScoped = [source, output].every((file) =>
        activeRoots.some((root) => file === root || file.startsWith(`${root}${path.sep}`)));
      record(`${asset.name}: paths stay inside brand pipeline roots`, pathsAreScoped, {
        source: asset.source,
        output: asset.output,
      });
      if (!pathsAreScoped) continue;
      declaredOutputs.add(path.resolve(output));
      record(`${asset.name}: source exists`, await exists(source), source);
      record(`${asset.name}: output exists`, await exists(output), output);
      if (await exists(output)) await validatePngAgainstManifest(output, asset);
    }
  }
  return declaredOutputs;
}

async function validateAppIntegration() {
  const appConfig = fromRoot('apps/mobile/app.json');
  record('apps/mobile/app.json: retained', await exists(appConfig), appConfig);
  if (!(await exists(appConfig))) return;

  const config = JSON.parse(await fs.readFile(appConfig, 'utf8'));
  const relativeAssets = [
    config.expo?.icon,
    config.expo?.ios?.icon,
    config.expo?.android?.adaptiveIcon?.foregroundImage,
    config.expo?.splash?.image,
  ].filter(Boolean);
  for (const relativeAsset of relativeAssets) {
    const file = path.resolve(path.dirname(appConfig), relativeAsset);
    record(`app integration asset ${relativeAsset}: retained`, await exists(file), file);
  }
}

await validateDirectoryStructure();
await validateReferences();
await validateAppIntegration();

const svgFiles = [];
const manifestFiles = [];
const pngFiles = [];
for (const root of activeRoots) {
  await collectFiles(root, (_, name) => name.toLowerCase().endsWith('.svg'), svgFiles);
  await collectFiles(root, (_, name) => name === 'manifest.json', manifestFiles);
  await collectFiles(root, (_, name) => name.toLowerCase().endsWith('.png'), pngFiles);
}

const state = svgFiles.length === 0 && manifestFiles.length === 0 && pngFiles.length === 0
  ? 'awaiting-design'
  : 'active-assets';

if (state === 'awaiting-design') {
  record('active brand asset state: clean', true, {
    svgSources: 0,
    manifests: 0,
    generatedPngs: 0,
  });
} else {
  await validateSvgSources(svgFiles);
  const declaredOutputs = await validateManifests(manifestFiles);
  const productionPngs = pngFiles.filter((file) => !file.split(path.sep).includes('preview'));
  for (const file of productionPngs) {
    record(
      `${path.relative(fromRoot(), file)}: declared by manifest`,
      declaredOutputs.has(path.resolve(file)),
      file,
    );
  }
}

const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  renderer,
  state,
  summary: {
    svgSources: svgFiles.length,
    manifests: manifestFiles.length,
    generatedPngs: pngFiles.length,
    checks: checks.length,
    passed: checks.length - failures.length,
    failed: failures.length,
    dimensionValidation: failures.filter((item) => item.name.endsWith(': dimensions')).length === 0,
    alphaValidation: failures.filter((item) => /transparent background|opaque background/.test(item.name)).length === 0,
    fileFormatValidation: failures.filter((item) => /PNG signature|: format$/.test(item.name)).length === 0,
  },
  manualReview: state === 'active-assets'
    ? [{ item: 'Design, licensing, and trademark review', status: 'human-review-required' }]
    : [],
  checks,
};

await writeJson(fromRoot('assets/brand/asset-validation-report.json'), report);

if (failures.length > 0) {
  console.error(`Brand asset validation failed: ${failures.length} check(s).`);
  for (const failure of failures) {
    console.error(`- ${failure.name}: ${JSON.stringify(failure.details)}`);
  }
  process.exitCode = 1;
} else {
  console.log(
    `Brand asset validation passed: ${state}; ${checks.length} checks, ${pngFiles.length} active PNG assets.`,
  );
}
