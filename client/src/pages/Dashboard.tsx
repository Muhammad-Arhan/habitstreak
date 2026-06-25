import { useState, useEffect, useCallback } from 'react'
import { habitsApi } from '../api/habits'
import type { Habit, HabitLog, StreakStats, StatsData } from '../types'
import { StatsBar } from '../components/StatsBar'
import { HabitForm } from '../components/HabitForm'
import { HabitCard } from '../components/HabitCard'

interface HabitData {
  habit: Habit
  logs: HabitLog[]
  stats: StreakStats
  isTodayDone: boolean
}

export function Dashboard() {
  const [habitData, setHabitData] = useState<HabitData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const today = new Date().toISOString().slice(0, 10)

  const loadAll = useCallback(async () => {
    try {
      const habits = await habitsApi.getAll()
      const detailed = await Promise.all(
        habits.map(async habit => {
          const [logs, stats] = await Promise.all([
            habitsApi.getLogs(habit.id),
            habitsApi.getStreak(habit.id),
          ])
          const isTodayDone = logs.some(l => l.date.slice(0, 10) === today && l.completed)
          return { habit, logs, stats, isTodayDone }
        })
      )
      setHabitData(detailed)
      setError('')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load habits.')
    } finally {
      setLoading(false)
    }
  }, [today])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const handleCreate = async (payload: { name: string; description?: string; color: string }) => {
    await habitsApi.create(payload)
    await loadAll()
  }

  const handleToggleToday = async (habitId: number, isTodayDone: boolean) => {
    if (isTodayDone) {
      await habitsApi.unlogToday(habitId)
    } else {
      await habitsApi.logToday(habitId)
    }
    await loadAll()
  }

  const handleDelete = async (habitId: number) => {
    await habitsApi.delete(habitId)
    await loadAll()
  }

  const stats: StatsData = {
    totalHabits: habitData.length,
    completedToday: habitData.filter(d => d.isTodayDone).length,
    bestStreak: habitData.reduce((max, d) => Math.max(max, d.stats.currentStreak), 0),
  }

  return (
    <div className="min-h-screen bg-[#0f0e1a] text-white">
      {/* Header */}
      <header className="border-b border-white/5 bg-white/2">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔥</span>
            <div>
              <h1 className="text-xl font-bold text-white leading-none">HabitStreak</h1>
              <p className="text-xs text-slate-500 mt-0.5">Build momentum, one day at a time</p>
            </div>
          </div>
          <div className="text-sm text-slate-500">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl px-4 py-3 text-sm">
            ⚠ {error}
          </div>
        )}

        <StatsBar stats={stats} />
        <HabitForm onSubmit={handleCreate} />

        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="h-40 bg-white/5 rounded-2xl animate-pulse border border-white/5"
              />
            ))}
          </div>
        ) : habitData.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🌱</div>
            <h3 className="text-white font-semibold text-lg mb-2">No habits yet</h3>
            <p className="text-slate-400 text-sm">Add your first habit above to get started.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {habitData.map(({ habit, logs, stats: s, isTodayDone }) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                logs={logs}
                stats={s}
                isTodayDone={isTodayDone}
                onToggleToday={() => handleToggleToday(habit.id, isTodayDone)}
                onDelete={() => handleDelete(habit.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
