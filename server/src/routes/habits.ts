import { Router } from 'express'
import {
  getAllHabits,
  createHabit,
  deleteHabit,
  logToday,
  unlogToday,
  getHabitLogs,
  getHabitStreak,
  healthCheck,
} from '../controllers/habitController'

const router = Router()

// Health check
router.get('/health', healthCheck)

// Habit CRUD
router.get('/habits', getAllHabits)
router.post('/habits', createHabit)
router.delete('/habits/:id', deleteHabit)

// Logging
router.post('/habits/:id/log', logToday)
router.delete('/habits/:id/log', unlogToday)

// Habit detail
router.get('/habits/:id/logs', getHabitLogs)
router.get('/habits/:id/streak', getHabitStreak)

export default router
