import assert from 'node:assert/strict';
import test from 'node:test';

import {
  parseAppearancePreference,
} from '../src/design/appearancePreference.ts';

test('MB-18 parses supported appearance preferences', () => {
  assert.equal(parseAppearancePreference('system'), 'system');
  assert.equal(parseAppearancePreference('light'), 'light');
  assert.equal(parseAppearancePreference('dark'), 'dark');
});

test('MB-18 falls back to the system appearance for invalid values', () => {
  assert.equal(parseAppearancePreference('sepia'), 'system');
  assert.equal(parseAppearancePreference(null), 'system');
});
