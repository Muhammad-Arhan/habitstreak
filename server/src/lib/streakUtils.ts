/**
 * Pure utility functions for streak calculation.
 * These are kept isolated so they can be unit tested independently
 * without needing a database connection.
 */

/**
 * Calculates the current streak from an array of completed dates.
 * A streak is counted as consecutive days ending on today or yesterday.
 *
 * @param dates - Array of Date objects representing completed days (any order)
 * @returns The current streak count
 */
export function calculateStreak(dates: Date[]): number {
  if (dates.length === 0) return 0

  // Normalize all dates to YYYY-MM-DD strings for comparison
  const dateStrings = dates.map(d => toDateString(d))

  // Remove duplicates and future dates
  const today = toDateString(new Date())
  const unique = [...new Set(dateStrings)].filter(d => d <= today)

  if (unique.length === 0) return 0

  // Sort descending (most recent first)
  unique.sort((a, b) => b.localeCompare(a))

  // Streak must start from today or yesterday
  const todayDate = new Date()
  const yesterdayDate = new Date(todayDate)
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)

  const todayStr = toDateString(todayDate)
  const yesterdayStr = toDateString(yesterdayDate)

  if (unique[0] !== todayStr && unique[0] !== yesterdayStr) {
    return 0
  }

  let streak = 1
  for (let i = 1; i < unique.length; i++) {
    const current = new Date(unique[i] + 'T00:00:00')
    const previous = new Date(unique[i - 1] + 'T00:00:00')

    // Check if current date is exactly 1 day before the previous
    const diffMs = previous.getTime() - current.getTime()
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      streak++
    } else {
      break
    }
  }

  return streak
}

/**
 * Calculates the longest ever streak from an array of completed dates.
 */
export function calculateLongestStreak(dates: Date[]): number {
  if (dates.length === 0) return 0

  const dateStrings = dates.map(d => toDateString(d))
  const unique = [...new Set(dateStrings)]
  unique.sort((a, b) => a.localeCompare(b))

  let longest = 1
  let current = 1

  for (let i = 1; i < unique.length; i++) {
    const prev = new Date(unique[i - 1] + 'T00:00:00')
    const curr = new Date(unique[i] + 'T00:00:00')
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      current++
      longest = Math.max(longest, current)
    } else {
      current = 1
    }
  }

  return longest
}

/**
 * Converts a Date to "YYYY-MM-DD" string format.
 * Uses local date, not UTC, to match what users expect.
 */
export function toDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
