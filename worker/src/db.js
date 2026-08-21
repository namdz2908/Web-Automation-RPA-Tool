// ─── Worker Database Client ──────────────────────────────────────────────────
// Kết nối PostgreSQL và cung cấp các hàm cập nhật kết quả thực thi kịch bản.
// ─────────────────────────────────────────────────────────────────────────────
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('[Worker DB] Unexpected error on idle client:', err.message);
});

/**
 * Cập nhật trạng thái lượt chạy (execution).
 * @param {number} executionId
 * @param {string} status - 'RUNNING' | 'SUCCESS' | 'FAILED'
 * @param {object} details - { startedAt, finishedAt, errorMessage }
 */
async function updateExecutionStatus(executionId, status, details = {}) {
  const fields = ['status = $2'];
  const values = [executionId, status];
  let paramIndex = 3;

  if (details.startedAt) {
    fields.push(`started_at = $${paramIndex++}`);
    values.push(details.startedAt);
  }
  if (details.finishedAt) {
    fields.push(`finished_at = $${paramIndex++}`);
    values.push(details.finishedAt);
  }
  if (details.errorMessage !== undefined) {
    fields.push(`error_message = $${paramIndex++}`);
    values.push(details.errorMessage);
  }

  const query = `UPDATE executions SET ${fields.join(', ')} WHERE id = $1`;
  await pool.query(query, values);
  console.log(`[Worker DB] Execution #${executionId} → ${status}`);
}

/**
 * Lưu kết quả từng bước thực thi vào bảng execution_results.
 * @param {number} executionId
 * @param {object} stepResult - { stepIndex, actionType, screenshotUrl, extractedText }
 */
async function saveStepResult(executionId, stepResult) {
  const { stepIndex, actionType, screenshotUrl, extractedText } = stepResult;
  await pool.query(
    `INSERT INTO execution_results (execution_id, step_index, action_type, screenshot_url, extracted_text)
     VALUES ($1, $2, $3, $4, $5)`,
    [executionId, stepIndex, actionType, screenshotUrl || null, extractedText || null]
  );
  console.log(`[Worker DB] Step ${stepIndex} (${actionType}) saved for execution #${executionId}`);
}

module.exports = { pool, updateExecutionStatus, saveStepResult };
