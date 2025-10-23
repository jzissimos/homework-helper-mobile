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
  TouchableOpacity,
  Alert,
} from 'react-native'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAuth } from '../../src/contexts/AuthContext'
import { api, Conversation } from '../../src/services/api'
import { Button } from '../../src/components/Button'
import { Card } from '../../src/components/Card'
import { colors } from '../../src/theme/colors'
import {
  GOAL_PRESETS,
  getGoalsStatus,
  isInCurrentWeek,
  getDaysRemainingInWeek,
} from '../../src/constants/goals'

export default function HomeScreen() {
  const { user, refreshUser } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [weeklyGoals, setWeeklyGoals] = useState({ sessions: 5, minutes: 60, points: 120 })
  const [weekStats, setWeekStats] = useState({ sessions: 0, minutes: 0, points: 0 })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [profile, history, savedGoals] = await Promise.all([
        refreshUser(),
        api.getConversationHistory({ limit: 50 }),
        AsyncStorage.getItem('weekly_goals'),
      ])

      setConversations(history.conversations.slice(0, 10))

      // Load saved goals or use default
      if (savedGoals) {
        setWeeklyGoals(JSON.parse(savedGoals))
      }

      // Calculate this week's stats
      const thisWeekConvs = history.conversations.filter((conv) =>
        isInCurrentWeek(new Date(conv.startedAt))
      )

      const weekSessions = thisWeekConvs.length
      const weekMinutes = thisWeekConvs.reduce(
        (sum, conv) => sum + (conv.durationMinutes || 0),
        0
      )
      const weekPoints = thisWeekConvs.reduce(
        (sum, conv) => sum + (conv.pointsEarned || 0),
        0
      )

      setWeekStats({ sessions: weekSessions, minutes: weekMinutes, points: weekPoints })
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

  async function handleGoalChange() {
    Alert.alert(
      'Change Weekly Goal',
      'Choose your commitment level:',
      GOAL_PRESETS.map((preset) => ({
        text: `${preset.emoji} ${preset.name} - ${preset.sessions} sessions/week`,
        onPress: async () => {
          const newGoals = {
            sessions: preset.sessions,
            minutes: preset.minutes,
            points: preset.points,
          }
          setWeeklyGoals(newGoals)
          await AsyncStorage.setItem('weekly_goals', JSON.stringify(newGoals))
          Alert.alert('Goal Updated!', `You're now aiming for ${preset.name} mode.`)
        },
      })).concat([{ text: 'Cancel', style: 'cancel' }])
    )
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

      {/* Weekly Goals */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>This Week's Goal</Text>
          <TouchableOpacity onPress={handleGoalChange}>
            <Text style={styles.changeGoalText}>Change</Text>
          </TouchableOpacity>
        </View>

        <Card variant="elevated" style={styles.goalsCard}>
          {(() => {
            const goalsStatus = getGoalsStatus(
              weekStats.sessions,
              weekStats.minutes,
              weekStats.points,
              weeklyGoals
            )

            return (
              <>
                <View style={styles.goalsHeader}>
                  <Text style={styles.goalsProgress}>
                    {goalsStatus.overallProgress}%
                  </Text>
                  <View style={styles.goalsInfo}>
                    <Text style={styles.goalsTitle}>
                      {goalsStatus.allComplete ? '🎉 Goal Complete!' : '💪 Keep Going!'}
                    </Text>
                    <Text style={styles.goalsDaysLeft}>
                      {getDaysRemainingInWeek()} days left
                    </Text>
                  </View>
                </View>

                <View style={styles.goalsList}>
                  <View style={styles.goalItem}>
                    <View style={styles.goalItemHeader}>
                      <Text style={styles.goalItemLabel}>Sessions</Text>
                      <Text style={styles.goalItemValue}>
                        {weekStats.sessions}/{weeklyGoals.sessions}
                      </Text>
                    </View>
                    <View style={styles.goalProgressBar}>
                      <View
                        style={[
                          styles.goalProgressFill,
                          {
                            width: `${Math.min(
                              100,
                              (weekStats.sessions / weeklyGoals.sessions) * 100
                            )}%`,
                          },
                        ]}
                      />
                    </View>
                  </View>

                  <View style={styles.goalItem}>
                    <View style={styles.goalItemHeader}>
                      <Text style={styles.goalItemLabel}>Minutes</Text>
                      <Text style={styles.goalItemValue}>
                        {weekStats.minutes}/{weeklyGoals.minutes}
                      </Text>
                    </View>
                    <View style={styles.goalProgressBar}>
                      <View
                        style={[
                          styles.goalProgressFill,
                          {
                            width: `${Math.min(
                              100,
                              (weekStats.minutes / weeklyGoals.minutes) * 100
                            )}%`,
                          },
                        ]}
                      />
                    </View>
                  </View>

                  <View style={styles.goalItem}>
                    <View style={styles.goalItemHeader}>
                      <Text style={styles.goalItemLabel}>Points</Text>
                      <Text style={styles.goalItemValue}>
                        {weekStats.points}/{weeklyGoals.points}
                      </Text>
                    </View>
                    <View style={styles.goalProgressBar}>
                      <View
                        style={[
                          styles.goalProgressFill,
                          {
                            width: `${Math.min(
                              100,
                              (weekStats.points / weeklyGoals.points) * 100
                            )}%`,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              </>
            )
          })()}
        </Card>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  changeGoalText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  goalsCard: {
    padding: 20,
  },
  goalsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  goalsProgress: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
  },
  goalsInfo: {
    flex: 1,
  },
  goalsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  goalsDaysLeft: {
    fontSize: 12,
    color: colors.textLight,
  },
  goalsList: {
    gap: 16,
  },
  goalItem: {
    gap: 8,
  },
  goalItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalItemLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  goalItemValue: {
    fontSize: 14,
    color: colors.textLight,
  },
  goalProgressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
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
