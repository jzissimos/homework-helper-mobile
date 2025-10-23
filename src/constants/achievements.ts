// Achievements and Badges System
// Gamification to motivate continued learning

export interface Achievement {
  id: string
  name: string
  description: string
  emoji: string
  category: 'sessions' | 'points' | 'streaks' | 'time' | 'topics'
  requirement: number
  requirementType: 'totalSessions' | 'totalPoints' | 'currentStreak' | 'totalMinutes' | 'topicsExplored'
}

/**
 * All available achievements
 * Organized by difficulty: Beginner → Intermediate → Advanced → Expert
 */
export const ACHIEVEMENTS: Achievement[] = [
  // Session-based achievements
  {
    id: 'first_session',
    name: 'First Steps',
    description: 'Complete your first learning session',
    emoji: '👶',
    category: 'sessions',
    requirement: 1,
    requirementType: 'totalSessions',
  },
  {
    id: 'sessions_5',
    name: 'Getting Started',
    description: 'Complete 5 learning sessions',
    emoji: '🌱',
    category: 'sessions',
    requirement: 5,
    requirementType: 'totalSessions',
  },
  {
    id: 'sessions_10',
    name: 'Dedicated Learner',
    description: 'Complete 10 learning sessions',
    emoji: '🎯',
    category: 'sessions',
    requirement: 10,
    requirementType: 'totalSessions',
  },
  {
    id: 'sessions_25',
    name: 'Study Champion',
    description: 'Complete 25 learning sessions',
    emoji: '🏆',
    category: 'sessions',
    requirement: 25,
    requirementType: 'totalSessions',
  },
  {
    id: 'sessions_50',
    name: 'Learning Legend',
    description: 'Complete 50 learning sessions',
    emoji: '⭐',
    category: 'sessions',
    requirement: 50,
    requirementType: 'totalSessions',
  },
  {
    id: 'sessions_100',
    name: 'Century Club',
    description: 'Complete 100 learning sessions',
    emoji: '💯',
    category: 'sessions',
    requirement: 100,
    requirementType: 'totalSessions',
  },

  // Points-based achievements
  {
    id: 'points_10',
    name: 'Point Starter',
    description: 'Earn your first 10 points',
    emoji: '💎',
    category: 'points',
    requirement: 10,
    requirementType: 'totalPoints',
  },
  {
    id: 'points_50',
    name: 'Point Collector',
    description: 'Earn 50 points',
    emoji: '💰',
    category: 'points',
    requirement: 50,
    requirementType: 'totalPoints',
  },
  {
    id: 'points_100',
    name: 'Point Master',
    description: 'Earn 100 points',
    emoji: '💸',
    category: 'points',
    requirement: 100,
    requirementType: 'totalPoints',
  },
  {
    id: 'points_250',
    name: 'Point Millionaire',
    description: 'Earn 250 points',
    emoji: '🤑',
    category: 'points',
    requirement: 250,
    requirementType: 'totalPoints',
  },
  {
    id: 'points_500',
    name: 'Point Tycoon',
    description: 'Earn 500 points',
    emoji: '👑',
    category: 'points',
    requirement: 500,
    requirementType: 'totalPoints',
  },

  // Streak-based achievements
  {
    id: 'streak_3',
    name: 'On Fire',
    description: '3-day learning streak',
    emoji: '🔥',
    category: 'streaks',
    requirement: 3,
    requirementType: 'currentStreak',
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: '7-day learning streak',
    emoji: '⚡',
    category: 'streaks',
    requirement: 7,
    requirementType: 'currentStreak',
  },
  {
    id: 'streak_14',
    name: 'Two Week Wonder',
    description: '14-day learning streak',
    emoji: '🌟',
    category: 'streaks',
    requirement: 14,
    requirementType: 'currentStreak',
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: '30-day learning streak',
    emoji: '🚀',
    category: 'streaks',
    requirement: 30,
    requirementType: 'currentStreak',
  },
  {
    id: 'streak_100',
    name: 'Unstoppable',
    description: '100-day learning streak',
    emoji: '🔮',
    category: 'streaks',
    requirement: 100,
    requirementType: 'currentStreak',
  },

  // Time-based achievements
  {
    id: 'time_30',
    name: 'Half Hour Hero',
    description: 'Learn for 30 total minutes',
    emoji: '⏰',
    category: 'time',
    requirement: 30,
    requirementType: 'totalMinutes',
  },
  {
    id: 'time_60',
    name: 'Hour of Power',
    description: 'Learn for 60 total minutes',
    emoji: '⏳',
    category: 'time',
    requirement: 60,
    requirementType: 'totalMinutes',
  },
  {
    id: 'time_180',
    name: 'Three Hour Titan',
    description: 'Learn for 3 hours total',
    emoji: '⌚',
    category: 'time',
    requirement: 180,
    requirementType: 'totalMinutes',
  },
  {
    id: 'time_300',
    name: 'Five Hour Phoenix',
    description: 'Learn for 5 hours total',
    emoji: '🕐',
    category: 'time',
    requirement: 300,
    requirementType: 'totalMinutes',
  },
  {
    id: 'time_600',
    name: 'Ten Hour Legend',
    description: 'Learn for 10 hours total',
    emoji: '📚',
    category: 'time',
    requirement: 600,
    requirementType: 'totalMinutes',
  },
]

/**
 * Calculate which achievements have been earned
 */
export function calculateEarnedAchievements(stats: {
  totalSessions: number
  totalPoints: number
  currentStreak: number
  totalMinutes: number
}): Achievement[] {
  return ACHIEVEMENTS.filter((achievement) => {
    const value = stats[achievement.requirementType]
    return value >= achievement.requirement
  })
}

/**
 * Get progress toward next achievement in each category
 */
export function getNextAchievements(stats: {
  totalSessions: number
  totalPoints: number
  currentStreak: number
  totalMinutes: number
}): { category: string; next: Achievement | null; progress: number }[] {
  const categories = ['sessions', 'points', 'streaks', 'time'] as const

  return categories.map((category) => {
    const categoryAchievements = ACHIEVEMENTS.filter(
      (a) => a.category === category
    ).sort((a, b) => a.requirement - b.requirement)

    // Find the first achievement not yet earned
    const next = categoryAchievements.find((achievement) => {
      const value = stats[achievement.requirementType]
      return value < achievement.requirement
    })

    if (!next) {
      return { category, next: null, progress: 100 }
    }

    const value = stats[next.requirementType]
    const progress = Math.min(100, (value / next.requirement) * 100)

    return { category, next, progress }
  })
}

/**
 * Get newly earned achievements (compare old vs new stats)
 */
export function getNewlyEarnedAchievements(
  oldStats: {
    totalSessions: number
    totalPoints: number
    currentStreak: number
    totalMinutes: number
  },
  newStats: {
    totalSessions: number
    totalPoints: number
    currentStreak: number
    totalMinutes: number
  }
): Achievement[] {
  const oldEarned = calculateEarnedAchievements(oldStats)
  const newEarned = calculateEarnedAchievements(newStats)

  return newEarned.filter(
    (achievement) => !oldEarned.some((old) => old.id === achievement.id)
  )
}
