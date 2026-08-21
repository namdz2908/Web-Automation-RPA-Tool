// ─── Cookie Action Handlers ──────────────────────────────────────────────────
// SET_COOKIE, CLEAR_COOKIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Thiết lập cookie cho browser context hiện tại.
 */
async function SET_COOKIE(page, props, context) {
  const { name, value, domain } = props;
  console.log(`[Action] SET_COOKIE → ${name}=${value} (domain: ${domain || 'current'})`);

  const cookieUrl = domain ? `https://${domain}` : page.url();

  await context.browserContext.addCookies([
    {
      name,
      value,
      url: cookieUrl,
    },
  ]);
}

/**
 * Xóa toàn bộ cookie của browser context hiện tại.
 */
async function CLEAR_COOKIES(page, props, context) {
  console.log('[Action] CLEAR_COOKIES');
  await context.browserContext.clearCookies();
}

module.exports = { SET_COOKIE, CLEAR_COOKIES };
