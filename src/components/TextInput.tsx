// Reusable Text Input Component with consistent styling
import React from 'react'
import { TextInput as RNTextInput, StyleSheet, TextInputProps } from 'react-native'
import { colors } from '../theme/colors'

interface CustomTextInputProps extends TextInputProps {
  error?: boolean
}

export function TextInput({ error, style, ...props }: CustomTextInputProps) {
  return (
    <RNTextInput
      style={[
        styles.input,
        error && styles.inputError,
        style,
      ]}
      placeholderTextColor={colors.textMuted}
      {...props}
    />
  )
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
})
