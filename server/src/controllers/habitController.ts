import { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'
import { calculateStreak, calculateLongestStreak, toDateString } from '../lib/streakUtils'
import { getLast365Days } from '../lib/dateUtils'

/** GET /api/habits — list all habits with their current streak */
export async function getAllHabits(req: Request, res: Response, next: NextFunction) {
  try {
    const habits = await prisma.habit.findMany({
      include: { logs: true },
      orderBy: { createdAt: 'asc' },
    })

    const result = habits.map(habit => {
      const completedDates = habit.logs
        .filter(l => l.completed)
        .map(l => new Date(l.date))
      const currentStreak = calculateStreak(completedDates)
      return {
        id: habit.id,
        name: habit.name,
        description: habit.description,
        color: habit.color,
        createdAt: habit.createdAt,
        currentStreak,
      }
    })

    res.json(result)
  } catch (err) {
    next(err)
  }
}

/** POST /api/habits — create a new habit */
export async function createHabit(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, description, color } = req.body

    if (!name || typeof name !== 'string' || name.trim() === '') {
      res.status(400).json({ error: 'Habit name is required.' })
      return
    }

    const habit = await prisma.habit.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        color: color || '#6366f1',
      },
    })

    res.status(201).json({ ...habit, currentStreak: 0 })
  } catch (err) {
    next(err)
  }
}

/** DELETE /api/habits/:id — delete a habit and all its logs */
export async function deleteHabit(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid habit ID.' })
      return
    }

    await prisma.habit.delete({ where: { id } })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

/** POST /api/habits/:id/log — mark today as completed */
export async function logToday(req: Request, res: Response, next: NextFunction) {
  try {
    const habitId = parseInt(req.params.id, 10)
    if (isNaN(habitId)) {
      res.status(400).json({ error: 'Invalid habit ID.' })
      return
    }

    const habit = await prisma.habit.findUnique({ where: { id: habitId } })
    if (!habit) {
      res.status(404).json({ error: 'Habit not found.' })
      return
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const log = await prisma.habitLog.upsert({
      where: { habitId_date: { habitId, date: today } },
      update: { completed: true },
      create: { habitId, date: today, completed: true },
    })

    res.json(log)
  } catch (err) {
    next(err)
  }
}

/** DELETE /api/habits/:id/log — unmark today */
export async function unlogToday(req: Request, res: Response, next: NextFunction) {
  try {
    const habitId = parseInt(req.params.id, 10)
    if (isNaN(habitId)) {
      res.status(400).json({ error: 'Invalid habit ID.' })
      return
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    await prisma.habitLog.deleteMany({
      where: { habitId, date: today },
    })

    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

/** GET /api/habits/:id/logs — get last 365 days of logs */
export async function getHabitLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const habitId = parseInt(req.params.id, 10)
    if (isNaN(habitId)) {
      res.status(400).json({ error: 'Invalid habit ID.' })
      return
    }

    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 365)
    cutoff.setHours(0, 0, 0, 0)

    const logs = await prisma.habitLog.findMany({
      where: { habitId, date: { gte: cutoff } },
      orderBy: { date: 'asc' },
    })

    // Return logs with date as YYYY-MM-DD string
    const result = logs.map(l => ({
      ...l,
      date: toDateString(new Date(l.date)),
    }))

    res.json(result)
  } catch (err) {
    next(err)
  }
}

/** GET /api/habits/:id/streak — return streak stats */
export async function getHabitStreak(req: Request, res: Response, next: NextFunction) {
  try {
    const habitId = parseInt(req.params.id, 10)
    if (isNaN(habitId)) {
      res.status(400).json({ error: 'Invalid habit ID.' })
      return
    }

    const logs = await prisma.habitLog.findMany({
      where: { habitId, completed: true },
      orderBy: { date: 'desc' },
    })

    const dates = logs.map(l => new Date(l.date))
    const currentStreak = calculateStreak(dates)
    const longestStreak = calculateLongestStreak(dates)
    const totalDays = dates.length

    res.json({ currentStreak, longestStreak, totalDays })
  } catch (err) {
    next(err)
  }
}

/** GET /api/health — health check for CI */
export async function healthCheck(_req: Request, res: Response) {
  res.json({ status: 'ok' })
}

// Keep getLast365Days in scope to avoid lint warning (it's re-exported from dateUtils)
void getLast365Days
