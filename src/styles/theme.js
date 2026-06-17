// src/styles/theme.js
export const COLORS = {
  teal: '#0A7EA4',
  tealLight: '#13A5D4',
  mint: '#E6F7FB',
  navy: '#0D1F2D',
  slate: '#2C4A5C',
  mist: '#F0F7FA',
  white: '#FFFFFF',
  text: '#1A3040',
  muted: '#6B8FA4',
  border: '#C8E1EB',
  green: '#10B981',
  orange: '#F59E0B',
  red: '#EF4444',
  purple: '#7C3AED',
};

export const SHADOWS = {
  sm: {
    shadowColor: COLORS.teal,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2, // Para Android
  },
};