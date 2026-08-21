// ─── Action Dispatcher ───────────────────────────────────────────────────────
// Bảng ánh xạ ACTION_TYPE → handler function.
// Executor gọi executeAction() để dispatch step tới handler tương ứng.
// ─────────────────────────────────────────────────────────────────────────────

const { GOTO, RELOAD, GO_BACK, GO_FORWARD } = require('./navigation');
const { CLICK, DOUBLE_CLICK, RIGHT_CLICK, HOVER, DRAG_AND_DROP } = require('./mouse');
const { TYPE, PRESS_KEY, CLEAR_INPUT } = require('./keyboard');
const { EXTRACT_TEXT, GET_ATTRIBUTE, SELECT_OPTION, SET_CHECKBOX } = require('./element');
const { SCROLL_TO, SCROLL_BY, SCROLL_TO_TOP, SCROLL_TO_BOTTOM } = require('./scroll');
const { WAIT_TIME, WAIT_ELEMENT } = require('./wait');
const { SCREENSHOT } = require('./media');
const { NEW_TAB, CLOSE_TAB, SWITCH_TAB } = require('./tabs');
const { SET_COOKIE, CLEAR_COOKIES } = require('./cookies');
const { HANDLE_ALERT } = require('./dialog');
const { SWITCH_TO_FRAME, SWITCH_TO_MAIN } = require('./frame');
const { EXECUTE_JAVASCRIPT } = require('./script');

/**
 * Bảng ánh xạ toàn bộ action types → handler functions.
 * Mỗi handler nhận (page, props, context) và trả về kết quả (nếu có).
 */
const ACTION_HANDLERS = {
  // Navigation
  GOTO,
  RELOAD,
  GO_BACK,
  GO_FORWARD,

  // Mouse
  CLICK,
  DOUBLE_CLICK,
  RIGHT_CLICK,
  HOVER,
  DRAG_AND_DROP,

  // Keyboard
  TYPE,
  PRESS_KEY,
  CLEAR_INPUT,

  // Element
  EXTRACT_TEXT,
  GET_ATTRIBUTE,
  SELECT_OPTION,
  SET_CHECKBOX,

  // Scroll
  SCROLL_TO,
  SCROLL_BY,
  SCROLL_TO_TOP,
  SCROLL_TO_BOTTOM,

  // Wait
  WAIT_TIME,
  WAIT_ELEMENT,

  // Media
  SCREENSHOT,

  // Tabs
  NEW_TAB,
  CLOSE_TAB,
  SWITCH_TAB,

  // Cookies
  SET_COOKIE,
  CLEAR_COOKIES,

  // Dialog
  HANDLE_ALERT,

  // Frame
  SWITCH_TO_FRAME,
  SWITCH_TO_MAIN,

  // JavaScript
  EXECUTE_JAVASCRIPT,
};

/**
 * Thực thi một action step.
 *
 * @param {import('playwright').Page} page - Playwright page instance
 * @param {object} context - Runtime context { browserContext, variables, ... }
 * @param {object} step - Step object { type, properties, ... }
 * @returns {*} Kết quả trả về từ handler (nếu có: text, path, page mới...)
 */
async function executeAction(page, context, step) {
  const { type, properties = {} } = step;
  const handler = ACTION_HANDLERS[type];

  if (!handler) {
    throw new Error(`[Action Dispatcher] Unknown action type: "${type}"`);
  }

  return await handler(page, properties, context);
}

/**
 * Kiểm tra xem action type có được hỗ trợ không.
 */
function isActionSupported(type) {
  return type in ACTION_HANDLERS;
}

/**
 * Lấy danh sách tất cả action types được hỗ trợ.
 */
function getSupportedActions() {
  return Object.keys(ACTION_HANDLERS);
}

module.exports = { executeAction, isActionSupported, getSupportedActions, ACTION_HANDLERS };
