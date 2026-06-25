/**
 * Date utility helpers used across the server.
 * Kept here so they can be independently unit tested.
 */

/**
 * Converts a Date to "YYYY-MM-DD" string format.
 */
export function toDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Returns an array of the last 365 date strings in "YYYY-MM-DD" format,
 * from 364 days ago to today (inclusive).
 */
export function getLast365Days(): string[] {
  const days: string[] = []
  const today = new Date()
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    days.push(toDateString(d))
  }
  return days
}

/**
 * Returns true if the given "YYYY-MM-DD" string represents today's date.
 */
export function isToday(dateStr: string): boolean {
  return dateStr === toDateString(new Date())
}
