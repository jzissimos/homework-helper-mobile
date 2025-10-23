// Root Layout - Wraps entire app with AuthProvider and ErrorBoundary
import { Slot } from 'expo-router'
import { AuthProvider } from '../src/contexts/AuthContext'
import { ErrorBoundary } from '../src/components/ErrorBoundary'

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Slot />
      </AuthProvider>
    </ErrorBoundary>
  )
}
