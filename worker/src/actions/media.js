// ─── Media Action Handlers ───────────────────────────────────────────────────
// SCREENSHOT
// ─────────────────────────────────────────────────────────────────────────────
const path = require('path');
const fs = require('fs');

// Đảm bảo thư mục screenshots tồn tại
const SCREENSHOTS_DIR = path.resolve(__dirname, '../../screenshots');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

/**
 * Chụp ảnh màn hình (toàn trang hoặc element cụ thể).
 * @returns {string} Đường dẫn file ảnh đã lưu
 */
async function SCREENSHOT(page, props) {
  const {
    outputPath,
    fileName,
    fullPage = true,
    selector,
  } = props;

  // Tạo tên file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const name = fileName || `screenshot_${timestamp}`;
  const saveDir = outputPath || SCREENSHOTS_DIR;

  // Đảm bảo thư mục lưu tồn tại
  if (!fs.existsSync(saveDir)) {
    fs.mkdirSync(saveDir, { recursive: true });
  }

  const filePath = path.join(saveDir, `${name}.png`);

  if (selector) {
    // Chụp element cụ thể
    console.log(`[Action] SCREENSHOT (element) → ${selector} → ${filePath}`);
    await page.locator(selector).screenshot({ path: filePath });
  } else {
    // Chụp toàn trang
    console.log(`[Action] SCREENSHOT (fullPage=${fullPage}) → ${filePath}`);
    await page.screenshot({ path: filePath, fullPage });
  }

  console.log(`[Action] SCREENSHOT saved: ${filePath}`);
  return filePath;
}

module.exports = { SCREENSHOT, SCREENSHOTS_DIR };
