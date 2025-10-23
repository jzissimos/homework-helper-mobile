// Full-screen loading component
import React from 'react'
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native'
import { colors } from '../theme/colors'

interface LoadingScreenProps {
  message?: string
}

export function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.message}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  message: {
    fontSize: 16,
    color: colors.textLight,
  },
})
