import { useState } from 'react'
import type { CreateHabitPayload } from '../types'

const PRESET_COLORS = [
  { name: 'Indigo',  hex: '#6366f1' },
  { name: 'Green',   hex: '#22c55e' },
  { name: 'Amber',   hex: '#f59e0b' },
  { name: 'Rose',    hex: '#f43f5e' },
  { name: 'Sky',     hex: '#0ea5e9' },
  { name: 'Violet',  hex: '#8b5cf6' },
  { name: 'Orange',  hex: '#f97316' },
  { name: 'Teal',    hex: '#14b8a6' },
]

interface HabitFormProps {
  onSubmit: (payload: CreateHabitPayload) => Promise<void>
}

export function HabitForm({ onSubmit }: HabitFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[0].hex)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Habit name is required.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await onSubmit({ name: name.trim(), description: description.trim() || undefined, color })
      setName('')
      setDescription('')
      setColor(PRESET_COLORS[0].hex)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create habit.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 backdrop-blur-sm animate-fade-in">
      <h2 className="text-lg font-semibold text-white mb-4">Add a New Habit</h2>
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Habit Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="e.g. Morning run, Read 30 min..."
              className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Description <span className="text-slate-600">(optional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="A short note about this habit..."
              className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Color
            </label>
            <div className="flex gap-2">
              {PRESET_COLORS.map(c => (
                <button
                  key={c.hex}
                  onClick={() => setColor(c.hex)}
                  title={c.name}
                  className="w-7 h-7 rounded-full transition-all duration-150 ring-offset-2 ring-offset-[#0f0e1a]"
                  style={{
                    backgroundColor: c.hex,
                    boxShadow: color === c.hex ? `0 0 0 3px ${c.hex}` : 'none',
                    transform: color === c.hex ? 'scale(1.2)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-end flex-col gap-2">
            {error && <p className="text-rose-400 text-sm">{error}</p>}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all duration-150 active:scale-95"
            >
              {loading ? 'Adding...' : '+ Add Habit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
