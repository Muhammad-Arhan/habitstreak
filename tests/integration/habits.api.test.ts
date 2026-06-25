import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import supertest from 'supertest'
import { PrismaClient } from '@prisma/client'
import app from '../../server/src/index'

/**
 * Integration tests for the HabitStreak API.
 * These tests call the real Express app with a real PostgreSQL test database.
 * The TEST_DATABASE_URL environment variable must be set before running.
 *
 * The setup.ts file ensures DATABASE_URL is overridden with TEST_DATABASE_URL
 * so Prisma connects to the test DB, not the dev DB.
 */

const request = supertest(app)

// Use a separate Prisma client for test cleanup
const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
})

beforeAll(async () => {
  await prisma.$connect()
})

afterAll(async () => {
  await prisma.$disconnect()
})

// Clean the database before each test so tests don't interfere with each other
beforeEach(async () => {
  await prisma.habitLog.deleteMany()
  await prisma.habit.deleteMany()
})

// ─── Health Check ─────────────────────────────────────────────────────────────

describe('GET /api/health', () => {
  it('should return { status: "ok" }', async () => {
    const res = await request.get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
  })
})

// ─── GET /api/habits ──────────────────────────────────────────────────────────

describe('GET /api/habits', () => {
  it('should return 200 and an empty array when no habits exist', async () => {
    const res = await request.get('/api/habits')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  it('should return all habits when they exist', async () => {
    await prisma.habit.createMany({
      data: [
        { name: 'Exercise', color: '#6366f1' },
        { name: 'Read', color: '#22c55e' },
      ],
    })

    const res = await request.get('/api/habits')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(2)
    expect(res.body[0]).toHaveProperty('name', 'Exercise')
    expect(res.body[1]).toHaveProperty('name', 'Read')
  })
})

// ─── POST /api/habits ─────────────────────────────────────────────────────────

describe('POST /api/habits', () => {
  it('should create a habit and return 201 with the new habit', async () => {
    const res = await request.post('/api/habits').send({
      name: 'Morning Run',
      description: 'Run 5km every morning',
      color: '#f59e0b',
    })

    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({
      name: 'Morning Run',
      description: 'Run 5km every morning',
      color: '#f59e0b',
      currentStreak: 0,
    })
    expect(res.body.id).toBeDefined()
  })

  it('should return 400 if habit name is missing', async () => {
    const res = await request.post('/api/habits').send({
      description: 'No name provided',
      color: '#6366f1',
    })

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error')
  })

  it('should return 400 if habit name is an empty string', async () => {
    const res = await request.post('/api/habits').send({ name: '   ' })

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error')
  })
})

// ─── POST /api/habits/:id/log ─────────────────────────────────────────────────

describe('POST /api/habits/:id/log', () => {
  it('should mark today as completed and return the updated log', async () => {
    const habit = await prisma.habit.create({ data: { name: 'Meditate' } })

    const res = await request.post(`/api/habits/${habit.id}/log`)

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      habitId: habit.id,
      completed: true,
    })
  })

  it('should be idempotent — marking twice still returns 200', async () => {
    const habit = await prisma.habit.create({ data: { name: 'Yoga' } })

    await request.post(`/api/habits/${habit.id}/log`)
    const res = await request.post(`/api/habits/${habit.id}/log`)

    expect(res.status).toBe(200)
    expect(res.body.completed).toBe(true)
  })
})

// ─── GET /api/habits/:id/streak ───────────────────────────────────────────────

describe('GET /api/habits/:id/streak', () => {
  it('should calculate a streak of 1 after marking today', async () => {
    const habit = await prisma.habit.create({ data: { name: 'Journal' } })

    await request.post(`/api/habits/${habit.id}/log`)

    const res = await request.get(`/api/habits/${habit.id}/streak`)

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      currentStreak: 1,
      totalDays: 1,
    })
    expect(typeof res.body.longestStreak).toBe('number')
  })

  it('should return 0 streak when habit has no logs', async () => {
    const habit = await prisma.habit.create({ data: { name: 'No logs' } })

    const res = await request.get(`/api/habits/${habit.id}/streak`)

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ currentStreak: 0, longestStreak: 0, totalDays: 0 })
  })
})

// ─── DELETE /api/habits/:id ───────────────────────────────────────────────────

describe('DELETE /api/habits/:id', () => {
  it('should delete a habit and return 204', async () => {
    const habit = await prisma.habit.create({ data: { name: 'To Delete' } })

    const res = await request.delete(`/api/habits/${habit.id}`)
    expect(res.status).toBe(204)

    // Confirm it's gone
    const check = await prisma.habit.findUnique({ where: { id: habit.id } })
    expect(check).toBeNull()
  })

  it('should also delete all logs when a habit is deleted (cascade)', async () => {
    const habit = await prisma.habit.create({ data: { name: 'With Logs' } })

    // Add a log
    await request.post(`/api/habits/${habit.id}/log`)

    // Delete the habit
    await request.delete(`/api/habits/${habit.id}`)

    // Confirm logs are gone
    const logs = await prisma.habitLog.findMany({ where: { habitId: habit.id } })
    expect(logs).toHaveLength(0)
  })
})

// ─── GET /api/habits/:id/logs ─────────────────────────────────────────────────

describe('GET /api/habits/:id/logs', () => {
  it('should return logs for a habit', async () => {
    const habit = await prisma.habit.create({ data: { name: 'Read' } })
    await request.post(`/api/habits/${habit.id}/log`)

    const res = await request.get(`/api/habits/${habit.id}/logs`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body).toHaveLength(1)
    expect(res.body[0]).toMatchObject({ habitId: habit.id, completed: true })
  })
})
