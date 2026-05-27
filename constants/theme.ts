// ============================================================
// Scandinavian Clean Theme 🇸🇪🇩🇰
// Nordic palette — fjord blues, snow whites, clean minimalism
// ============================================================

export const Colors = {
  // --- Primary Palette ---
  primary: '#2D6A9F',        // Fjord Blue
  primaryLight: '#5BA4D0',   // Ice Blue
  primaryDark: '#1A4B73',    // Deep Fjord
  accent: '#4A90C4',         // Sky Fjord

  // --- Backgrounds ---
  backgroundLight: '#F8F9FA',  // Nordic Snow White
  backgroundDark: '#0F1117',   // Nordic Night

  // --- Surfaces ---
  surfaceLight: '#FFFFFF',
  surfaceDark: '#1A1D24',
  surfaceElevatedLight: '#FFFFFF',
  surfaceElevatedDark: '#22262F',

  // --- Text ---
  textPrimaryLight: '#1A1F2E',  // Near Black
  textPrimaryDark: '#F1F5F9',   // Snow White Text
  textSecondaryLight: '#6B7280',
  textSecondaryDark: '#9CA3AF',
  textTertiaryLight: '#9CA3AF',
  textTertiaryDark: '#6B7280',

  // --- Borders ---
  borderLight: '#E5E7EB',
  borderDark: '#2D3241',

  // --- Status ---
  success: '#16A34A',
  successLight: '#DCFCE7',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  danger: '#DC2626',
  dangerLight: '#FEE2E2',
  info: '#2563EB',
  infoLight: '#DBEAFE',

  // --- Language Colors (for badges) ---
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
  favorite: '#F59E0B',
  favoriteBg: '#FFFBEB',

  // --- Code Background ---
  codeBgLight: '#F1F5F9',
  codeBgDark: '#131620',

  // --- Tab Bar ---
  tabActive: '#2D6A9F',
  tabInactiveLight: '#9CA3AF',
  tabInactiveDark: '#6B7280',
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
