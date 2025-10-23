// Conversation Screen - Voice learning session with OpenAI Realtime API
import { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native'
import { Audio } from 'expo-av'
import { router, useLocalSearchParams } from 'expo-router'
import { useAuth } from '../../src/contexts/AuthContext'
import { api } from '../../src/services/api'
import { Button } from '../../src/components/Button'
import { colors } from '../../src/theme/colors'
import { getTopicById } from '../../src/constants/topics'

type SessionState = 'idle' | 'connecting' | 'connected' | 'speaking' | 'ending'

export default function ConversationScreen() {
  const { user } = useAuth()
  const params = useLocalSearchParams()
  const topicId = params.topic as string
  const topic = topicId ? getTopicById(topicId) : null

  const [state, setState] = useState<SessionState>('idle')
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // WebSocket and audio refs
  const wsRef = useRef<WebSocket | null>(null)
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<Date | null>(null)

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current
  const fadeAnim = useRef(new Animated.Value(1)).current
  const scaleAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    // Request microphone permissions on mount
    requestAudioPermissions()

    return () => {
      // Cleanup on unmount
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  useEffect(() => {
    // Animate state transitions
    if (state === 'connected' || state === 'speaking') {
      // Pulse animation for active states
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start()

      // Fade in effect
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start()
    } else {
      pulseAnim.setValue(1)
      fadeAnim.setValue(0.7)
    }

    // Scale animation on state change
    scaleAnim.setValue(0.9)
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start()
  }, [state])

  async function requestAudioPermissions() {
    try {
      const { status } = await Audio.requestPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert(
          'Microphone Permission Required',
          'Please enable microphone access to use the learning session.'
        )
      }
    } catch (error) {
      console.error('Permission request error:', error)
    }
  }

  async function startSession() {
    setState('connecting')
    setError(null)

    try {
      // Get session token from backend
      const session = await api.startConversation()
      setConversationId(session.conversationId)
      setSessionToken(session.sessionToken)

      // Connect to OpenAI Realtime API
      await connectToOpenAI(session.sessionToken)

      // Start duration timer
      startTimeRef.current = new Date()
      durationIntervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = Math.floor(
            (new Date().getTime() - startTimeRef.current.getTime()) / 1000
          )
          setDuration(elapsed)
        }
      }, 1000)

      setState('connected')
    } catch (error: any) {
      console.error('Failed to start session:', error)
      setError(error.message || 'Failed to start session')
      setState('idle')
      Alert.alert('Error', 'Failed to start learning session. Please try again.')
    }
  }

  async function connectToOpenAI(token: string) {
    return new Promise<void>((resolve, reject) => {
      try {
        const ws = new WebSocket('wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'OpenAI-Beta': 'realtime=v1',
          },
        })

        ws.onopen = () => {
          console.log('WebSocket connected')

          // Send session update with audio configuration
          ws.send(JSON.stringify({
            type: 'session.update',
            session: {
              turn_detection: { type: 'server_vad' },
              input_audio_format: 'pcm16',
              output_audio_format: 'pcm16',
              voice: user?.selectedVoice || 'shimmer',
              instructions: `You are a helpful AI tutor. You're talking with ${user?.name}, who is ${user?.age} years old. Use Socratic teaching - guide them to discover answers through questions rather than giving direct answers.`,
              temperature: 0.8,
              max_response_output_tokens: 4096,
            }
          }))

          wsRef.current = ws
          resolve()
        }

        ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          reject(new Error('WebSocket connection failed'))
        }

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data)
            handleWebSocketMessage(message)
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error)
          }
        }

        ws.onclose = () => {
          console.log('WebSocket closed')
          if (state === 'connected' || state === 'speaking') {
            setError('Connection lost')
            setState('idle')
          }
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  function handleWebSocketMessage(message: any) {
    console.log('WebSocket message:', message.type)

    switch (message.type) {
      case 'conversation.item.created':
        if (message.item?.role === 'assistant') {
          setState('speaking')
        }
        break
      case 'response.done':
        setState('connected')
        break
      case 'error':
        console.error('OpenAI error:', message)
        setError(message.error?.message || 'An error occurred')
        break
    }
  }

  async function endSession() {
    setState('ending')

    try {
      // Close WebSocket
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }

      // Stop duration timer
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
        durationIntervalRef.current = null
      }

      // Calculate duration in minutes
      const durationMinutes = Math.ceil(duration / 60)

      // Save conversation results
      if (conversationId) {
        await api.endConversation(conversationId, {
          durationMinutes,
          topic: topic ? topic.name : 'General',
          pointsEarned: Math.max(1, Math.floor(durationMinutes * 2)), // 2 points per minute
        })
      }

      Alert.alert(
        'Session Complete!',
        `Great work! You earned ${Math.max(1, Math.floor(durationMinutes * 2))} points.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setState('idle')
              setDuration(0)
              setConversationId(null)
              setSessionToken(null)
              router.push('/(tabs)')
            },
          },
        ]
      )
    } catch (error: any) {
      console.error('Failed to end session:', error)
      Alert.alert('Error', 'Failed to save session. Please try again.')
      setState('connected')
    }
  }

  function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <View style={styles.container}>
      {/* Status Header */}
      <View style={styles.header}>
        {topic && (
          <View style={styles.topicBadge}>
            <Text style={styles.topicEmoji}>{topic.emoji}</Text>
            <Text style={styles.topicName}>{topic.name}</Text>
          </View>
        )}
        <Text style={styles.title}>
          {state === 'idle' && 'Ready to Learn'}
          {state === 'connecting' && 'Connecting...'}
          {state === 'connected' && 'Listening...'}
          {state === 'speaking' && 'AI Tutor Speaking...'}
          {state === 'ending' && 'Saving Session...'}
        </Text>
        {(state === 'connected' || state === 'speaking') && (
          <Text style={styles.duration}>{formatDuration(duration)}</Text>
        )}
      </View>

      {/* Visual Indicator */}
      <View style={styles.visualContainer}>
        {state === 'connecting' || state === 'ending' ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>
              {state === 'connecting' ? 'Connecting to AI Tutor...' : 'Saving your progress...'}
            </Text>
          </View>
        ) : state === 'idle' ? (
          <Animated.View
            style={[
              styles.idleCircle,
              { transform: [{ scale: scaleAnim }] }
            ]}
          >
            <Text style={styles.idleIcon}>🎓</Text>
          </Animated.View>
        ) : (
          <View style={styles.activeContainer}>
            {/* Outer glow rings */}
            <Animated.View
              style={[
                styles.glowRing,
                styles.glowRingOuter,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: pulseAnim }],
                  borderColor: state === 'speaking' ? colors.secondary : colors.primary,
                },
              ]}
            />
            <Animated.View
              style={[
                styles.glowRing,
                styles.glowRingMiddle,
                {
                  opacity: fadeAnim.interpolate({
                    inputRange: [0.7, 1],
                    outputRange: [0.3, 0.6],
                  }),
                  transform: [{
                    scale: pulseAnim.interpolate({
                      inputRange: [1, 1.2],
                      outputRange: [1, 1.15],
                    })
                  }],
                  borderColor: state === 'speaking' ? colors.secondary : colors.primary,
                },
              ]}
            />
            {/* Main circle */}
            <Animated.View
              style={[
                styles.activeCircle,
                {
                  transform: [{ scale: scaleAnim }],
                  backgroundColor: state === 'speaking' ? colors.secondary : colors.primary,
                  opacity: fadeAnim,
                },
              ]}
            >
              <Text style={styles.activeIcon}>
                {state === 'speaking' ? '🗣️' : '👂'}
              </Text>
            </Animated.View>
          </View>
        )}
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Instructions */}
      {state === 'idle' && (
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            Tap "Start Learning" to begin your voice session with the AI tutor.
          </Text>
          <Text style={styles.instructionText}>
            Ask questions about any homework topic and the tutor will guide you to discover the answers!
          </Text>
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        {state === 'idle' ? (
          <Button
            title="Start Learning"
            onPress={startSession}
            variant="primary"
          />
        ) : state === 'connected' || state === 'speaking' ? (
          <Button
            title="End Session"
            onPress={endSession}
            variant="secondary"
          />
        ) : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  topicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
    gap: 8,
  },
  topicEmoji: {
    fontSize: 20,
  },
  topicName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  duration: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
  },
  visualContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 8,
  },
  idleCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  idleIcon: {
    fontSize: 80,
  },
  activeContainer: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    borderRadius: 1000,
    borderWidth: 2,
  },
  glowRingOuter: {
    width: 280,
    height: 280,
  },
  glowRingMiddle: {
    width: 240,
    height: 240,
  },
  activeCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  activeIcon: {
    fontSize: 80,
  },
  errorContainer: {
    backgroundColor: colors.error + '20',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
    fontSize: 14,
  },
  instructions: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    gap: 12,
  },
  instructionText: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
  },
  controls: {
    marginBottom: 24,
  },
})
