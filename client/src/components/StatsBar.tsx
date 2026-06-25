import type { StatsData } from '../types'

interface StatsBarProps {
  stats: StatsData
}

export function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-1 backdrop-blur-sm">
        <span className="text-xs font-semibold uppercase tracking-widest text-indigo-300">
          Total Habits
        </span>
        <span className="text-4xl font-bold text-white">{stats.totalHabits}</span>
        <span className="text-sm text-slate-400">habits being tracked</span>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-1 backdrop-blur-sm">
        <span className="text-xs font-semibold uppercase tracking-widest text-emerald-300">
          Done Today
        </span>
        <span className="text-4xl font-bold text-white">{stats.completedToday}</span>
        <span className="text-sm text-slate-400">completions logged</span>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-1 backdrop-blur-sm">
        <span className="text-xs font-semibold uppercase tracking-widest text-amber-300">
          Best Streak
        </span>
        <span className="text-4xl font-bold text-white">
          {stats.bestStreak} <span className="text-2xl">🔥</span>
        </span>
        <span className="text-sm text-slate-400">days in a row</span>
      </div>
    </div>
  )
}
