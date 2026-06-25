import { useState } from 'react'
import type { HabitLog } from '../types'

interface StreakGridProps {
  logs: HabitLog[]
  color: string
}

function getLast84Days(): string[] {
  const days: string[] = []
  const today = new Date()
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export function StreakGrid({ logs, color }: StreakGridProps) {
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null)

  const completedSet = new Set(logs.filter(l => l.completed).map(l => l.date.slice(0, 10)))
  const days = getLast84Days()
  const today = new Date().toISOString().slice(0, 10)

  // 7 columns (days of week), 12 rows (weeks) — display column-by-column
  const weeks: string[][] = []
  for (let w = 0; w < 12; w++) {
    weeks.push(days.slice(w * 7, w * 7 + 7))
  }

  return (
    <div className="relative">
      <div className="flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map(day => {
              const done = completedSet.has(day)
              const isToday = day === today
              return (
                <div
                  key={day}
                  onMouseEnter={e => {
                    const rect = (e.target as HTMLElement).getBoundingClientRect()
                    setTooltip({
                      text: `${formatDate(day)} — ${done ? '✓ Completed' : '✗ Missed'}`,
                      x: rect.left,
                      y: rect.top,
                    })
                  }}
                  onMouseLeave={() => setTooltip(null)}
                  className="w-3.5 h-3.5 rounded-sm cursor-default transition-transform duration-100 hover:scale-125"
                  style={{
                    backgroundColor: done ? color : hexToRgba(color, 0.12),
                    boxShadow: isToday ? `0 0 0 1.5px ${color}` : 'none',
                  }}
                  title={`${formatDate(day)}: ${done ? 'Completed' : 'Missed'}`}
                />
              )
            })}
          </div>
        ))}
      </div>

      {tooltip && (
        <div
          className="fixed z-50 bg-slate-800 border border-white/10 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-xl pointer-events-none whitespace-nowrap"
          style={{ top: tooltip.y - 36, left: tooltip.x }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  )
}
