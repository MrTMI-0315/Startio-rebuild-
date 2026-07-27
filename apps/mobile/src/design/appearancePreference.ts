export type AppearancePreference = 'system' | 'light' | 'dark';

export function parseAppearancePreference(
  value: unknown,
): AppearancePreference {
  return value === 'light' || value === 'dark' ? value : 'system';
}
