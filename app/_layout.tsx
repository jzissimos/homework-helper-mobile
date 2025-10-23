// Root Layout - Wraps entire app with AuthProvider
import { Slot } from 'expo-router'
import { AuthProvider } from '../src/contexts/AuthContext'

export default function RootLayout() {
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  )
}
