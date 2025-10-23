// Weekly Learning Goals System
// Helps students set and track weekly learning targets

export interface WeeklyGoal {
  type: 'sessions' | 'minutes' | 'points'
  target: number
  current: number
}

export interface GoalPreset {
  name: string
  description: string
  emoji: string
  sessions: number
  minutes: number
  points: number
}

/**
 * Preset goal templates based on commitment level
 */
export const GOAL_PRESETS: GoalPreset[] = [
  {
    name: 'Light',
    description: 'Perfect for getting started',
    emoji: '🌱',
    sessions: 3,
    minutes: 30,
    points: 60,
  },
  {
    name: 'Moderate',
    description: 'Steady progress each week',
    emoji: '🔥',
    sessions: 5,
    minutes: 60,
    points: 120,
  },
  {
    name: 'Focused',
    description: 'Serious about learning',
    emoji: '⚡',
    sessions: 7,
    minutes: 90,
    points: 180,
  },
  {
    name: 'Intense',
    description: 'Maximum learning mode',
    emoji: '🚀',
    sessions: 10,
    minutes: 150,
    points: 300,
  },
]

/**
 * Calculate progress for a specific goal type
 */
export function calculateGoalProgress(
  type: 'sessions' | 'minutes' | 'points',
  current: number,
  target: number
): number {
  if (target === 0) return 0
  return Math.min(100, Math.round((current / target) * 100))
}

/**
 * Check if goal is complete
 */
export function isGoalComplete(current: number, target: number): boolean {
  return current >= target
}

/**
 * Get all goals status
 */
export function getGoalsStatus(
  weekSessions: number,
  weekMinutes: number,
  weekPoints: number,
  goals: {
    sessions: number
    minutes: number
    points: number
  }
): {
  sessions: WeeklyGoal
  minutes: WeeklyGoal
  points: WeeklyGoal
  overallProgress: number
  allComplete: boolean
} {
  const sessions: WeeklyGoal = {
    type: 'sessions',
    target: goals.sessions,
    current: weekSessions,
  }

  const minutes: WeeklyGoal = {
    type: 'minutes',
    target: goals.minutes,
    current: weekMinutes,
  }

  const points: WeeklyGoal = {
    type: 'points',
    target: goals.points,
    current: weekPoints,
  }

  const sessionsProgress = calculateGoalProgress('sessions', weekSessions, goals.sessions)
  const minutesProgress = calculateGoalProgress('minutes', weekMinutes, goals.minutes)
  const pointsProgress = calculateGoalProgress('points', weekPoints, goals.points)

  const overallProgress = Math.round((sessionsProgress + minutesProgress + pointsProgress) / 3)

  const allComplete =
    isGoalComplete(weekSessions, goals.sessions) &&
    isGoalComplete(weekMinutes, goals.minutes) &&
    isGoalComplete(weekPoints, goals.points)

  return {
    sessions,
    minutes,
    points,
    overallProgress,
    allComplete,
  }
}

/**
 * Get week number (1-52) for the current year
 */
export function getCurrentWeekNumber(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  const diff = now.getTime() - start.getTime()
  const oneWeek = 1000 * 60 * 60 * 24 * 7
  return Math.ceil(diff / oneWeek)
}

/**
 * Get start of current week (Monday)
 */
export function getWeekStart(): Date {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1) // Adjust for Sunday
  return new Date(now.setDate(diff))
}

/**
 * Get end of current week (Sunday)
 */
export function getWeekEnd(): Date {
  const start = getWeekStart()
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return end
}

/**
 * Check if a date is in the current week
 */
export function isInCurrentWeek(date: Date): boolean {
  const start = getWeekStart()
  const end = getWeekEnd()
  return date >= start && date <= end
}

/**
 * Calculate days remaining in week
 */
export function getDaysRemainingInWeek(): number {
  const now = new Date()
  const end = getWeekEnd()
  const diff = end.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
