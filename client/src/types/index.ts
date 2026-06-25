export interface Habit {
  id: number
  name: string
  description: string | null
  color: string
  createdAt: string
  currentStreak: number
  longestStreak?: number
  totalDays?: number
}

export interface HabitLog {
  id: number
  habitId: number
  date: string
  completed: boolean
}

export interface StreakStats {
  currentStreak: number
  longestStreak: number
  totalDays: number
}

export interface CreateHabitPayload {
  name: string
  description?: string
  color: string
}

export interface StatsData {
  totalHabits: number
  completedToday: number
  bestStreak: number
}
