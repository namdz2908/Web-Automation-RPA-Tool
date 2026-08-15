// ─── Executions Router: Kích hoạt & Theo dõi Lượt chạy ──────────────────────
const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { executionQueue } = require('../queue');

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/scripts/:id/run
// Kích hoạt thực thi kịch bản ngay lập tức:
//   1. Lấy thông tin kịch bản từ DB
//   2. Tạo bản ghi execution (status = PENDING)
//   3. Đẩy job vào BullMQ Redis Queue
//   4. Trả về executionId để client polling/WebSocket
// ─────────────────────────────────────────────────────────────────────────────
router.post('/scripts/:id/run', async (req, res) => {
  const { id } = req.params;

  try {
    // 1️⃣ Lấy kịch bản từ DB
    const scriptResult = await pool.query(
      'SELECT id, title, target_url, steps FROM scripts WHERE id = $1',
      [id]
    );

    if (scriptResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy kịch bản' });
    }

    const script = scriptResult.rows[0];

    // 2️⃣ Tạo bản ghi Execution với status = PENDING
    const execResult = await pool.query(
      `INSERT INTO executions (script_id, status)
       VALUES ($1, 'PENDING')
       RETURNING id, script_id, status, created_at`,
      [script.id]
    );

    const execution = execResult.rows[0];
    const executionId = execution.id;

    // 3️⃣ Đẩy Job vào Redis Queue
    const job = await executionQueue.add(
      'executeScriptJob',
      {
        executionId,
        scriptId: script.id,
        scriptTitle: script.title,
        targetUrl: script.target_url,
        steps: script.steps,
      },
      { jobId: `exec_${executionId}` }
    );

    console.log(
      `[API] ▶ Script "${script.title}" queued | executionId=${executionId} | jobId=${job.id}`
    );

    // 4️⃣ Trả về thông tin để client theo dõi
    res.status(202).json({
      success: true,
      message: `Kịch bản "${script.title}" đã được đưa vào hàng đợi thực thi`,
      data: {
        executionId,
        scriptId: script.id,
        scriptTitle: script.title,
        status: 'PENDING',
        jobId: job.id,
      },
    });
  } catch (err) {
    console.error(`[POST /scripts/${id}/run]`, err.message);
    res.status(500).json({ success: false, error: 'Lỗi server khi kích hoạt kịch bản' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/executions
// Lấy danh sách tất cả lượt chạy (gần nhất trước)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/executions', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.id, e.script_id, s.title AS script_title,
              e.status, e.error_message,
              e.started_at, e.finished_at, e.created_at
       FROM executions e
       JOIN scripts s ON e.script_id = s.id
       ORDER BY e.created_at DESC
       LIMIT 100`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('[GET /executions]', err.message);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/executions/:id
// Lấy chi tiết 1 lượt chạy + danh sách kết quả (screenshots, extracted text)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/executions/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Lấy thông tin execution
    const execResult = await pool.query(
      `SELECT e.id, e.script_id, s.title AS script_title,
              e.status, e.error_message,
              e.started_at, e.finished_at, e.created_at
       FROM executions e
       JOIN scripts s ON e.script_id = s.id
       WHERE e.id = $1`,
      [id]
    );

    if (execResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy lượt chạy' });
    }

    // Lấy các output kết quả
    const resultsResult = await pool.query(
      `SELECT id, step_index, action_type, screenshot_url, extracted_text, created_at
       FROM execution_results
       WHERE execution_id = $1
       ORDER BY step_index ASC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...execResult.rows[0],
        results: resultsResult.rows,
      },
    });
  } catch (err) {
    console.error('[GET /executions/:id]', err.message);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

module.exports = router;
