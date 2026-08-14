-- ============================================================
--  RPA Tool - Database Initialization Script
--  File: database/init.sql
--  Chạy tự động khi PostgreSQL container khởi tạo lần đầu
-- ============================================================

-- ─── Extension ───────────────────────────────────────────────
-- pgcrypto để hỗ trợ gen_random_uuid() nếu cần sau này
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─── Bảng 1: users ───────────────────────────────────────────
-- Lưu thông tin tài khoản người dùng
CREATE TABLE IF NOT EXISTS users (
    id           SERIAL PRIMARY KEY,
    username     VARCHAR(50)  UNIQUE NOT NULL,
    email        VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Bảng 2: scripts ─────────────────────────────────────────
-- Lưu định nghĩa kịch bản tự động hóa (steps dạng JSONB)
CREATE TABLE IF NOT EXISTS scripts (
    id          SERIAL PRIMARY KEY,
    user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    target_url  TEXT NOT NULL,
    steps       JSONB NOT NULL DEFAULT '[]',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Bảng 3: executions ──────────────────────────────────────
-- Lịch sử từng lần bấm RUN kịch bản
CREATE TABLE IF NOT EXISTS executions (
    id            SERIAL PRIMARY KEY,
    script_id     INT NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
    status        VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                  CHECK (status IN ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED')),
    error_message TEXT,
    started_at    TIMESTAMP,
    finished_at   TIMESTAMP,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Bảng 4: execution_results ───────────────────────────────
-- Lưu output của từng bước: ảnh screenshot, text cào được
CREATE TABLE IF NOT EXISTS execution_results (
    id              SERIAL PRIMARY KEY,
    execution_id    INT NOT NULL REFERENCES executions(id) ON DELETE CASCADE,
    step_index      INT NOT NULL,
    action_type     VARCHAR(50) NOT NULL,
    screenshot_url  TEXT,
    extracted_text  TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Indexes ─────────────────────────────────────────────────
-- Tối ưu query theo user_id và script_id
CREATE INDEX IF NOT EXISTS idx_scripts_user_id ON scripts(user_id);
CREATE INDEX IF NOT EXISTS idx_executions_script_id ON executions(script_id);
CREATE INDEX IF NOT EXISTS idx_executions_status ON executions(status);
CREATE INDEX IF NOT EXISTS idx_execution_results_execution_id ON execution_results(execution_id);

-- ─── Auto-update updated_at trigger ──────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER scripts_updated_at
    BEFORE UPDATE ON scripts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
