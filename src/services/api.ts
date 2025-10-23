// API Service - Handles all backend communication
import axios, { AxiosInstance } from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ENV } from '../config/env'

// ===== TYPES =====

export interface User {
  id: string
  email: string
  name: string
  age: number
  selectedVoice: string
  totalPoints: number
  createdAt: string
}

export interface Voice {
  id: string
  name: string
  description: string
  sampleText: string
  ageRange: string
  gender: string
  personality: string
  recommended?: boolean
}

export interface Conversation {
  id: string
  startedAt: string
  endedAt: string | null
  durationMinutes: number | null
  topic: string | null
  pointsEarned: number
  hadErrors: boolean
}

export interface ConversationSession {
  conversationId: string
  sessionToken: string
  voice: string
  userName: string
  userAge: number
}

// ===== API CLIENT =====

class APIClient {
  private client: AxiosInstance
  private token: string | null = null

  constructor() {
    this.client = axios.create({
      baseURL: ENV.API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Load token from storage on init
    this.loadToken()

    // Add token to requests automatically
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`
      }
      return config
    })
  }

  // ===== TOKEN MANAGEMENT =====

  private async loadToken() {
    try {
      const token = await AsyncStorage.getItem('auth_token')
      if (token) {
        this.token = token
      }
    } catch (error) {
      console.error('Failed to load token:', error)
    }
  }

  async setToken(token: string) {
    this.token = token
    await AsyncStorage.setItem('auth_token', token)
  }

  async clearToken() {
    this.token = null
    await AsyncStorage.removeItem('auth_token')
  }

  getToken(): string | null {
    return this.token
  }

  // ===== AUTH ENDPOINTS =====

  async register(data: {
    email: string
    password: string
    name: string
    age: number
  }): Promise<{ token: string; user: User }> {
    const response = await this.client.post('/api/auth/register', data)
    const { token, user } = response.data
    await this.setToken(token)
    return { token, user }
  }

  async login(data: {
    email: string
    password: string
  }): Promise<{ token: string; user: User }> {
    const response = await this.client.post('/api/auth/login', data)
    const { token, user } = response.data
    await this.setToken(token)
    return { token, user }
  }

  async logout() {
    await this.clearToken()
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.client.get('/api/auth/me')
    return response.data.user
  }

  // ===== PROFILE ENDPOINTS =====

  async getProfile(): Promise<User> {
    const response = await this.client.get('/api/profile')
    return response.data.user
  }

  async updateProfile(data: {
    name?: string
    selectedVoice?: string
  }): Promise<User> {
    const response = await this.client.patch('/api/profile', data)
    return response.data.user
  }

  // ===== VOICE ENDPOINTS =====

  async getVoices(age?: number): Promise<Voice[]> {
    const params = age ? { age } : {}
    const response = await this.client.get('/api/voices', { params })
    return response.data.voices
  }

  // ===== CONVERSATION ENDPOINTS =====

  async startConversation(): Promise<ConversationSession> {
    const response = await this.client.post('/api/conversation')
    return response.data
  }

  async endConversation(
    conversationId: string,
    data: {
      durationMinutes?: number
      topic?: string
      pointsEarned?: number
      transcript?: any
      hadErrors?: boolean
      errorLog?: any
    }
  ): Promise<Conversation> {
    const response = await this.client.patch(
      `/api/conversation/${conversationId}/end`,
      data
    )
    return response.data.conversation
  }

  async getConversationHistory(params?: {
    limit?: number
    offset?: number
  }): Promise<{
    conversations: Conversation[]
    pagination: {
      total: number
      limit: number
      offset: number
      hasMore: boolean
    }
  }> {
    const response = await this.client.get('/api/conversations', { params })
    return response.data
  }
}

// Export singleton instance
export const api = new APIClient()
