-- ============================================================
--  RPA Tool - Seed Data Script
--  File: database/seed.sql
--  Tạo dữ liệu mẫu để test: 1 user + 2 kịch bản
-- ============================================================

-- ─── Seed User mẫu (id = 1) ──────────────────────────────────
-- password_hash tương ứng với plaintext: "password123"
-- (hash Bcrypt $2b$10$... - chỉ dùng để test, KHÔNG dùng production)
INSERT INTO users (id, username, email, password_hash)
VALUES (
    1,
    'admin',
    'admin@rpa-tool.local',
    '$2b$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cgrMnAPBXuF.MtdqWerYHGa'
)
ON CONFLICT (id) DO NOTHING;

-- Reset sequence sau khi insert với id cố định
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- ─── Seed Kịch bản 1: Auto Login & Screenshot ────────────────
INSERT INTO scripts (user_id, title, description, target_url, steps)
VALUES (
    1,
    'Auto Login & Take Screenshot',
    'Kịch bản mẫu: tự động điền form đăng nhập vào trang example.com và chụp ảnh màn hình sau khi đăng nhập thành công.',
    'https://example.com',
    '[
        { "type": "GOTO",       "value": "https://example.com" },
        { "type": "WAIT",       "value": 1500 },
        { "type": "SCREENSHOT", "filename": "homepage_loaded.png" },
        { "type": "EXTRACT_TEXT", "selector": "h1", "variableName": "page_title" }
    ]'::jsonb
)
ON CONFLICT DO NOTHING;

-- ─── Seed Kịch bản 2: Web Data Scraper ───────────────────────
INSERT INTO scripts (user_id, title, description, target_url, steps)
VALUES (
    1,
    'Quotes Scraper - quotes.toscrape.com',
    'Kịch bản mẫu: Cào danh sách câu trích dẫn từ trang demo quotes.toscrape.com.',
    'https://quotes.toscrape.com',
    '[
        { "type": "GOTO",         "value": "https://quotes.toscrape.com" },
        { "type": "WAIT",         "value": 2000 },
        { "type": "SCREENSHOT",   "filename": "quotes_page.png" },
        { "type": "EXTRACT_TEXT", "selector": ".quote .text",   "variableName": "first_quote" },
        { "type": "EXTRACT_TEXT", "selector": ".quote .author", "variableName": "first_author" },
        { "type": "CLICK",        "selector": "li.next a" },
        { "type": "WAIT",         "value": 1500 },
        { "type": "SCREENSHOT",   "filename": "quotes_page2.png" }
    ]'::jsonb
)
ON CONFLICT DO NOTHING;

-- Reset sequence scripts
SELECT setval('scripts_id_seq', (SELECT MAX(id) FROM scripts));
