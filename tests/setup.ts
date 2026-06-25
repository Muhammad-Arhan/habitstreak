/**
 * Global test setup.
 * This file runs before any test suite.
 * For integration tests, it ensures the Prisma client
 * uses the TEST_DATABASE_URL so we never touch the dev database.
 */

// Use the test database URL if provided
if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL
}

// Ensure we're in test mode
process.env.NODE_ENV = 'test'
