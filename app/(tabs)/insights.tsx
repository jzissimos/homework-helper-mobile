// Parent Insights Screen - Learning analytics and progress overview
import { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native'
import { useAuth } from '../../src/contexts/AuthContext'
import { api, Conversation } from '../../src/services/api'
import { Card } from '../../src/components/Card'
import { colors } from '../../src/theme/colors'
import { isInCurrentWeek } from '../../src/constants/goals'

const { width } = Dimensions.get('window')

interface SubjectStats {
  subject: string
  sessions: number
  minutes: number
  averageLength: number
  lastSession: string
}

interface TimeOfDayStats {
  morning: number   // 6am-12pm
  afternoon: number // 12pm-6pm
  evening: number   // 6pm-10pm
}

interface LearningInsights {
  totalSessions: number
  totalMinutes: number
  averageSessionLength: number
  longestSession: number
  thisWeekSessions: number
  thisWeekMinutes: number
  subjectBreakdown: SubjectStats[]
  timeOfDayPreference: TimeOfDayStats
  consistencyScore: number // 0-100
  engagementTrend: 'increasing' | 'steady' | 'decreasing'
  recommendedTime: string
}

export default function InsightsScreen() {
  const { user } = useAuth()
  const [insights, setInsights] = useState<LearningInsights | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadInsights()
  }, [])

  async function loadInsights() {
    try {
      const history = await api.getConversationHistory({ limit: 100 })
      const conversations = history.conversations

      // Calculate insights
      const totalSessions = conversations.length
      const totalMinutes = conversations.reduce((sum, c) => sum + (c.durationMinutes || 0), 0)
      const averageSessionLength = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0
      const longestSession = Math.max(...conversations.map(c => c.durationMinutes || 0))

      // This week stats
      const thisWeekConvs = conversations.filter(c => isInCurrentWeek(new Date(c.startedAt)))
      const thisWeekSessions = thisWeekConvs.length
      const thisWeekMinutes = thisWeekConvs.reduce((sum, c) => sum + (c.durationMinutes || 0), 0)

      // Subject breakdown
      const subjectMap = new Map<string, { sessions: number; minutes: number; lastSession: string }>()
      conversations.forEach(conv => {
        const subject = conv.topic || 'General'
        if (!subjectMap.has(subject)) {
          subjectMap.set(subject, { sessions: 0, minutes: 0, lastSession: conv.startedAt })
        }
        const stats = subjectMap.get(subject)!
        stats.sessions++
        stats.minutes += conv.durationMinutes || 0
        if (new Date(conv.startedAt) > new Date(stats.lastSession)) {
          stats.lastSession = conv.startedAt
        }
      })

      const subjectBreakdown: SubjectStats[] = Array.from(subjectMap.entries())
        .map(([subject, stats]) => ({
          subject,
          sessions: stats.sessions,
          minutes: stats.minutes,
          averageLength: Math.round(stats.minutes / stats.sessions),
          lastSession: stats.lastSession,
        }))
        .sort((a, b) => b.sessions - a.sessions)

      // Time of day analysis
      const timeOfDay: TimeOfDayStats = { morning: 0, afternoon: 0, evening: 0 }
      conversations.forEach(conv => {
        const hour = new Date(conv.startedAt).getHours()
        if (hour >= 6 && hour < 12) timeOfDay.morning++
        else if (hour >= 12 && hour < 18) timeOfDay.afternoon++
        else if (hour >= 18 && hour < 22) timeOfDay.evening++
      })

      // Recommended time
      const maxTime = Math.max(timeOfDay.morning, timeOfDay.afternoon, timeOfDay.evening)
      let recommendedTime = 'Morning (6am-12pm)'
      if (maxTime === timeOfDay.afternoon) recommendedTime = 'Afternoon (12pm-6pm)'
      else if (maxTime === timeOfDay.evening) recommendedTime = 'Evening (6pm-10pm)'

      // Consistency score (based on weekly activity)
      const last4Weeks = Array.from({ length: 4 }, (_, i) => {
        const weekStart = new Date()
        weekStart.setDate(weekStart.getDate() - (7 * (i + 1)))
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekEnd.getDate() + 7)
        return conversations.filter(c => {
          const date = new Date(c.startedAt)
          return date >= weekStart && date < weekEnd
        }).length
      })
      const avgWeeklySessions = last4Weeks.reduce((a, b) => a + b, 0) / 4
      const consistencyScore = Math.min(100, Math.round((avgWeeklySessions / 5) * 100))

      // Engagement trend
      const recentWeeks = last4Weeks.slice(0, 2)
      const olderWeeks = last4Weeks.slice(2, 4)
      const recentAvg = recentWeeks.reduce((a, b) => a + b, 0) / 2
      const olderAvg = olderWeeks.reduce((a, b) => a + b, 0) / 2
      let engagementTrend: 'increasing' | 'steady' | 'decreasing' = 'steady'
      if (recentAvg > olderAvg * 1.2) engagementTrend = 'increasing'
      else if (recentAvg < olderAvg * 0.8) engagementTrend = 'decreasing'

      setInsights({
        totalSessions,
        totalMinutes,
        averageSessionLength,
        longestSession,
        thisWeekSessions,
        thisWeekMinutes,
        subjectBreakdown,
        timeOfDayPreference: timeOfDay,
        consistencyScore,
        engagementTrend,
        recommendedTime,
      })
    } catch (error) {
      console.error('Failed to load insights:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleRefresh() {
    setRefreshing(true)
    await loadInsights()
    setRefreshing(false)
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  if (!insights) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No data yet!</Text>
      </View>
    )
  }

  const getTrendEmoji = () => {
    switch (insights.engagementTrend) {
      case 'increasing': return '📈'
      case 'decreasing': return '📉'
      default: return '➡️'
    }
  }

  const getTrendText = () => {
    switch (insights.engagementTrend) {
      case 'increasing': return 'Increasing'
      case 'decreasing': return 'Decreasing'
      default: return 'Steady'
    }
  }

  const getTrendColor = () => {
    switch (insights.engagementTrend) {
      case 'increasing': return colors.success
      case 'decreasing': return colors.error
      default: return colors.textLight
    }
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
        <Text style={styles.title}>Parent Insights</Text>
        <Text style={styles.subtitle}>{user?.name}'s Learning Analytics</Text>
      </View>

      {/* Overview Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          <Card variant="elevated" style={styles.statCard}>
            <Text style={styles.statValue}>{insights.totalSessions}</Text>
            <Text style={styles.statLabel}>Total Sessions</Text>
          </Card>
          <Card variant="elevated" style={styles.statCard}>
            <Text style={styles.statValue}>{insights.totalMinutes}</Text>
            <Text style={styles.statLabel}>Total Minutes</Text>
          </Card>
          <Card variant="elevated" style={styles.statCard}>
            <Text style={styles.statValue}>{insights.averageSessionLength}</Text>
            <Text style={styles.statLabel}>Avg Length</Text>
          </Card>
          <Card variant="elevated" style={styles.statCard}>
            <Text style={styles.statValue}>{insights.thisWeekSessions}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </Card>
        </View>
      </View>

      {/* Engagement Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Engagement</Text>

        <Card variant="outlined" style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Consistency Score</Text>
            <Text style={[styles.metricValue, { color: colors.primary }]}>
              {insights.consistencyScore}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${insights.consistencyScore}%` }]} />
          </View>
          <Text style={styles.metricDescription}>
            Based on weekly session regularity
          </Text>
        </Card>

        <Card variant="outlined" style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Engagement Trend</Text>
            <Text style={[styles.metricValue, { color: getTrendColor() }]}>
              {getTrendEmoji()} {getTrendText()}
            </Text>
          </View>
          <Text style={styles.metricDescription}>
            Comparing last 2 weeks to previous 2 weeks
          </Text>
        </Card>
      </View>

      {/* Subject Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subject Performance</Text>
        {insights.subjectBreakdown.map((subject, index) => (
          <Card key={subject.subject} variant="outlined" style={styles.subjectCard}>
            <View style={styles.subjectHeader}>
              <View style={styles.subjectInfo}>
                <Text style={styles.subjectName}>{subject.subject}</Text>
                <Text style={styles.subjectLastSession}>
                  Last: {formatDate(subject.lastSession)}
                </Text>
              </View>
              <View style={styles.subjectStats}>
                <Text style={styles.subjectSessions}>{subject.sessions} sessions</Text>
                <Text style={styles.subjectMinutes}>{subject.minutes} min</Text>
              </View>
            </View>
            <View style={styles.subjectBar}>
              <View
                style={[
                  styles.subjectBarFill,
                  {
                    width: `${(subject.sessions / insights.totalSessions) * 100}%`,
                  },
                ]}
              />
            </View>
          </Card>
        ))}
      </View>

      {/* Time Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Learning Times</Text>
        <Card variant="outlined" style={styles.timeCard}>
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>🌅 Morning</Text>
            <View style={styles.timeBarContainer}>
              <View
                style={[
                  styles.timeBarFill,
                  {
                    width: `${(insights.timeOfDayPreference.morning /
                      insights.totalSessions) * 100}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.timeCount}>{insights.timeOfDayPreference.morning}</Text>
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>☀️ Afternoon</Text>
            <View style={styles.timeBarContainer}>
              <View
                style={[
                  styles.timeBarFill,
                  {
                    width: `${(insights.timeOfDayPreference.afternoon /
                      insights.totalSessions) * 100}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.timeCount}>{insights.timeOfDayPreference.afternoon}</Text>
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>🌙 Evening</Text>
            <View style={styles.timeBarContainer}>
              <View
                style={[
                  styles.timeBarFill,
                  {
                    width: `${(insights.timeOfDayPreference.evening /
                      insights.totalSessions) * 100}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.timeCount}>{insights.timeOfDayPreference.evening}</Text>
          </View>
        </Card>

        <Card variant="outlined" style={styles.recommendationCard}>
          <Text style={styles.recommendationLabel}>💡 Recommended Time</Text>
          <Text style={styles.recommendationValue}>{insights.recommendedTime}</Text>
          <Text style={styles.recommendationDescription}>
            Based on peak performance patterns
          </Text>
        </Card>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.surface,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.surface,
    opacity: 0.9,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: (width - 60) / 2,
    padding: 20,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
  },
  metricCard: {
    padding: 16,
    marginBottom: 12,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  metricDescription: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  subjectCard: {
    padding: 16,
    marginBottom: 12,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  subjectLastSession: {
    fontSize: 12,
    color: colors.textMuted,
  },
  subjectStats: {
    alignItems: 'flex-end',
  },
  subjectSessions: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  subjectMinutes: {
    fontSize: 12,
    color: colors.textLight,
  },
  subjectBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  subjectBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  timeCard: {
    padding: 16,
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    width: 90,
  },
  timeBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  timeBarFill: {
    height: '100%',
    backgroundColor: colors.secondary,
    borderRadius: 4,
  },
  timeCount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textLight,
    width: 30,
    textAlign: 'right',
  },
  recommendationCard: {
    padding: 20,
    alignItems: 'center',
  },
  recommendationLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 8,
  },
  recommendationValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  recommendationDescription: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: colors.textLight,
  },
})
