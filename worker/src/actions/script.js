// ─── JavaScript Action Handlers ──────────────────────────────────────────────
// EXECUTE_JAVASCRIPT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Chạy đoạn mã JavaScript tùy chỉnh trên trang thông qua page.evaluate().
 * Hỗ trợ lưu kết quả trả về vào biến runtime.
 * @returns {*} Kết quả trả về từ page.evaluate()
 */
async function EXECUTE_JAVASCRIPT(page, props) {
  const { code } = props;
  console.log(`[Action] EXECUTE_JAVASCRIPT → ${code.substring(0, 80)}...`);

  // Bọc code trong Function để hỗ trợ cú pháp "return ..."
  const wrappedCode = `
    (function() {
      ${code}
    })()
  `;

  const result = await page.evaluate(wrappedCode);
  console.log(`[Action] EXECUTE_JAVASCRIPT result:`, result);
  return result;
}

module.exports = { EXECUTE_JAVASCRIPT };
