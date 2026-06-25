import type { Habit, HabitLog, StreakStats, CreateHabitPayload } from '../types'

const BASE = '/api'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export const habitsApi = {
  getAll: () => request<Habit[]>('/habits'),

  create: (payload: CreateHabitPayload) =>
    request<Habit>('/habits', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  delete: (id: number) =>
    request<void>(`/habits/${id}`, { method: 'DELETE' }),

  getLogs: (id: number) => request<HabitLog[]>(`/habits/${id}/logs`),

  logToday: (id: number) =>
    request<HabitLog>(`/habits/${id}/log`, { method: 'POST' }),

  unlogToday: (id: number) =>
    request<void>(`/habits/${id}/log`, { method: 'DELETE' }),

  getStreak: (id: number) => request<StreakStats>(`/habits/${id}/streak`),
}
