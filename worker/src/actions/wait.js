// ─── Wait Action Handlers ────────────────────────────────────────────────────
// WAIT_TIME, WAIT_ELEMENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Tạm dừng một khoảng thời gian cố định (ms).
 */
async function WAIT_TIME(page, props) {
  const { duration = 1000 } = props;
  console.log(`[Action] WAIT_TIME → ${duration}ms`);
  await page.waitForTimeout(duration);
}

/**
 * Chờ element xuất hiện hoặc biến mất trên trang.
 * state: 'visible' | 'hidden' | 'attached' | 'detached'
 */
async function WAIT_ELEMENT(page, props) {
  const { selector, state = 'visible', timeout = 30000 } = props;
  console.log(`[Action] WAIT_ELEMENT → ${selector} (state: ${state}, timeout: ${timeout}ms)`);
  await page.locator(selector).waitFor({ state, timeout });
}

module.exports = { WAIT_TIME, WAIT_ELEMENT };
