export type ThemeMode = 'light' | 'dark';
export type ThemeDensity = 'compact' | 'spaced';

export interface Theme {
  mode: ThemeMode;
  density: ThemeDensity;
}
