// Theme colors for Glory to God PPEC app
// Primary: Deep blue (#1A5276) - trust & professionalism
// Secondary: Warm gold (#F1C40F) - warmth & care

export const colors = {
  // Primary colors (Deep blue)
  primary: '#1A5276',
  primaryDark: '#0E3A5C',
  primaryLight: '#2E86C1',

  // Secondary colors (Warm gold)
  secondary: '#F1C40F',
  secondaryDark: '#D4AC0D',
  secondaryLight: '#F9E154',

  // Accent colors for therapy categories
  physicalTherapy: '#E74C3C',
  speechTherapy: '#8E44AD',
  occupationalTherapy: '#E67E22',
  behavioralTherapy: '#27AE60',
  nursing: '#2980B9',

  // Neutral colors
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

  // Status colors
  success: '#27AE60',
  error: '#E74C3C',
  warning: '#F39C12',
  info: '#2980B9',

  // Background colors
  background: '#F0F4F8',
  backgroundLight: '#F7F9FC',
  backgroundDark: '#E8EEF4',

  // Text colors
  text: '#2C3E50',
  textLight: '#7F8C8D',
  textDark: '#1A252F',
};

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
