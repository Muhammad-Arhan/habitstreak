import { describe, it, expect } from 'vitest'
import { calculateStreak } from '../../server/src/lib/streakUtils'

/**
 * Helper to create a Date for N days ago from today.
 */
function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Helper to create a Date for N days in the future.
 */
function daysFromNow(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + n)
  d.setHours(0, 0, 0, 0)
  return d
}

describe('calculateStreak', () => {
  it('should return 0 when no dates are provided', () => {
    expect(calculateStreak([])).toBe(0)
  })

  it('should return 1 when only today is completed', () => {
    expect(calculateStreak([daysAgo(0)])).toBe(1)
  })

  it('should return 1 when only yesterday is completed', () => {
    expect(calculateStreak([daysAgo(1)])).toBe(1)
  })

  it('should return a streak of 5 when the last 5 consecutive days are completed', () => {
    const dates = [daysAgo(0), daysAgo(1), daysAgo(2), daysAgo(3), daysAgo(4)]
    expect(calculateStreak(dates)).toBe(5)
  })

  it('should break the streak if there is a gap in the middle', () => {
    // Today, yesterday, then skip 2 days ago, then 3 days ago
    // Streak should be 2 (today + yesterday), then it breaks
    const dates = [daysAgo(0), daysAgo(1), daysAgo(3), daysAgo(4)]
    expect(calculateStreak(dates)).toBe(2)
  })

  it('should not count future dates', () => {
    // Even if a future date is passed, it should be ignored
    const dates = [daysFromNow(1), daysAgo(0), daysAgo(1)]
    expect(calculateStreak(dates)).toBe(2)
  })

  it('should return 0 when the most recent date is older than yesterday', () => {
    // 2 days ago and older — streak is broken
    const dates = [daysAgo(2), daysAgo(3), daysAgo(4)]
    expect(calculateStreak(dates)).toBe(0)
  })

  it('should handle unsorted dates correctly', () => {
    // Dates in random order — should still compute correctly
    const dates = [daysAgo(3), daysAgo(0), daysAgo(1), daysAgo(2)]
    expect(calculateStreak(dates)).toBe(4)
  })
})
