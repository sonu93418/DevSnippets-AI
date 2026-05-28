// ============================================================
// Premium Developer Theme
// Purple, teal, amber, charcoal, and soft light neutrals
// ============================================================

export const Colors = {
  // --- Primary Palette ---
  primary: '#7A5AF8',        // Violet
  primaryLight: '#A78BFA',   // Soft Violet
  primaryDark: '#5B3FE0',    // Deep Violet
  accent: '#3EC9A6',         // Teal

  // --- Backgrounds ---
  backgroundLight: '#F4F4F6',  // Soft light neutral
  backgroundDark: '#2E2E2E',   // Charcoal dark

  // --- Surfaces ---
  surfaceLight: '#FFFFFF',
  surfaceDark: '#373737',
  surfaceElevatedLight: '#FFFFFF',
  surfaceElevatedDark: '#3F3F3F',

  // --- Text ---
  textPrimaryLight: '#171717',  // Deep neutral
  textPrimaryDark: '#F4F4F6',   // Soft light neutral
  textSecondaryLight: '#4B4B4B',
  textSecondaryDark: '#D3D3D8',
  textTertiaryLight: '#6B7280',
  textTertiaryDark: '#A7A7AD',

  // --- Borders ---
  borderLight: '#E5E7EB',
  borderDark: '#464646',

  // --- Status ---
  success: '#3EC9A6',
  successLight: '#DDF7F0',
  warning: '#FFC94A',
  warningLight: '#FFF3CF',
  danger: '#D64545',
  dangerLight: '#FEECEC',
  info: '#7A5AF8',
  infoLight: '#EEE8FF',

  // --- Language Colors (for badges) — keep originals for recognizability
  langJS: '#F7DF1E',
  langTS: '#3178C6',
  langPY: '#3572A5',
  langRust: '#DEA584',
  langGo: '#00ADD8',
  langSwift: '#FA7343',
  langKotlin: '#7F52FF',
  langCSS: '#563D7C',
  langHTML: '#E34C26',
  langSQL: '#336791',
  langBash: '#4EAA25',
  langDefault: '#6B7280',

  // --- Favorites ---
  favorite: '#FFC94A',
  favoriteBg: '#FFF7DB',

  // --- Code Background ---
  codeBgLight: '#FFFFFF',
  codeBgDark: '#262626',

  // --- Tab Bar ---
  tabActive: '#7A5AF8',
  tabInactiveLight: '#8E93A3',
  tabInactiveDark: '#B2B2B2',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
} as const;

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;

// Build a full theme object from color mode
export function buildTheme(isDark: boolean) {
  return {
    colors: {
      primary: Colors.primary,
      primaryLight: Colors.primaryLight,
      primaryDark: Colors.primaryDark,
      accent: Colors.accent,
      background: isDark ? Colors.backgroundDark : Colors.backgroundLight,
      surface: isDark ? Colors.surfaceDark : Colors.surfaceLight,
      surfaceElevated: isDark ? Colors.surfaceElevatedDark : Colors.surfaceElevatedLight,
      textPrimary: isDark ? Colors.textPrimaryDark : Colors.textPrimaryLight,
      textSecondary: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight,
      textTertiary: isDark ? Colors.textTertiaryDark : Colors.textTertiaryLight,
      border: isDark ? Colors.borderDark : Colors.borderLight,
      codeBg: isDark ? Colors.codeBgDark : Colors.codeBgLight,
      tabActive: Colors.tabActive,
      tabInactive: isDark ? Colors.tabInactiveDark : Colors.tabInactiveLight,
      success: Colors.success,
      warning: Colors.warning,
      danger: Colors.danger,
      favorite: Colors.favorite,
    },
    isDark,
    spacing: Spacing,
    radius: BorderRadius,
    fontSize: FontSize,
    fontWeight: FontWeight,
    shadow: Shadow,
  };
}

export type Theme = ReturnType<typeof buildTheme>;
