// Home Screen - Main dashboard with points and conversation history
import { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  FlatList,
  ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { useAuth } from '../../src/contexts/AuthContext'
import { api, Conversation } from '../../src/services/api'
import { Button } from '../../src/components/Button'
import { colors } from '../../src/theme/colors'

export default function HomeScreen() {
  const { user, refreshUser } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [profile, history] = await Promise.all([
        refreshUser(),
        api.getConversationHistory({ limit: 10 }),
      ])
      setConversations(history.conversations)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleRefresh() {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))

    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header with name and points */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hi, {user?.name}!</Text>
        <View style={styles.pointsCard}>
          <Text style={styles.pointsLabel}>Total Points</Text>
          <Text style={styles.pointsValue}>{user?.totalPoints || 0}</Text>
        </View>
      </View>

      {/* Start Learning Button */}
      <View style={styles.section}>
        <Button
          title="🎓 Start Learning"
          onPress={() => router.push('/(tabs)/topic-select')}
          variant="primary"
        />
      </View>

      {/* Recent Conversations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Sessions</Text>
        {conversations.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No sessions yet!</Text>
            <Text style={styles.emptySubtext}>
              Tap "Start Learning" to begin your first session
            </Text>
          </View>
        ) : (
          <View style={styles.conversationList}>
            {conversations.map((conv) => (
              <View key={conv.id} style={styles.conversationCard}>
                <View style={styles.conversationHeader}>
                  <Text style={styles.conversationTopic}>
                    {conv.topic || 'General Learning'}
                  </Text>
                  <Text style={styles.conversationTime}>
                    {formatDate(conv.startedAt)}
                  </Text>
                </View>
                <View style={styles.conversationFooter}>
                  <Text style={styles.conversationDuration}>
                    {conv.durationMinutes ? `${conv.durationMinutes} min` : '—'}
                  </Text>
                  <Text style={styles.conversationPoints}>
                    +{conv.pointsEarned} points
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
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
  header: {
    padding: 24,
    backgroundColor: colors.primary,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.surface,
    marginBottom: 16,
  },
  pointsCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  pointsLabel: {
    fontSize: 14,
    color: colors.surface,
    opacity: 0.9,
    marginBottom: 4,
  },
  pointsValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.surface,
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
  },
  conversationList: {
    gap: 12,
  },
  conversationCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  conversationTopic: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  conversationTime: {
    fontSize: 12,
    color: colors.textMuted,
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  conversationDuration: {
    fontSize: 14,
    color: colors.textLight,
  },
  conversationPoints: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
  },
})
