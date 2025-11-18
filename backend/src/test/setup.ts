// Test Setup
// Global test configuration and utilities

import { afterEach, beforeEach } from 'vitest';
import { resetFactoryCounter } from './factories';

// Reset factory counter before each test
beforeEach(() => {
  resetFactoryCounter();
});

// Clean up after each test
afterEach(() => {
  // Add any global cleanup here
});

// Mock environment variables for tests
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test';
process.env.LOG_LEVEL = 'error'; // Reduce noise in tests
