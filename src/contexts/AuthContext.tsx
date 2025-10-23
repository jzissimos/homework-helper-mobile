// Auth Context - Manages authentication state across the app
import React, { createContext, useState, useContext, useEffect } from 'react'
import { api, User } from '../services/api'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string, age: number) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user on app start if token exists
  useEffect(() => {
    loadUser()
  }, [])

  async function loadUser() {
    try {
      if (api.getToken()) {
        const currentUser = await api.getCurrentUser()
        setUser(currentUser)
      }
    } catch (error) {
      console.error('Failed to load user:', error)
      // Token might be expired, clear it
      await api.clearToken()
    } finally {
      setIsLoading(false)
    }
  }

  async function login(email: string, password: string) {
    try {
      const { user: loggedInUser } = await api.login({ email, password })
      setUser(loggedInUser)
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed')
    }
  }

  async function register(email: string, password: string, name: string, age: number) {
    try {
      const { user: newUser } = await api.register({ email, password, name, age })
      setUser(newUser)
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed')
    }
  }

  async function logout() {
    await api.logout()
    setUser(null)
  }

  async function refreshUser() {
    try {
      const currentUser = await api.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Failed to refresh user:', error)
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
