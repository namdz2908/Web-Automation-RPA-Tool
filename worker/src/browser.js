// ─── Playwright Browser Manager ──────────────────────────────────────────────
// Quản lý vòng đời trình duyệt Playwright: khởi tạo, tạo context & page,
// và dọn dẹp an toàn sau khi thực thi xong (kể cả khi xảy ra lỗi).
// ─────────────────────────────────────────────────────────────────────────────
const { chromium } = require('playwright');

/**
 * Cấu hình mặc định cho Browser.
 */
const DEFAULT_BROWSER_OPTIONS = {
  headless: process.env.HEADLESS !== 'false', // Mặc định headless=true
  slowMo: parseInt(process.env.SLOW_MO || '0', 10),
};

const DEFAULT_CONTEXT_OPTIONS = {
  viewport: { width: 1280, height: 720 },
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  locale: 'vi-VN',
  timezoneId: 'Asia/Ho_Chi_Minh',
};

/**
 * Tạo một phiên trình duyệt mới (browser + context + page).
 * Trả về object { browser, context, page, close }.
 * GỌI close() trong finally block để đảm bảo giải phóng tài nguyên.
 */
async function createBrowserSession(options = {}) {
  const browserOptions = { ...DEFAULT_BROWSER_OPTIONS, ...options.browser };
  const contextOptions = { ...DEFAULT_CONTEXT_OPTIONS, ...options.context };

  console.log('[Browser] Launching Chromium...', {
    headless: browserOptions.headless,
    slowMo: browserOptions.slowMo,
  });

  const browser = await chromium.launch(browserOptions);
  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();

  console.log('[Browser] Session ready — viewport:', contextOptions.viewport);

  return {
    browser,
    context,
    page,

    /**
     * Đóng browser an toàn. Luôn gọi trong finally block.
     */
    async close() {
      try {
        await context.close();
        await browser.close();
        console.log('[Browser] Session closed');
      } catch (err) {
        console.error('[Browser] Error closing session:', err.message);
      }
    },
  };
}

module.exports = { createBrowserSession, DEFAULT_BROWSER_OPTIONS, DEFAULT_CONTEXT_OPTIONS };
