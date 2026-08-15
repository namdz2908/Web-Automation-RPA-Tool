// ─── Scripts Router: CRUD Kịch bản ───────────────────────────────────────────
const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// ─── Helper: Validate steps array ────────────────────────────────────────────
const VALID_TYPES = ['GOTO', 'CLICK', 'TYPE', 'WAIT', 'SCREENSHOT', 'EXTRACT_TEXT'];

function validateSteps(steps) {
  if (!Array.isArray(steps)) return 'steps phải là một mảng (array)';
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    if (!step.type || !VALID_TYPES.includes(step.type)) {
      return `Bước ${i + 1}: type không hợp lệ. Cho phép: ${VALID_TYPES.join(', ')}`;
    }
    if (step.type === 'GOTO' && !step.value) {
      return `Bước ${i + 1} (GOTO): thiếu trường "value" (URL)`;
    }
    if (['CLICK', 'TYPE', 'EXTRACT_TEXT'].includes(step.type) && !step.selector) {
      return `Bước ${i + 1} (${step.type}): thiếu trường "selector"`;
    }
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/scripts
// Lấy toàn bộ danh sách kịch bản (của user_id = 1 mặc định trong Phase 1)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, user_id, title, description, target_url, steps,
              created_at, updated_at
       FROM scripts
       ORDER BY created_at DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('[GET /scripts]', err.message);
    res.status(500).json({ success: false, error: 'Lỗi server khi lấy danh sách kịch bản' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/scripts/:id
// Lấy chi tiết 1 kịch bản
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT id, user_id, title, description, target_url, steps,
              created_at, updated_at
       FROM scripts WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy kịch bản' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('[GET /scripts/:id]', err.message);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/scripts
// Tạo mới kịch bản
// Body: { title, description?, target_url, steps }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { title, description, target_url, steps, user_id = 1 } = req.body;

    // Validation cơ bản
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Thiếu trường "title"' });
    }
    if (!target_url || !target_url.trim()) {
      return res.status(400).json({ success: false, error: 'Thiếu trường "target_url"' });
    }
    if (!steps) {
      return res.status(400).json({ success: false, error: 'Thiếu trường "steps"' });
    }

    const stepsError = validateSteps(steps);
    if (stepsError) {
      return res.status(400).json({ success: false, error: stepsError });
    }

    const result = await pool.query(
      `INSERT INTO scripts (user_id, title, description, target_url, steps)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [user_id, title.trim(), description || null, target_url.trim(), JSON.stringify(steps)]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('[POST /scripts]', err.message);
    res.status(500).json({ success: false, error: 'Lỗi server khi tạo kịch bản' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/scripts/:id
// Cập nhật kịch bản (partial update: chỉ cập nhật field được gửi lên)
// ─────────────────────────────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, target_url, steps } = req.body;

    // Kiểm tra kịch bản tồn tại
    const existing = await pool.query('SELECT id FROM scripts WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy kịch bản' });
    }

    // Validate steps nếu được gửi lên
    if (steps !== undefined) {
      const stepsError = validateSteps(steps);
      if (stepsError) {
        return res.status(400).json({ success: false, error: stepsError });
      }
    }

    // Build dynamic UPDATE query
    const fields = [];
    const values = [];
    let paramIdx = 1;

    if (title !== undefined)      { fields.push(`title = $${paramIdx++}`);       values.push(title.trim()); }
    if (description !== undefined){ fields.push(`description = $${paramIdx++}`); values.push(description); }
    if (target_url !== undefined) { fields.push(`target_url = $${paramIdx++}`);  values.push(target_url.trim()); }
    if (steps !== undefined)      { fields.push(`steps = $${paramIdx++}`);       values.push(JSON.stringify(steps)); }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, error: 'Không có field nào được cập nhật' });
    }

    values.push(id);
    const result = await pool.query(
      `UPDATE scripts SET ${fields.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
      values
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('[PUT /scripts/:id]', err.message);
    res.status(500).json({ success: false, error: 'Lỗi server khi cập nhật kịch bản' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/scripts/:id
// Xóa kịch bản (cascade xóa executions và results liên quan)
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM scripts WHERE id = $1 RETURNING id, title',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy kịch bản' });
    }
    res.json({
      success: true,
      message: `Đã xóa kịch bản "${result.rows[0].title}"`,
      deleted: result.rows[0],
    });
  } catch (err) {
    console.error('[DELETE /scripts/:id]', err.message);
    res.status(500).json({ success: false, error: 'Lỗi server khi xóa kịch bản' });
  }
});

module.exports = router;
