import { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  Platform,
  useColorScheme,
  useWindowDimensions,
} from 'react-native';

import {
  getPlatformMetrics,
  isLargeTextScale,
  type PlatformMetrics,
} from '@/design/accessibility';
import { fontFamilies } from '@/design/fonts';
import {
  resolveThemeColors,
  type ThemeColors,
} from '@/design/palette';

export const sharedDesignTokens = {
  spacing: {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  radius: {
    sm: 8,
    md: 14,
    lg: 20,
  },
  type: {
    display: 34,
    title: 24,
    body: 17,
    label: 15,
    caption: 13,
  },
  font: fontFamilies,
} as const;

export type ThemeTokens = typeof sharedDesignTokens & {
  colors: ThemeColors;
  isDark: boolean;
  isHighContrast: boolean;
  reduceMotion: boolean;
  fontScale: number;
  isLargeText: boolean;
  metrics: PlatformMetrics;
};

export function useThemeTokens(): ThemeTokens {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { fontScale } = useWindowDimensions();
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let active = true;

    const readHighContrast = Platform.OS === 'ios'
      ? AccessibilityInfo.isDarkerSystemColorsEnabled()
      : AccessibilityInfo.isHighTextContrastEnabled();

    void Promise.all([
      readHighContrast,
      AccessibilityInfo.isReduceMotionEnabled(),
    ]).then(([highContrastEnabled, reduceMotionEnabled]) => {
      if (!active) {
        return;
      }
      setIsHighContrast(highContrastEnabled);
      setReduceMotion(reduceMotionEnabled);
    });

    const highContrastSubscription = AccessibilityInfo.addEventListener(
      Platform.OS === 'ios'
        ? 'darkerSystemColorsChanged'
        : 'highTextContrastChanged',
      setIsHighContrast,
    );
    const reduceMotionSubscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );

    return () => {
      active = false;
      highContrastSubscription.remove();
      reduceMotionSubscription.remove();
    };
  }, []);

  return {
    ...sharedDesignTokens,
    colors: resolveThemeColors(isDark ? 'dark' : 'light', isHighContrast),
    isDark,
    isHighContrast,
    reduceMotion,
    fontScale,
    isLargeText: isLargeTextScale(fontScale),
    metrics: getPlatformMetrics(Platform.OS),
  };
}
