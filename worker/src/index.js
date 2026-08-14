// ─── Worker Entry Point (Phase 1 Skeleton) ───────────────────────────────────
// Worker đầy đủ sẽ được hoàn thiện ở Phase 2 khi tích hợp Playwright
require('dotenv').config();

const { Worker } = require('bullmq');
const Redis = require('ioredis');

const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  'rpaExecutionQueue',
  async (job) => {
    console.log(`[Worker] Processing job ${job.id}:`, job.data);
    // TODO Phase 2: Gọi Playwright để thực thi steps
    console.log(`[Worker] Job ${job.id} completed (skeleton - no Playwright yet)`);
  },
  { connection: redisConnection }
);

worker.on('completed', (job) => {
  console.log(`[Worker] ✅ Job ${job.id} finished successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`[Worker] ❌ Job ${job?.id} failed:`, err.message);
});

console.log('🤖 RPA Worker is listening for jobs...');
