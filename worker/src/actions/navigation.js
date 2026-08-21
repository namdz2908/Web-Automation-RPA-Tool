// ─── Navigation Action Handlers ──────────────────────────────────────────────
// GOTO, RELOAD, GO_BACK, GO_FORWARD
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Điều hướng đến URL chỉ định.
 * @param {import('playwright').Page} page
 * @param {object} props - { url, waitUntil, timeout }
 */
async function GOTO(page, props) {
  const { url, waitUntil = 'domcontentloaded', timeout = 30000 } = props;
  console.log(`[Action] GOTO → ${url} (waitUntil: ${waitUntil})`);
  await page.goto(url, { waitUntil, timeout });
}

/**
 * Tải lại trang hiện tại.
 */
async function RELOAD(page, props) {
  const { waitUntil = 'domcontentloaded' } = props;
  console.log(`[Action] RELOAD (waitUntil: ${waitUntil})`);
  await page.reload({ waitUntil });
}

/**
 * Quay lại trang trước đó.
 */
async function GO_BACK(page) {
  console.log('[Action] GO_BACK');
  await page.goBack();
}

/**
 * Tiến đến trang kế tiếp.
 */
async function GO_FORWARD(page) {
  console.log('[Action] GO_FORWARD');
  await page.goForward();
}

module.exports = { GOTO, RELOAD, GO_BACK, GO_FORWARD };
