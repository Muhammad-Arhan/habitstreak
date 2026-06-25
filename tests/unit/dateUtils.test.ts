import { describe, it, expect } from 'vitest'
import { toDateString, getLast365Days, isToday } from '../../server/src/lib/dateUtils'

describe('toDateString', () => {
  it('should return date in YYYY-MM-DD format', () => {
    const date = new Date(2024, 0, 15) // January 15, 2024
    expect(toDateString(date)).toBe('2024-01-15')
  })

  it('should pad single-digit months and days with zeros', () => {
    const date = new Date(2024, 2, 5) // March 5, 2024
    expect(toDateString(date)).toBe('2024-03-05')
  })

  it('should handle end-of-year dates correctly', () => {
    const date = new Date(2024, 11, 31) // December 31, 2024
    expect(toDateString(date)).toBe('2024-12-31')
  })
})

describe('getLast365Days', () => {
  it('should return exactly 365 dates', () => {
    const days = getLast365Days()
    expect(days).toHaveLength(365)
  })

  it('should have today as the last element', () => {
    const days = getLast365Days()
    const today = toDateString(new Date())
    expect(days[days.length - 1]).toBe(today)
  })

  it('should have all dates in YYYY-MM-DD format', () => {
    const days = getLast365Days()
    const isoPattern = /^\d{4}-\d{2}-\d{2}$/
    days.forEach(day => {
      expect(day).toMatch(isoPattern)
    })
  })

  it('should be in ascending chronological order', () => {
    const days = getLast365Days()
    for (let i = 1; i < days.length; i++) {
      expect(days[i] > days[i - 1]).toBe(true)
    }
  })
})

describe('isToday', () => {
  it('should correctly identify today as today', () => {
    const today = toDateString(new Date())
    expect(isToday(today)).toBe(true)
  })

  it('should correctly identify yesterday as not today', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    expect(isToday(toDateString(yesterday))).toBe(false)
  })

  it('should correctly identify tomorrow as not today', () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    expect(isToday(toDateString(tomorrow))).toBe(false)
  })

  it('should correctly identify an arbitrary past date as not today', () => {
    expect(isToday('2020-01-01')).toBe(false)
  })
})
