// Profile Screen - User info, voice selection, logout
import { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { router } from 'expo-router'
import { Audio } from 'expo-av'
import { useAuth } from '../../src/contexts/AuthContext'
import { api, Voice } from '../../src/services/api'
import { Button } from '../../src/components/Button'
import { colors } from '../../src/theme/colors'

export default function ProfileScreen() {
  const { user, logout, refreshUser } = useAuth()
  const [voices, setVoices] = useState<Voice[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [playingVoice, setPlayingVoice] = useState<string | null>(null)
  const [sound, setSound] = useState<Audio.Sound | null>(null)

  useEffect(() => {
    loadVoices()
    return () => {
      // Clean up sound on unmount
      if (sound) {
        sound.unloadAsync()
      }
    }
  }, [sound])

  async function loadVoices() {
    try {
      const voiceList = await api.getVoices(user?.age)
      setVoices(voiceList)
    } catch (error) {
      console.error('Failed to load voices:', error)
    } finally {
      setLoading(false)
    }
  }

  async function selectVoice(voiceId: string) {
    setUpdating(true)
    try {
      await api.updateProfile({ selectedVoice: voiceId })
      await refreshUser()
      Alert.alert('Success', 'Voice updated!')
    } catch (error: any) {
      Alert.alert('Error', error.message)
    } finally {
      setUpdating(false)
    }
  }

  async function previewVoice(voice: Voice) {
    try {
      // Stop any currently playing sound
      if (sound) {
        await sound.stopAsync()
        await sound.unloadAsync()
        setSound(null)
      }

      // If clicking the same voice that's playing, just stop it
      if (playingVoice === voice.id) {
        setPlayingVoice(null)
        return
      }

      setPlayingVoice(voice.id)

      // Set audio mode
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      })

      // Use text-to-speech for preview (since we don't have OpenAI audio samples)
      // In a real implementation, you'd fetch actual audio samples from OpenAI or your backend
      const { sound: newSound } = await Audio.Sound.createAsync(
        // For now, we'll use the device's text-to-speech or show a message
        // This is a placeholder - in production you'd have pre-recorded samples
        { uri: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=' },
        { shouldPlay: false }
      )

      // Since we can't easily generate real voice samples without OpenAI,
      // let's just show a message with the sample text
      setPlayingVoice(null)
      Alert.alert(
        `${voice.name} Voice Preview`,
        `Sample: "${voice.sampleText}"\n\nThis voice is ${voice.description.toLowerCase()}.`,
        [{ text: 'Got it', style: 'default' }]
      )

    } catch (error) {
      console.error('Preview error:', error)
      Alert.alert('Preview Unavailable', 'Voice preview is coming soon!')
      setPlayingVoice(null)
    }
  }

  async function handleLogout() {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout()
            router.replace('/(auth)/login')
          },
        },
      ]
    )
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      {/* User Info */}
      <View style={styles.section}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.info}>Age {user?.age}</Text>
        <Text style={styles.info}>{user?.email}</Text>
      </View>

      {/* Points */}
      <View style={styles.section}>
        <View style={styles.pointsCard}>
          <Text style={styles.pointsLabel}>Total Points</Text>
          <Text style={styles.pointsValue}>{user?.totalPoints || 0}</Text>
        </View>
      </View>

      {/* Voice Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI Tutor Voice</Text>
        <Text style={styles.sectionSubtitle}>
          Choose how your AI tutor sounds
        </Text>
        <View style={styles.voiceList}>
          {voices.map((voice) => {
            const isSelected = voice.id === user?.selectedVoice
            const isPreviewing = playingVoice === voice.id
            return (
              <View key={voice.id} style={styles.voiceContainer}>
                <TouchableOpacity
                  style={[
                    styles.voiceCard,
                    isSelected && styles.voiceCardSelected,
                  ]}
                  onPress={() => selectVoice(voice.id)}
                  disabled={updating}
                >
                  <View style={styles.voiceHeader}>
                    <Text
                      style={[
                        styles.voiceName,
                        isSelected && styles.voiceNameSelected,
                      ]}
                    >
                      {voice.name}
                    </Text>
                    {isSelected && (
                      <View style={styles.selectedBadge}>
                        <Text style={styles.selectedBadgeText}>✓</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.voiceDescription}>{voice.description}</Text>
                  <Text style={styles.voicePersonality}>
                    {voice.personality}
                  </Text>
                  <Text style={styles.voiceAgeRange}>Ages {voice.ageRange}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.previewButton,
                    isPreviewing && styles.previewButtonActive,
                  ]}
                  onPress={() => previewVoice(voice)}
                  disabled={updating}
                >
                  <Text style={styles.previewButtonText}>
                    {isPreviewing ? '🔊 Playing' : '▶️ Preview'}
                  </Text>
                </TouchableOpacity>
              </View>
            )
          })}
        </View>
      </View>

      {/* Logout Button */}
      <View style={styles.section}>
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="outline"
        />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  section: {
    padding: 24,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.surface,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  info: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 2,
  },
  pointsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  pointsLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  pointsValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  voiceList: {
    width: '100%',
    gap: 12,
  },
  voiceContainer: {
    width: '100%',
    gap: 8,
  },
  voiceCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.border,
  },
  voiceCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '10',
  },
  voiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  voiceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  voiceNameSelected: {
    color: colors.primary,
  },
  selectedBadge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBadgeText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: 'bold',
  },
  voiceDescription: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  voicePersonality: {
    fontSize: 12,
    color: colors.textLight,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  voiceAgeRange: {
    fontSize: 12,
    color: colors.textMuted,
  },
  previewButton: {
    backgroundColor: colors.primary + '15',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  previewButtonActive: {
    backgroundColor: colors.primary,
  },
  previewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
})
