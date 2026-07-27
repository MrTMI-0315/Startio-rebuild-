import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  getPlatformMetrics,
  isLargeTextScale,
} from '../src/design/accessibility.ts';
import { contrastRatio } from '../src/design/contrast.ts';
import {
  darkColors,
  highContrastDarkColors,
  highContrastLightColors,
  lightColors,
  resolveThemeColors,
} from '../src/design/palette.ts';

const palettes = {
  light: lightColors,
  dark: darkColors,
  highContrastLight: highContrastLightColors,
  highContrastDark: highContrastDarkColors,
};

const textPairs = [
  ['textPrimary', 'background'],
  ['textPrimary', 'surface'],
  ['textSecondary', 'background'],
  ['focus', 'background'],
  ['primaryText', 'primary'],
  ['destructive', 'surface'],
  ['inverseText', 'destructive'],
  ['successText', 'successSurface'],
  ['cautionText', 'cautionSurface'],
];

test('light, dark, and increased-contrast semantic text pairs pass WCAG AA', () => {
  for (const [paletteName, palette] of Object.entries(palettes)) {
    for (const [foreground, background] of textPairs) {
      const ratio = contrastRatio(palette[foreground], palette[background]);
      assert.ok(
        ratio >= 4.5,
        `${paletteName} ${foreground}/${background} has ratio ${ratio.toFixed(2)}`,
      );
    }
  }
});

test('system contrast preference resolves a distinct palette in both appearances', () => {
  assert.equal(resolveThemeColors('light', false), lightColors);
  assert.equal(resolveThemeColors('light', true), highContrastLightColors);
  assert.equal(resolveThemeColors('dark', false), darkColors);
  assert.equal(resolveThemeColors('dark', true), highContrastDarkColors);
});

test('platform touch targets preserve 44pt iOS and 48dp Android minimums', () => {
  assert.deepEqual(getPlatformMetrics('ios'), {
    touchTarget: 44,
    primaryActionMinHeight: 50,
  });
  assert.deepEqual(getPlatformMetrics('android'), {
    touchTarget: 48,
    primaryActionMinHeight: 52,
  });
});

test('large-text layout begins before the 200 percent verification target', () => {
  assert.equal(isLargeTextScale(1.49), false);
  assert.equal(isLargeTextScale(1.5), true);
  assert.equal(isLargeTextScale(2), true);
});

test('the app never disables native font scaling', async () => {
  const sourceFiles = [
    '../src/features/start/StartScreen.tsx',
    '../src/features/start/ResumeCard.tsx',
    '../src/features/plan/PlanScreen.tsx',
    '../src/features/timer/TimerScreen.tsx',
    '../src/features/completion/CompletionScreen.tsx',
    '../src/features/history/HistoryScreen.tsx',
    '../src/features/settings/SettingsScreen.tsx',
  ];

  const sources = await Promise.all(
    sourceFiles.map((path) => readFile(new URL(path, import.meta.url), 'utf8')),
  );
  const combined = sources.join('\n');

  assert.doesNotMatch(combined, /allowFontScaling=\{false\}/);
  assert.doesNotMatch(combined, /maxFontSizeMultiplier=/);
  assert.doesNotMatch(
    await readFile(
      new URL('../src/features/timer/TimerScreen.tsx', import.meta.url),
      'utf8',
    ),
    /accessibilityLiveRegion="polite" style=\{styles\.timerText\}/,
  );
});
