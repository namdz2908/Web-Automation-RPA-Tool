// ─── Redis / BullMQ Queue Setup ───────────────────────────────────────────────
const { Queue } = require('bullmq');
const Redis = require('ioredis');

const QUEUE_NAME = 'rpaExecutionQueue';

const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

redisConnection.on('connect', () => console.log('✅ Redis connected successfully'));
redisConnection.on('error', (err) => console.error('[Redis] Error:', err.message));

const executionQueue = new Queue(QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,                     // Thử lại tối đa 3 lần nếu fail
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { count: 100 }, // Giữ 100 job completed gần nhất
    removeOnFail: { count: 200 },     // Giữ 200 job failed để debug
  },
});

module.exports = { executionQueue, redisConnection, QUEUE_NAME };
