export const lightColors = {
  background: '#F8F6F3',
  surface: '#FFFFFF',
  surfaceMuted: '#F0ECE7',
  textPrimary: '#231F1C',
  textSecondary: '#6E6862',
  border: '#DED8D2',
  focus: '#A75322',
  primary: '#EBA16E',
  primaryPressed: '#DC8D56',
  primaryDisabled: '#E8DED6',
  primaryText: '#281407',
  selection: '#F5DDCC',
  successSurface: '#E9F2E9',
  successText: '#315D37',
  cautionSurface: '#FFF2D8',
  cautionText: '#6B4813',
  destructive: '#B6463B',
  inverseText: '#FFFDF9',
} as const;

export const darkColors = {
  background: '#1C1A18',
  surface: '#282522',
  surfaceMuted: '#332F2B',
  textPrimary: '#F7F2ED',
  textSecondary: '#BDB5AE',
  border: '#4B453F',
  focus: '#F0AD7C',
  primary: '#E8A170',
  primaryPressed: '#F0B387',
  primaryDisabled: '#574A40',
  primaryText: '#241208',
  selection: '#5B3A28',
  successSurface: '#243528',
  successText: '#A9D5AE',
  cautionSurface: '#392E1D',
  cautionText: '#F2C77E',
  destructive: '#EF8D82',
  inverseText: '#191614',
} as const;

export const highContrastLightColors = {
  background: '#FFFDF9',
  surface: '#FFFFFF',
  surfaceMuted: '#EEE7E0',
  textPrimary: '#17120F',
  textSecondary: '#514943',
  border: '#81746A',
  focus: '#8B3D13',
  primary: '#E58A4A',
  primaryPressed: '#C96D32',
  primaryDisabled: '#D8CEC5',
  primaryText: '#211006',
  selection: '#F3D3BD',
  successSurface: '#DDEDDD',
  successText: '#235229',
  cautionSurface: '#FFE8B8',
  cautionText: '#583700',
  destructive: '#8F2922',
  inverseText: '#FFFFFF',
} as const;

export const highContrastDarkColors = {
  background: '#12100F',
  surface: '#1D1A18',
  surfaceMuted: '#2B2622',
  textPrimary: '#FFFFFF',
  textSecondary: '#DED5CD',
  border: '#A29387',
  focus: '#FFC39B',
  primary: '#F2A872',
  primaryPressed: '#FFC39B',
  primaryDisabled: '#584A40',
  primaryText: '#1C0C03',
  selection: '#65412C',
  successSurface: '#213A26',
  successText: '#C1E8C5',
  cautionSurface: '#43351D',
  cautionText: '#FFD68A',
  destructive: '#FFAAA1',
  inverseText: '#210B08',
} as const;

export type ThemeColors = {
  [ColorName in keyof typeof lightColors]: string;
};

export type ThemeMode = 'light' | 'dark';

export function resolveThemeColors(
  mode: ThemeMode,
  highContrast: boolean,
): ThemeColors {
  if (mode === 'dark') {
    return highContrast ? highContrastDarkColors : darkColors;
  }

  return highContrast ? highContrastLightColors : lightColors;
}
