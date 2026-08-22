// ─── Worker Entry Point (Production) ─────────────────────────────────────────
// Lắng nghe hàng đợi BullMQ, nhận job, khởi tạo Playwright, chạy kịch bản
// qua Executor, cập nhật kết quả vào PostgreSQL.
// ─────────────────────────────────────────────────────────────────────────────
require('dotenv').config();

const { Worker } = require('bullmq');
const Redis = require('ioredis');
const { createBrowserSession } = require('./browser');
const { updateExecutionStatus } = require('./db');
const { executeWorkflow, createExecutionContext, convertFlatStepsToNodes } = require('./executor');
const { SCREENSHOTS_DIR } = require('./actions/media');

// ─── Redis Connection ────────────────────────────────────────────────────────
const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

// ─── BullMQ Worker ───────────────────────────────────────────────────────────
const worker = new Worker(
  'rpaExecutionQueue',
  async (job) => {
    const { executionId, scriptId, scriptTitle, targetUrl, steps, workflowData } = job.data;

    console.log(`\n${'═'.repeat(60)}`);
    console.log(`[Worker] Job ${job.id} | Script: "${scriptTitle}" (#${scriptId})`);
    console.log(`[Worker] Execution #${executionId} | Target: ${targetUrl}`);
    console.log(`${'═'.repeat(60)}\n`);

    // Khởi tạo browser session
    const session = await createBrowserSession();
    const { page, context: browserCtx, close: closeSession } = session;

    try {
      // ── 1. Đánh dấu RUNNING ──────────────────────────────────────────
      await updateExecutionStatus(executionId, 'RUNNING', {
        startedAt: new Date(),
      });

      // ── 2. Xác định danh sách nodes cần thực thi ─────────────────────
      let nodes;

      if (workflowData && workflowData.nodes && workflowData.nodes.length > 0) {
        // Cấu trúc cây mới (từ Drag-and-Drop Editor)
        nodes = workflowData.nodes;
        console.log(`[Worker] Using workflow tree: ${nodes.length} root nodes`);
      } else if (steps && steps.length > 0) {
        // Mảng phẳng (dữ liệu cũ) → chuyển đổi sang cấu trúc node
        nodes = convertFlatStepsToNodes(steps);
        console.log(`[Worker] Using flat steps (converted): ${nodes.length} steps`);
      } else {
        throw new Error('No steps or workflow_data provided in job data');
      }

      // ── 3. Tạo Execution Context ─────────────────────────────────────
      const initialVariables = {
        targetUrl,
        scriptTitle,
        scriptId: String(scriptId),
        executionId: String(executionId),
        screenshotsDir: SCREENSHOTS_DIR,
      };

      if (workflowData && workflowData.variables) {
        // Thêm các biến mặc định từ workflow
        for (const v of workflowData.variables) {
          initialVariables[v.name] = v.defaultValue;
        }
      }

      const execContext = createExecutionContext(browserCtx, executionId, initialVariables);

      // ── 4. Thực thi kịch bản ─────────────────────────────────────────
      console.log(`[Worker] Starting execution with ${Object.keys(initialVariables).length} initial variables...\n`);
      await executeWorkflow(page, execContext, nodes);

      // ── 5. Hoàn tất: Đánh dấu SUCCESS ────────────────────────────────
      await updateExecutionStatus(executionId, 'SUCCESS', {
        finishedAt: new Date(),
      });

      const skippedCount = execContext.errors.length;
      console.log(`\n[Worker] ✅ Execution #${executionId} completed successfully`);
      console.log(`[Worker]   Total steps: ${execContext.stepCounter}`);
      if (skippedCount > 0) {
        console.log(`[Worker]   Skipped errors (continueOnError): ${skippedCount}`);
      }
      console.log(`[Worker]   Final variables: ${JSON.stringify(execContext.variables, null, 2).substring(0, 500)}`);

    } catch (err) {
      // ── Lỗi: Chụp ảnh lỗi & đánh dấu FAILED ────────────────────────
      console.error(`\n[Worker] ❌ Execution #${executionId} FAILED: ${err.message}`);

      // Cố gắng chụp ảnh màn hình tại thời điểm lỗi
      try {
        const errorScreenshotPath = `${SCREENSHOTS_DIR}/error_exec_${executionId}_${Date.now()}.png`;
        await page.screenshot({ path: errorScreenshotPath, fullPage: true });
        console.log(`[Worker]   Error screenshot saved: ${errorScreenshotPath}`);
      } catch (screenshotErr) {
        console.error(`[Worker]   Failed to capture error screenshot: ${screenshotErr.message}`);
      }

      await updateExecutionStatus(executionId, 'FAILED', {
        finishedAt: new Date(),
        errorMessage: err.message,
      });

      throw err; // Re-throw để BullMQ đánh dấu job failed
    } finally {
      // ── Luôn đóng browser ────────────────────────────────────────────
      await closeSession();
    }
  },
  {
    connection: redisConnection,
    concurrency: parseInt(process.env.WORKER_CONCURRENCY || '1', 10),
  }
);

// ─── Event Handlers ──────────────────────────────────────────────────────────
worker.on('completed', (job) => {
  console.log(`[Worker] ✅ Job ${job.id} finished successfully\n`);
});

worker.on('failed', (job, err) => {
  console.error(`[Worker] ❌ Job ${job?.id} failed: ${err.message}\n`);
});

worker.on('error', (err) => {
  console.error('[Worker] Worker error:', err.message);
});

// ─── Startup ─────────────────────────────────────────────────────────────────
console.log('═'.repeat(60));
console.log('  🤖 RPA Worker Engine is running');
console.log(`  Queue: rpaExecutionQueue`);
console.log(`  Concurrency: ${process.env.WORKER_CONCURRENCY || 1}`);
console.log(`  Screenshots: ${SCREENSHOTS_DIR}`);
console.log('═'.repeat(60));
