/**
 * Color tokens for OUTE design system
 * Used across all applications
 */

export const colors = {
  // Primary - Main brand color (Cyan)
  primary: {
    50: '#ecf7fc',
    100: '#d9effa',
    200: '#a8ddf4',
    300: '#77cbee',
    400: '#46b9e9',
    500: '#15a7e4',
    600: '#06bcf9',
    700: '#0597c9',
    800: '#047a99',
    900: '#025d69',
  },

  // Secondary - Accent color (Teal)
  secondary: {
    50: '#ecf4f8',
    100: '#d9eaf1',
    200: '#a8d5e3',
    300: '#77c0d5',
    400: '#46abc7',
    500: '#1596b9',
    600: '#0597c9',
    700: '#046b99',
    800: '#035169',
    900: '#024039',
  },

  // Neutral - Grayscale
  neutral: {
    0: '#ffffff',
    50: '#f5f8f8',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Semantic colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#0ea5e9',

  // Dark mode variants
  dark: {
    bg: '#0f1e23',
    surface: '#162a31',
    border: '#21404a',
  },
};

// Export just the primary color for quick access
export const primary = colors.primary;
export const secondary = colors.secondary;
export const neutral = colors.neutral;
