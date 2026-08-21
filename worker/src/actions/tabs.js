// ─── Tab Action Handlers ─────────────────────────────────────────────────────
// NEW_TAB, CLOSE_TAB, SWITCH_TAB
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Mở tab mới với URL chỉ định.
 * Trả về page mới — executor sẽ cập nhật context.page.
 * @returns {import('playwright').Page} page mới
 */
async function NEW_TAB(page, props, context) {
  const { url } = props;
  console.log(`[Action] NEW_TAB → ${url}`);
  const newPage = await context.browserContext.newPage();
  await newPage.goto(url);
  return newPage;
}

/**
 * Đóng tab hiện tại và chuyển về tab trước đó.
 * @returns {import('playwright').Page} page trước đó
 */
async function CLOSE_TAB(page, props, context) {
  console.log('[Action] CLOSE_TAB');
  await page.close();

  // Chuyển về tab cuối cùng còn mở
  const pages = context.browserContext.pages();
  const previousPage = pages[pages.length - 1];
  return previousPage;
}

/**
 * Chuyển sang tab theo index (0 = tab đầu tiên).
 * @returns {import('playwright').Page} page được chuyển tới
 */
async function SWITCH_TAB(page, props, context) {
  const { tabIndex = 0 } = props;
  const pages = context.browserContext.pages();
  console.log(`[Action] SWITCH_TAB → index ${tabIndex} (total: ${pages.length} tabs)`);

  if (tabIndex < 0 || tabIndex >= pages.length) {
    throw new Error(`Tab index ${tabIndex} out of range (0..${pages.length - 1})`);
  }

  const targetPage = pages[tabIndex];
  await targetPage.bringToFront();
  return targetPage;
}

module.exports = { NEW_TAB, CLOSE_TAB, SWITCH_TAB };
