// ─── Element Action Handlers ─────────────────────────────────────────────────
// EXTRACT_TEXT, GET_ATTRIBUTE, SELECT_OPTION, SET_CHECKBOX
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lấy text (innerText) hoặc attribute từ element, lưu vào biến runtime.
 * @returns {string} Giá trị lấy được — executor sẽ gán vào context.variables
 */
async function EXTRACT_TEXT(page, props) {
  const { selector, attribute, trim = true } = props;
  console.log(`[Action] EXTRACT_TEXT → ${selector} (attribute: ${attribute || 'innerText'})`);

  const locator = page.locator(selector);
  let result;

  if (attribute) {
    result = await locator.getAttribute(attribute);
  } else {
    result = await locator.innerText();
  }

  if (trim && typeof result === 'string') {
    result = result.trim();
  }

  console.log(`[Action] EXTRACT_TEXT result: "${result}"`);
  return result || '';
}

/**
 * Lấy giá trị attribute cụ thể (href, src, class...) từ element.
 * @returns {string}
 */
async function GET_ATTRIBUTE(page, props) {
  const { selector, attribute } = props;
  console.log(`[Action] GET_ATTRIBUTE → ${selector} [${attribute}]`);

  const result = await page.locator(selector).getAttribute(attribute);
  console.log(`[Action] GET_ATTRIBUTE result: "${result}"`);
  return result || '';
}

/**
 * Chọn giá trị trong dropdown <select>.
 */
async function SELECT_OPTION(page, props) {
  const { selector, selectBy = 'value', optionValue } = props;
  console.log(`[Action] SELECT_OPTION → ${selector} (by ${selectBy}: "${optionValue}")`);

  switch (selectBy) {
    case 'label':
      await page.locator(selector).selectOption({ label: optionValue });
      break;
    case 'index':
      await page.locator(selector).selectOption({ index: parseInt(optionValue, 10) });
      break;
    case 'value':
    default:
      await page.locator(selector).selectOption(optionValue);
      break;
  }
}

/**
 * Đánh dấu hoặc bỏ dấu checkbox / radio.
 */
async function SET_CHECKBOX(page, props) {
  const { selector, checked = true } = props;
  console.log(`[Action] SET_CHECKBOX → ${selector} (checked=${checked})`);

  if (checked) {
    await page.locator(selector).check();
  } else {
    await page.locator(selector).uncheck();
  }
}

module.exports = { EXTRACT_TEXT, GET_ATTRIBUTE, SELECT_OPTION, SET_CHECKBOX };
