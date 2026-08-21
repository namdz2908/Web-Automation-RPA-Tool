// ─── Keyboard Action Handlers ────────────────────────────────────────────────
// TYPE, PRESS_KEY, CLEAR_INPUT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Nhập text vào ô input.
 * Hỗ trợ clearFirst (xóa text cũ) và typeDelay (mô phỏng gõ từng phím).
 */
async function TYPE(page, props) {
  const { selector, value, clearFirst = true, typeDelay = 0, timeout = 10000 } = props;
  console.log(`[Action] TYPE → ${selector}: "${value}" (clearFirst=${clearFirst}, delay=${typeDelay}ms)`);

  const locator = page.locator(selector);
  await locator.waitFor({ state: 'visible', timeout });

  if (clearFirst) {
    // Dùng fill() để xóa và nhập mới (nhanh, không có delay)
    if (typeDelay === 0) {
      await locator.fill(value);
      return;
    }
    // Nếu có typeDelay, xóa trước rồi gõ từng phím
    await locator.fill('');
  }

  if (typeDelay > 0) {
    await locator.pressSequentially(value, { delay: typeDelay });
  } else {
    await locator.fill(value);
  }
}

/**
 * Nhấn phím hoặc tổ hợp phím (Enter, Tab, Ctrl+A...).
 */
async function PRESS_KEY(page, props) {
  const { key, selector } = props;
  console.log(`[Action] PRESS_KEY → "${key}" ${selector ? `on ${selector}` : '(page-level)'}`);

  if (selector) {
    await page.locator(selector).press(key);
  } else {
    await page.keyboard.press(key);
  }
}

/**
 * Xóa toàn bộ nội dung trong ô input.
 */
async function CLEAR_INPUT(page, props) {
  const { selector } = props;
  console.log(`[Action] CLEAR_INPUT → ${selector}`);
  await page.locator(selector).fill('');
}

module.exports = { TYPE, PRESS_KEY, CLEAR_INPUT };
