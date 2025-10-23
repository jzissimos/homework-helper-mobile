// Statistics Screen - View learning progress and achievements
import { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native'
import { useAuth } from '../../src/contexts/AuthContext'
import { api, Conversation } from '../../src/services/api'
import { Card } from '../../src/components/Card'
import { colors } from '../../src/theme/colors'

interface Stats {
  totalSessions: number
  totalMinutes: number
  totalPoints: number
  averageSessionLength: number
  longestSession: number
  favoriteSubject: string
  currentStreak: number
  bestStreak: number
}

export default function StatsScreen() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [recentConversations, setRecentConversations] = useState<Conversation[]>([])

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    try {
      // Get all conversations for stats calculation
      const history = await api.getConversationHistory({ limit: 100 })
      const conversations = history.conversations

      setRecentConversations(conversations.slice(0, 5))

      // Calculate statistics
      const totalSessions = conversations.length
      const totalMinutes = conversations.reduce((sum, conv) => sum + (conv.durationMinutes || 0), 0)
      const totalPoints = user?.totalPoints || 0

      const averageSessionLength = totalSessions > 0
        ? Math.round(totalMinutes / totalSessions)
        : 0

      const longestSession = conversations.reduce(
        (max, conv) => Math.max(max, conv.durationMinutes || 0),
        0
      )

      // Find favorite subject (most common topic)
      const topicCounts: { [key: string]: number } = {}
      conversations.forEach(conv => {
        if (conv.topic) {
          topicCounts[conv.topic] = (topicCounts[conv.topic] || 0) + 1
        }
      })
      const favoriteSubject = Object.entries(topicCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None yet'

      // Calculate streak (consecutive days with sessions)
      const currentStreak = calculateStreak(conversations)
      const bestStreak = currentStreak // For now, same as current

      setStats({
        totalSessions,
        totalMinutes,
        totalPoints,
        averageSessionLength,
        longestSession,
        favoriteSubject,
        currentStreak,
        bestStreak,
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  function calculateStreak(conversations: Conversation[]): number {
    if (conversations.length === 0) return 0

    const dates = conversations
      .map(conv => new Date(conv.startedAt).toDateString())
      .filter((date, index, self) => self.indexOf(date) === index)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

    let streak = 0
    let currentDate = new Date()

    for (const dateStr of dates) {
      const date = new Date(dateStr)
      const daysDiff = Math.floor(
        (currentDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (daysDiff === streak) {
        streak++
      } else {
        break
      }
    }

    return streak
  }

  async function handleRefresh() {
    setRefreshing(true)
    await loadStats()
    setRefreshing(false)
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  if (!stats) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No statistics yet!</Text>
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Your Learning Journey</Text>
        <Text style={styles.subtitle}>{user?.name}'s Progress</Text>
      </View>

      {/* Main Stats Grid */}
      <View style={styles.statsGrid}>
        <Card variant="elevated" style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalPoints}</Text>
          <Text style={styles.statLabel}>Total Points</Text>
        </Card>

        <Card variant="elevated" style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalSessions}</Text>
          <Text style={styles.statLabel}>Sessions</Text>
        </Card>

        <Card variant="elevated" style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalMinutes}</Text>
          <Text style={styles.statLabel}>Minutes</Text>
        </Card>

        <Card variant="elevated" style={styles.statCard}>
          <Text style={styles.statValue}>{stats.currentStreak}🔥</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </Card>
      </View>

      {/* Detailed Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>

        <Card variant="outlined" style={styles.detailCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Average Session</Text>
            <Text style={styles.detailValue}>{stats.averageSessionLength} min</Text>
          </View>
        </Card>

        <Card variant="outlined" style={styles.detailCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Longest Session</Text>
            <Text style={styles.detailValue}>{stats.longestSession} min</Text>
          </View>
        </Card>

        <Card variant="outlined" style={styles.detailCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Favorite Subject</Text>
            <Text style={styles.detailValue}>{stats.favoriteSubject}</Text>
          </View>
        </Card>

        <Card variant="outlined" style={styles.detailCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Best Streak</Text>
            <Text style={styles.detailValue}>{stats.bestStreak} days 🔥</Text>
          </View>
        </Card>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Sessions</Text>
        {recentConversations.map((conv) => (
          <Card key={conv.id} variant="outlined" style={styles.activityCard}>
            <Text style={styles.activityTopic}>{conv.topic || 'General'}</Text>
            <View style={styles.activityDetails}>
              <Text style={styles.activityDetail}>
                {conv.durationMinutes || 0} min
              </Text>
              <Text style={styles.activityPoints}>
                +{conv.pointsEarned} pts
              </Text>
            </View>
          </Card>
        ))}
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
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  statCard: {
    width: '47%',
    alignItems: 'center',
    padding: 20,
  },
  statValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
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
  detailCard: {
    marginBottom: 12,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 16,
    color: colors.text,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  activityCard: {
    marginBottom: 12,
    padding: 16,
  },
  activityTopic: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  activityDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  activityDetail: {
    fontSize: 14,
    color: colors.textLight,
  },
  activityPoints: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
  },
  emptyText: {
    fontSize: 18,
    color: colors.textLight,
  },
})
