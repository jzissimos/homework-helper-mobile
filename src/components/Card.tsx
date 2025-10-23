// Reusable Card Component for consistent container styling
import React from 'react'
import { View, StyleSheet, ViewProps } from 'react-native'
import { colors } from '../theme/colors'

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'outlined'
  children: React.ReactNode
}

export function Card({ variant = 'default', children, style, ...props }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        variant === 'elevated' && styles.cardElevated,
        variant === 'outlined' && styles.cardOutlined,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  cardElevated: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardOutlined: {
    borderWidth: 1,
    borderColor: colors.border,
  },
})
