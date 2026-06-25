import { useState } from 'react'
import type { Habit, HabitLog, StreakStats } from '../types'
import { StreakGrid } from './StreakGrid'

interface HabitCardProps {
  habit: Habit
  logs: HabitLog[]
  stats: StreakStats
  isTodayDone: boolean
  onToggleToday: () => Promise<void>
  onDelete: () => Promise<void>
}

export function HabitCard({
  habit,
  logs,
  stats,
  isTodayDone,
  onToggleToday,
  onDelete,
}: HabitCardProps) {
  const [toggling, setToggling] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleToggle = async () => {
    setToggling(true)
    try {
      await onToggleToday()
    } finally {
      setToggling(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setDeleting(true)
    try {
      await onDelete()
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <div className="relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm animate-slide-up hover:border-white/20 transition-all duration-200 group">
      {/* Color accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ backgroundColor: habit.color }}
      />

      <div className="pl-5 pr-5 pt-5 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-white font-semibold text-base leading-tight">{habit.name}</h3>
            {habit.description && (
              <p className="text-slate-400 text-sm mt-0.5">{habit.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2 ml-4 shrink-0">
            {/* Mark today button */}
            <button
              onClick={handleToggle}
              disabled={toggling}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 active:scale-95 ${
                isTodayDone
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                  : 'bg-indigo-600/80 text-white hover:bg-indigo-500 border border-indigo-500/50'
              }`}
            >
              {toggling ? '...' : isTodayDone ? '✓ Done Today' : 'Mark Today'}
            </button>

            {/* Delete button */}
            <button
              onClick={handleDelete}
              disabled={deleting}
              onBlur={() => setTimeout(() => setConfirmDelete(false), 200)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 active:scale-95 border ${
                confirmDelete
                  ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:border-rose-500/40 hover:text-rose-400'
              }`}
            >
              {deleting ? '...' : confirmDelete ? 'Confirm?' : '✕'}
            </button>
          </div>
        </div>

        {/* Streak stats */}
        <div className="flex items-center gap-5 mb-4">
          <div className="flex items-center gap-1.5">
            <span className="text-lg">🔥</span>
            <div>
              <span className="text-white font-bold text-lg leading-none">
                {stats.currentStreak}
              </span>
              <span className="text-slate-400 text-xs ml-1">day streak</span>
            </div>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <div>
            <span className="text-slate-300 font-semibold">{stats.longestStreak}</span>
            <span className="text-slate-500 text-xs ml-1">best</span>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <div>
            <span className="text-slate-300 font-semibold">{stats.totalDays}</span>
            <span className="text-slate-500 text-xs ml-1">total days</span>
          </div>
        </div>

        {/* Streak grid */}
        <StreakGrid logs={logs} color={habit.color} />

        <div className="flex justify-between items-center mt-2">
          <span className="text-slate-600 text-xs">12 weeks</span>
          <span className="text-slate-600 text-xs">today →</span>
        </div>
      </div>
    </div>
  )
}
