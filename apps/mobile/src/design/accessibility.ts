export interface PlatformMetrics {
  touchTarget: 44 | 48;
  primaryActionMinHeight: 50 | 52;
}

export function getPlatformMetrics(platform: string): PlatformMetrics {
  return platform === 'android'
    ? { touchTarget: 48, primaryActionMinHeight: 52 }
    : { touchTarget: 44, primaryActionMinHeight: 50 };
}

export function isLargeTextScale(fontScale: number): boolean {
  return fontScale >= 1.5;
}
