// ─── Mouse Action Handlers ───────────────────────────────────────────────────
// CLICK, DOUBLE_CLICK, RIGHT_CLICK, HOVER, DRAG_AND_DROP
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Tìm element theo selector (hỗ trợ CSS, XPath, Text).
 */
function getLocator(page, selector, selectorType = 'css') {
  switch (selectorType) {
    case 'xpath':
      return page.locator(`xpath=${selector}`);
    case 'text':
      return page.getByText(selector);
    case 'css':
    default:
      return page.locator(selector);
  }
}

async function CLICK(page, props) {
  const { selector, selectorType = 'css', timeout = 10000 } = props;
  console.log(`[Action] CLICK → ${selector} (${selectorType})`);
  const locator = getLocator(page, selector, selectorType);
  await locator.click({ timeout });
}

async function DOUBLE_CLICK(page, props) {
  const { selector, selectorType = 'css' } = props;
  console.log(`[Action] DOUBLE_CLICK → ${selector}`);
  const locator = getLocator(page, selector, selectorType);
  await locator.dblclick();
}

async function RIGHT_CLICK(page, props) {
  const { selector } = props;
  console.log(`[Action] RIGHT_CLICK → ${selector}`);
  await page.locator(selector).click({ button: 'right' });
}

async function HOVER(page, props) {
  const { selector } = props;
  console.log(`[Action] HOVER → ${selector}`);
  await page.locator(selector).hover();
}

async function DRAG_AND_DROP(page, props) {
  const { sourceSelector, targetSelector } = props;
  console.log(`[Action] DRAG_AND_DROP → ${sourceSelector} ➜ ${targetSelector}`);
  await page.locator(sourceSelector).dragTo(page.locator(targetSelector));
}

module.exports = { CLICK, DOUBLE_CLICK, RIGHT_CLICK, HOVER, DRAG_AND_DROP };
