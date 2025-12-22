// Routes
export { default as authRouter } from './routes/auth.js';
export { default as gatesRouter } from './routes/gates.js';
export { default as keysRouter } from './routes/keys.js';
export { default as logsRouter } from './routes/logs.js';
export { default as completeRouter } from './routes/v2/complete.js';

// Middleware
export { authenticate } from './middleware/auth.js';

// Database
export { db } from './lib/db/postgres.js';
export { default as redis } from './lib/db/redis.js';

// Session Key Utilities (for Next.js auth)
export const createSessionKey = async (userId: string): Promise<string> => {
  const { db } = await import('./lib/db/postgres.js');
  return db.createSessionKey(userId);
};

export const deleteSessionKeysForUser = async (userId: string): Promise<void> => {
  const { db } = await import('./lib/db/postgres.js');
  return db.deleteSessionKeysForUser(userId);
};

// Services
export * from './services/task-analysis.js';
