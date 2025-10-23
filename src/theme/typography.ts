// Typography system for consistent text styling
import { TextStyle } from 'react-native'
import { colors } from './colors'

export const typography = {
  // Headers
  h1: {
    fontSize: 32,
    fontWeight: '700' as TextStyle['fontWeight'],
    color: colors.text,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as TextStyle['fontWeight'],
    color: colors.text,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as TextStyle['fontWeight'],
    color: colors.text,
    lineHeight: 28,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600' as TextStyle['fontWeight'],
    color: colors.text,
    lineHeight: 24,
  },

  // Body text
  body: {
    fontSize: 16,
    fontWeight: '400' as TextStyle['fontWeight'],
    color: colors.text,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as TextStyle['fontWeight'],
    color: colors.text,
    lineHeight: 20,
  },

  // Labels
  label: {
    fontSize: 14,
    fontWeight: '500' as TextStyle['fontWeight'],
    color: colors.textLight,
    lineHeight: 20,
  },
  labelSmall: {
    fontSize: 12,
    fontWeight: '500' as TextStyle['fontWeight'],
    color: colors.textMuted,
    lineHeight: 16,
  },

  // Special
  button: {
    fontSize: 16,
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: 24,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as TextStyle['fontWeight'],
    color: colors.textMuted,
    lineHeight: 16,
  },
}
