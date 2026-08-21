// ─── Scroll Action Handlers ──────────────────────────────────────────────────
// SCROLL_TO, SCROLL_BY, SCROLL_TO_TOP, SCROLL_TO_BOTTOM
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Cuộn trang đến vị trí element chỉ định.
 */
async function SCROLL_TO(page, props) {
  const { selector } = props;
  console.log(`[Action] SCROLL_TO → ${selector}`);
  await page.locator(selector).scrollIntoViewIfNeeded();
}

/**
 * Cuộn trang theo số pixel chỉ định.
 */
async function SCROLL_BY(page, props) {
  const { x = 0, y = 500 } = props;
  console.log(`[Action] SCROLL_BY → x=${x}, y=${y}`);
  await page.evaluate(({ scrollX, scrollY }) => {
    window.scrollBy(scrollX, scrollY);
  }, { scrollX: x, scrollY: y });
}

/**
 * Cuộn lên đầu trang.
 */
async function SCROLL_TO_TOP(page) {
  console.log('[Action] SCROLL_TO_TOP');
  await page.evaluate(() => window.scrollTo(0, 0));
}

/**
 * Cuộn xuống cuối trang.
 */
async function SCROLL_TO_BOTTOM(page) {
  console.log('[Action] SCROLL_TO_BOTTOM');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
}

module.exports = { SCROLL_TO, SCROLL_BY, SCROLL_TO_TOP, SCROLL_TO_BOTTOM };
