// ─── Dialog Action Handlers ──────────────────────────────────────────────────
// HANDLE_ALERT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Xử lý hộp thoại Alert / Confirm / Prompt.
 * Phải được gọi TRƯỚC khi hành động gây ra dialog (ví dụ click nút).
 * Hoặc thiết lập listener trong executor trước khi chạy step gây dialog.
 *
 * Cách dùng đơn giản: đăng ký listener once cho dialog tiếp theo.
 */
async function HANDLE_ALERT(page, props) {
  const { action = 'accept', promptText = '' } = props;
  console.log(`[Action] HANDLE_ALERT → ${action} (promptText: "${promptText}")`);

  // Đăng ký handler cho dialog tiếp theo
  page.once('dialog', async (dialog) => {
    console.log(`[Action] Dialog appeared: type=${dialog.type()}, message="${dialog.message()}"`);
    if (action === 'accept') {
      await dialog.accept(promptText || undefined);
    } else {
      await dialog.dismiss();
    }
  });
}

module.exports = { HANDLE_ALERT };
