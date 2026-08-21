// ─── Frame (iFrame) Action Handlers ──────────────────────────────────────────
// SWITCH_TO_FRAME, SWITCH_TO_MAIN
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Chuyển ngữ cảnh vào bên trong iframe.
 * Trả về FrameLocator — executor sẽ dùng frame.locator() thay vì page.locator().
 * @returns {import('playwright').FrameLocator}
 */
async function SWITCH_TO_FRAME(page, props) {
  const { selector } = props;
  console.log(`[Action] SWITCH_TO_FRAME → ${selector}`);

  const frame = page.frameLocator(selector);
  // Kiểm tra frame tồn tại bằng cách tìm body bên trong
  await frame.locator('body').waitFor({ timeout: 10000 });
  return frame;
}

/**
 * Quay về trang chính (thoát khỏi iframe).
 * Executor chỉ cần reset context.currentFrame = null.
 */
async function SWITCH_TO_MAIN(page) {
  console.log('[Action] SWITCH_TO_MAIN');
  // Không cần thao tác Playwright — executor sẽ dùng lại page trực tiếp
  return null;
}

module.exports = { SWITCH_TO_FRAME, SWITCH_TO_MAIN };
