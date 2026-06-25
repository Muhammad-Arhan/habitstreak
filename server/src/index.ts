import express from 'express'
import cors from 'cors'
import habitsRouter from './routes/habits'
import { errorHandler, notFound } from './middleware/errorHandler'

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api', habitsRouter)

// 404 catch-all
app.use(notFound)

// Global error handler
app.use(errorHandler)

// Only start listening when run directly (not during tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 HabitStreak server running on http://localhost:${PORT}`)
  })
}

export default app
