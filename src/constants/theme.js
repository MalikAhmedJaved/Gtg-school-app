// Theme for Glory to God PPEC app — supports light and dark mode.
// Primary: Deep blue (#1A5276) - trust & professionalism
// Secondary: Warm gold (#F1C40F) - warmth & care
//
// Usage:
//   import { useTheme } from '../../contexts/ThemeContext';
//   const { colors } = useTheme();
//
//   // For styles, build inside the component with useMemo:
//   const styles = useMemo(() => makeStyles(colors), [colors]);
//   const makeStyles = (colors) => StyleSheet.create({ ... });
//
// spacing / typography / borderRadius / shadows are mode-independent and
// can be imported and used directly as constants.

export const lightColors = {
  // Primary colors
  primary: '#1A5276',
  primaryDark: '#0E3A5C',
  primaryLight: '#2E86C1',

  // Secondary colors
  secondary: '#F1C40F',
  secondaryDark: '#D4AC0D',
  secondaryLight: '#F9E154',

  // Therapy accent colors
  physicalTherapy: '#E74C3C',
  speechTherapy: '#8E44AD',
  occupationalTherapy: '#E67E22',
  behavioralTherapy: '#27AE60',
  nursing: '#2980B9',

  // Neutrals
  white: '#ffffff',
  black: '#000000',
  gray: {
    50: '#f7fafc',
    100: '#edf2f7',
    200: '#e2e8f0',
    300: '#cbd5e0',
    400: '#a0aec0',
    500: '#718096',
    600: '#4a5568',
    700: '#2d3748',
    800: '#1a202c',
    900: '#171923',
  },

  // Status
  success: '#27AE60',
  error: '#E74C3C',
  warning: '#F39C12',
  info: '#2980B9',

  // Backgrounds
  background: '#F0F4F8',
  backgroundLight: '#F7F9FC',
  backgroundDark: '#E8EEF4',

  // Semantic surfaces (added for dark-mode support)
  card: '#FFFFFF',
  border: '#E2E8F0',

  // Text
  text: '#2C3E50',
  textLight: '#7F8C8D',
  textDark: '#1A252F',

  // On-primary text colour — always light enough to sit on the primary color.
  onPrimary: '#FFFFFF',
};

export const darkColors = {
  primary: '#2E86C1',
  primaryDark: '#1A5276',
  primaryLight: '#5DADE2',

  secondary: '#F1C40F',
  secondaryDark: '#D4AC0D',
  secondaryLight: '#F9E154',

  physicalTherapy: '#F1635A',
  speechTherapy: '#AB79C7',
  occupationalTherapy: '#F39148',
  behavioralTherapy: '#3FBF7F',
  nursing: '#3498DB',

  white: '#ffffff',
  black: '#000000',
  // gray scale — values near 50 are now dark (match card backgrounds),
  // values near 900 are now light (replace light-mode white-ish tones).
  gray: {
    50: '#1B1F24',
    100: '#252A31',
    200: '#2E343D',
    300: '#3A414C',
    400: '#5A6270',
    500: '#7E8694',
    600: '#A0A8B4',
    700: '#C3C8D1',
    800: '#E0E3E8',
    900: '#F5F6F8',
  },

  success: '#2ECC71',
  error: '#FF6B6B',
  warning: '#F39C12',
  info: '#3498DB',

  background: '#0F1419',
  backgroundLight: '#151A21',
  backgroundDark: '#080B0F',

  card: '#1E232B',
  border: '#2A313C',

  text: '#E8EAED',
  textLight: '#9AA0A6',
  textDark: '#F5F6F8',

  onPrimary: '#FFFFFF',
};

export function makeTheme(mode) {
  return mode === 'dark' ? darkColors : lightColors;
}

// Back-compat default export so old `import { colors } from '.../theme'`
// code keeps working (always returns light). New code should use the
// useTheme() hook instead.
export const colors = lightColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  fontFamily: {
    regular: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};
