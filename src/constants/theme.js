// Theme colors matching the RENT+ logo
// Primary: Bright blue (#00AEEF)
// Secondary: Fresh green (#7AC943)

export const colors = {
  // Primary colors (Blue from logo text/drop)
  primary: '#00AEEF',
  primaryDark: '#0081B3',
  primaryLight: '#4FD3FF',
  
  // Secondary colors (Green from logo ring)
  secondary: '#7AC943',
  secondaryDark: '#5E9D33',
  secondaryLight: '#A5E67A',
  
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
  success: '#38a169',
  error: '#dc3545',
  warning: '#ed8936',
  info: '#2c7a7b',
  
  // Background colors
  background: '#ffffff',
  backgroundLight: '#F4FBFF',
  backgroundDark: '#E6F7FF',
  
  // Text colors
  text: '#233142',
  textLight: '#6C7A89',
  textDark: '#111827',
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
  md: 6,
  lg: 8,
  xl: 12,
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
