// ─── Action Definitions: Thư viện hành động tự động hóa ─────────────────────
// Mỗi ActionDefinition mô tả metadata, icon, schema thuộc tính và giá trị mặc
// định cho 1 loại action. Frontend dùng file này để render ActionsPanel và
// PropertyPanel. Worker dùng type string để dispatch tới handler tương ứng.
// ─────────────────────────────────────────────────────────────────────────────

import type { ActionDefinition, ActionCategory } from "@/types/workflow";

// ─── Category Metadata ───────────────────────────────────────────────────────
export interface CategoryMeta {
  name: ActionCategory;
  icon: string;
  color: string;
}

export const CATEGORY_META: CategoryMeta[] = [
  { name: "Flow Control", icon: "🔀", color: "#8B5CF6" },
  { name: "Browser - Navigation", icon: "🧭", color: "#3B82F6" },
  { name: "Browser - Mouse", icon: "🖱️", color: "#10B981" },
  { name: "Browser - Keyboard", icon: "⌨️", color: "#F59E0B" },
  { name: "Browser - Element", icon: "🔲", color: "#6366F1" },
  { name: "Browser - Scroll", icon: "📜", color: "#14B8A6" },
  { name: "Browser - Tab & Popup", icon: "📑", color: "#EC4899" },
  { name: "Browser - Cookie", icon: "🍪", color: "#F97316" },
  { name: "Browser - Alert", icon: "⚠️", color: "#EF4444" },
  { name: "Browser - Javascript", icon: "💛", color: "#EAB308" },
  { name: "Browser - Switch", icon: "🔄", color: "#06B6D4" },
  { name: "Mail", icon: "📧", color: "#8B5CF6" },
  { name: "AI", icon: "🤖", color: "#A855F7" },
  { name: "References", icon: "📚", color: "#64748B" },
  { name: "Google Service", icon: "🟢", color: "#34D399" },
];

// ═══════════════════════════════════════════════════════════════════════════════
//  ACTION DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const ACTION_DEFINITIONS: ActionDefinition[] = [
  // ─── Flow Control ──────────────────────────────────────────────────────────
  {
    type: "NORMAL_BLOCK",
    label: "Normal Block",
    category: "Flow Control",
    icon: "📋",
    description: "Nhóm các bước lại thành một khối. Hỗ trợ đặt tên và ghi chú.",
    isContainer: true,
    propertyFields: [
      { key: "blockName", label: "Block name", type: "text", placeholder: "e.g. Main logic" },
    ],
    defaultProperties: { blockName: "" },
  },
  {
    type: "CONDITION_BLOCK",
    label: "If / Else",
    category: "Flow Control",
    icon: "🔀",
    description: "Rẽ nhánh dựa trên điều kiện: element tồn tại, giá trị biến...",
    isContainer: true,
    propertyFields: [
      {
        key: "conditionType",
        label: "Condition type",
        type: "select",
        options: [
          { label: "Element exists", value: "element_exists" },
          { label: "Element not exists", value: "element_not_exists" },
          { label: "Variable equals", value: "variable_equals" },
          { label: "Variable contains", value: "variable_contains" },
          { label: "JavaScript expression", value: "js_expression" },
        ],
      },
      { key: "selector", label: "Selector (CSS / XPath)", type: "text", placeholder: "#login-btn" },
      { key: "variableName", label: "Variable name", type: "text", placeholder: "${status}" },
      { key: "expectedValue", label: "Expected value", type: "text", placeholder: "success" },
      { key: "jsExpression", label: "JS Expression", type: "code", placeholder: "return true;" },
    ],
    defaultProperties: {
      conditionType: "element_exists",
      selector: "",
      variableName: "",
      expectedValue: "",
      jsExpression: "",
    },
  },
  {
    type: "LOOP_BLOCK",
    label: "Loop",
    category: "Flow Control",
    icon: "🔁",
    description: "Lặp lại các bước con theo số lần, danh sách hoặc điều kiện.",
    isContainer: true,
    propertyFields: [
      {
        key: "loopType",
        label: "Loop type",
        type: "select",
        options: [
          { label: "Fixed count", value: "count" },
          { label: "For each in list", value: "for_each" },
          { label: "While condition", value: "while" },
        ],
      },
      { key: "count", label: "Number of iterations", type: "number", defaultValue: 3 },
      { key: "listVariable", label: "List variable", type: "text", placeholder: "${items}" },
      { key: "itemVariable", label: "Current item variable name", type: "text", placeholder: "item", defaultValue: "item" },
      { key: "indexVariable", label: "Index variable name", type: "text", placeholder: "index", defaultValue: "index" },
    ],
    defaultProperties: {
      loopType: "count",
      count: 3,
      listVariable: "",
      itemVariable: "item",
      indexVariable: "index",
    },
  },
  {
    type: "BREAK_LOOP",
    label: "Break Loop",
    category: "Flow Control",
    icon: "⏹️",
    description: "Thoát khỏi vòng lặp hiện tại ngay lập tức.",
    propertyFields: [],
    defaultProperties: {},
  },
  {
    type: "TRY_CATCH",
    label: "Try / Catch",
    category: "Flow Control",
    icon: "🛡️",
    description: "Bọc các bước trong khối Try; nếu lỗi, thực hiện khối Catch.",
    isContainer: true,
    propertyFields: [
      { key: "errorVariable", label: "Error variable name", type: "text", placeholder: "error_msg", defaultValue: "error_msg" },
    ],
    defaultProperties: { errorVariable: "error_msg" },
  },

  // ─── Browser - Navigation ─────────────────────────────────────────────────
  {
    type: "GOTO",
    label: "Go to URL",
    category: "Browser - Navigation",
    icon: "🌐",
    description: "Điều hướng trang đến URL chỉ định.",
    propertyFields: [
      { key: "url", label: "URL", type: "text", placeholder: "https://example.com", required: true },
      {
        key: "waitUntil",
        label: "Wait until",
        type: "select",
        options: [
          { label: "DOM content loaded", value: "domcontentloaded" },
          { label: "Network idle", value: "networkidle" },
          { label: "Load", value: "load" },
          { label: "Commit", value: "commit" },
        ],
        defaultValue: "domcontentloaded",
      },
      { key: "timeout", label: "Timeout (ms)", type: "number", defaultValue: 30000 },
    ],
    defaultProperties: { url: "", waitUntil: "domcontentloaded", timeout: 30000 },
  },
  {
    type: "RELOAD",
    label: "Reload Page",
    category: "Browser - Navigation",
    icon: "🔄",
    description: "Tải lại trang hiện tại.",
    propertyFields: [
      {
        key: "waitUntil",
        label: "Wait until",
        type: "select",
        options: [
          { label: "DOM content loaded", value: "domcontentloaded" },
          { label: "Network idle", value: "networkidle" },
          { label: "Load", value: "load" },
        ],
        defaultValue: "domcontentloaded",
      },
    ],
    defaultProperties: { waitUntil: "domcontentloaded" },
  },
  {
    type: "GO_BACK",
    label: "Go Back",
    category: "Browser - Navigation",
    icon: "⬅️",
    description: "Quay lại trang trước đó (giống nút Back).",
    propertyFields: [],
    defaultProperties: {},
  },
  {
    type: "GO_FORWARD",
    label: "Go Forward",
    category: "Browser - Navigation",
    icon: "➡️",
    description: "Tiến đến trang kế tiếp (giống nút Forward).",
    propertyFields: [],
    defaultProperties: {},
  },

  // ─── Browser - Mouse ──────────────────────────────────────────────────────
  {
    type: "CLICK",
    label: "Click",
    category: "Browser - Mouse",
    icon: "👆",
    description: "Click vào element. Hỗ trợ CSS selector, XPath hoặc Text.",
    propertyFields: [
      { key: "selector", label: "Selector", type: "text", placeholder: "#submit-btn hoặc //button[text()='Login']", required: true },
      {
        key: "selectorType",
        label: "Selector type",
        type: "select",
        options: [
          { label: "CSS Selector", value: "css" },
          { label: "XPath", value: "xpath" },
          { label: "Text content", value: "text" },
        ],
        defaultValue: "css",
      },
      { key: "timeout", label: "Wait timeout (ms)", type: "number", defaultValue: 10000 },
    ],
    defaultProperties: { selector: "", selectorType: "css", timeout: 10000 },
  },
  {
    type: "DOUBLE_CLICK",
    label: "Double Click",
    category: "Browser - Mouse",
    icon: "👆",
    description: "Double-click vào element.",
    propertyFields: [
      { key: "selector", label: "Selector", type: "text", placeholder: ".item", required: true },
      {
        key: "selectorType",
        label: "Selector type",
        type: "select",
        options: [
          { label: "CSS Selector", value: "css" },
          { label: "XPath", value: "xpath" },
          { label: "Text content", value: "text" },
        ],
        defaultValue: "css",
      },
    ],
    defaultProperties: { selector: "", selectorType: "css" },
  },
  {
    type: "RIGHT_CLICK",
    label: "Right Click",
    category: "Browser - Mouse",
    icon: "🖱️",
    description: "Click chuột phải vào element (mở context menu).",
    propertyFields: [
      { key: "selector", label: "Selector", type: "text", placeholder: ".target-element", required: true },
    ],
    defaultProperties: { selector: "" },
  },
  {
    type: "HOVER",
    label: "Hover",
    category: "Browser - Mouse",
    icon: "🎯",
    description: "Di chuột vào element (kích hoạt dropdown, tooltip...).",
    propertyFields: [
      { key: "selector", label: "Selector", type: "text", placeholder: ".menu-item", required: true },
    ],
    defaultProperties: { selector: "" },
  },
  {
    type: "DRAG_AND_DROP",
    label: "Drag & Drop",
    category: "Browser - Mouse",
    icon: "🤏",
    description: "Kéo element từ vị trí này thả vào vị trí khác.",
    propertyFields: [
      { key: "sourceSelector", label: "Source selector", type: "text", placeholder: "#drag-item", required: true },
      { key: "targetSelector", label: "Target selector", type: "text", placeholder: "#drop-zone", required: true },
    ],
    defaultProperties: { sourceSelector: "", targetSelector: "" },
  },

  // ─── Browser - Keyboard ───────────────────────────────────────────────────
  {
    type: "TYPE",
    label: "Type Text",
    category: "Browser - Keyboard",
    icon: "✏️",
    description: "Nhập text vào ô input/textarea. Hỗ trợ biến ${var}.",
    propertyFields: [
      { key: "selector", label: "Selector", type: "text", placeholder: "#email-input", required: true },
      { key: "value", label: "Text to type", type: "text", placeholder: "hello@example.com hoặc ${email}", required: true },
      { key: "clearFirst", label: "Clear existing text first", type: "checkbox", defaultValue: true },
      { key: "typeDelay", label: "Delay between keystrokes (ms)", type: "number", defaultValue: 0, description: "Mô phỏng gõ từng phím (0 = gõ ngay)." },
      { key: "timeout", label: "Wait timeout (ms)", type: "number", defaultValue: 10000 },
    ],
    defaultProperties: { selector: "", value: "", clearFirst: true, typeDelay: 0, timeout: 10000 },
  },
  {
    type: "PRESS_KEY",
    label: "Press Key",
    category: "Browser - Keyboard",
    icon: "⌨️",
    description: "Nhấn phím hoặc tổ hợp phím (Enter, Tab, Ctrl+A...).",
    propertyFields: [
      {
        key: "key",
        label: "Key",
        type: "select",
        options: [
          { label: "Enter", value: "Enter" },
          { label: "Tab", value: "Tab" },
          { label: "Escape", value: "Escape" },
          { label: "Backspace", value: "Backspace" },
          { label: "ArrowDown", value: "ArrowDown" },
          { label: "ArrowUp", value: "ArrowUp" },
          { label: "Space", value: "Space" },
          { label: "Ctrl+A (Select All)", value: "Control+a" },
          { label: "Ctrl+C (Copy)", value: "Control+c" },
          { label: "Ctrl+V (Paste)", value: "Control+v" },
        ],
        required: true,
      },
      { key: "selector", label: "Target element (optional)", type: "text", placeholder: "Để trống = focus hiện tại" },
    ],
    defaultProperties: { key: "Enter", selector: "" },
  },
  {
    type: "CLEAR_INPUT",
    label: "Clear Input",
    category: "Browser - Keyboard",
    icon: "🧹",
    description: "Xóa toàn bộ nội dung trong ô input.",
    propertyFields: [
      { key: "selector", label: "Selector", type: "text", placeholder: "#search-input", required: true },
    ],
    defaultProperties: { selector: "" },
  },

  // ─── Browser - Element ────────────────────────────────────────────────────
  {
    type: "EXTRACT_TEXT",
    label: "Extract Text",
    category: "Browser - Element",
    icon: "📄",
    description: "Lấy nội dung text từ element và lưu vào biến.",
    propertyFields: [
      { key: "selector", label: "Selector", type: "text", placeholder: ".price-value", required: true },
      { key: "attribute", label: "Attribute (để trống = innerText)", type: "text", placeholder: "href, src, value..." },
      { key: "outputVariable", label: "Save to variable", type: "text", placeholder: "extracted_text", required: true },
      { key: "trim", label: "Trim whitespace", type: "checkbox", defaultValue: true },
    ],
    defaultProperties: { selector: "", attribute: "", outputVariable: "extracted_text", trim: true },
  },
  {
    type: "GET_ATTRIBUTE",
    label: "Get Attribute",
    category: "Browser - Element",
    icon: "🏷️",
    description: "Lấy giá trị attribute (href, src, class...) từ element.",
    propertyFields: [
      { key: "selector", label: "Selector", type: "text", placeholder: "a.download-link", required: true },
      { key: "attribute", label: "Attribute name", type: "text", placeholder: "href", required: true },
      { key: "outputVariable", label: "Save to variable", type: "text", placeholder: "link_url", required: true },
    ],
    defaultProperties: { selector: "", attribute: "", outputVariable: "link_url" },
  },
  {
    type: "SELECT_OPTION",
    label: "Select Option",
    category: "Browser - Element",
    icon: "📋",
    description: "Chọn giá trị trong dropdown <select>.",
    propertyFields: [
      { key: "selector", label: "Select element", type: "text", placeholder: "#country-select", required: true },
      {
        key: "selectBy",
        label: "Select by",
        type: "select",
        options: [
          { label: "Value", value: "value" },
          { label: "Label text", value: "label" },
          { label: "Index", value: "index" },
        ],
        defaultValue: "value",
      },
      { key: "optionValue", label: "Option value / label / index", type: "text", placeholder: "vn", required: true },
    ],
    defaultProperties: { selector: "", selectBy: "value", optionValue: "" },
  },
  {
    type: "SET_CHECKBOX",
    label: "Set Checkbox",
    category: "Browser - Element",
    icon: "☑️",
    description: "Đánh dấu hoặc bỏ dấu checkbox / radio.",
    propertyFields: [
      { key: "selector", label: "Selector", type: "text", placeholder: "#agree-checkbox", required: true },
      { key: "checked", label: "Checked", type: "checkbox", defaultValue: true },
    ],
    defaultProperties: { selector: "", checked: true },
  },

  // ─── Browser - Scroll ─────────────────────────────────────────────────────
  {
    type: "SCROLL_TO",
    label: "Scroll To Element",
    category: "Browser - Scroll",
    icon: "⬇️",
    description: "Cuộn trang đến vị trí element chỉ định.",
    propertyFields: [
      { key: "selector", label: "Selector", type: "text", placeholder: "#footer", required: true },
    ],
    defaultProperties: { selector: "" },
  },
  {
    type: "SCROLL_BY",
    label: "Scroll By Pixels",
    category: "Browser - Scroll",
    icon: "📏",
    description: "Cuộn trang theo số pixel chỉ định (dương = xuống, âm = lên).",
    propertyFields: [
      { key: "x", label: "Horizontal (px)", type: "number", defaultValue: 0 },
      { key: "y", label: "Vertical (px)", type: "number", defaultValue: 500 },
    ],
    defaultProperties: { x: 0, y: 500 },
  },
  {
    type: "SCROLL_TO_TOP",
    label: "Scroll to Top",
    category: "Browser - Scroll",
    icon: "⬆️",
    description: "Cuộn lên đầu trang.",
    propertyFields: [],
    defaultProperties: {},
  },
  {
    type: "SCROLL_TO_BOTTOM",
    label: "Scroll to Bottom",
    category: "Browser - Scroll",
    icon: "⬇️",
    description: "Cuộn xuống cuối trang.",
    propertyFields: [],
    defaultProperties: {},
  },

  // ─── Wait ──────────────────────────────────────────────────────────────────
  {
    type: "WAIT_TIME",
    label: "Wait (Delay)",
    category: "Browser - Navigation",
    icon: "⏱️",
    description: "Tạm dừng một khoảng thời gian cố định.",
    propertyFields: [
      { key: "duration", label: "Duration (ms)", type: "number", defaultValue: 1000, required: true },
    ],
    defaultProperties: { duration: 1000 },
  },
  {
    type: "WAIT_ELEMENT",
    label: "Wait for Element",
    category: "Browser - Navigation",
    icon: "⏳",
    description: "Chờ element xuất hiện hoặc biến mất trên trang.",
    propertyFields: [
      { key: "selector", label: "Selector", type: "text", placeholder: ".loading-spinner", required: true },
      {
        key: "state",
        label: "Wait for state",
        type: "select",
        options: [
          { label: "Visible", value: "visible" },
          { label: "Hidden", value: "hidden" },
          { label: "Attached to DOM", value: "attached" },
          { label: "Detached from DOM", value: "detached" },
        ],
        defaultValue: "visible",
      },
      { key: "timeout", label: "Timeout (ms)", type: "number", defaultValue: 30000 },
    ],
    defaultProperties: { selector: "", state: "visible", timeout: 30000 },
  },

  // ─── Browser - Tab & Popup ────────────────────────────────────────────────
  {
    type: "NEW_TAB",
    label: "Open New Tab",
    category: "Browser - Tab & Popup",
    icon: "➕",
    description: "Mở tab mới với URL chỉ định.",
    propertyFields: [
      { key: "url", label: "URL", type: "text", placeholder: "https://example.com", required: true },
    ],
    defaultProperties: { url: "" },
  },
  {
    type: "CLOSE_TAB",
    label: "Close Current Tab",
    category: "Browser - Tab & Popup",
    icon: "✖️",
    description: "Đóng tab hiện tại và chuyển về tab trước đó.",
    propertyFields: [],
    defaultProperties: {},
  },
  {
    type: "SWITCH_TAB",
    label: "Switch Tab",
    category: "Browser - Tab & Popup",
    icon: "🔄",
    description: "Chuyển sang tab theo chỉ số (0 = tab đầu tiên).",
    propertyFields: [
      { key: "tabIndex", label: "Tab index", type: "number", defaultValue: 0 },
    ],
    defaultProperties: { tabIndex: 0 },
  },

  // ─── Browser - Cookie ─────────────────────────────────────────────────────
  {
    type: "SET_COOKIE",
    label: "Set Cookie",
    category: "Browser - Cookie",
    icon: "🍪",
    description: "Thiết lập cookie cho domain hiện tại.",
    propertyFields: [
      { key: "name", label: "Cookie name", type: "text", placeholder: "session_id", required: true },
      { key: "value", label: "Cookie value", type: "text", placeholder: "abc123", required: true },
      { key: "domain", label: "Domain (optional)", type: "text", placeholder: ".example.com" },
    ],
    defaultProperties: { name: "", value: "", domain: "" },
  },
  {
    type: "CLEAR_COOKIES",
    label: "Clear All Cookies",
    category: "Browser - Cookie",
    icon: "🗑️",
    description: "Xóa toàn bộ cookie của browser context hiện tại.",
    propertyFields: [],
    defaultProperties: {},
  },

  // ─── Browser - Alert ──────────────────────────────────────────────────────
  {
    type: "HANDLE_ALERT",
    label: "Handle Alert/Dialog",
    category: "Browser - Alert",
    icon: "⚠️",
    description: "Xử lý hộp thoại Alert, Confirm hoặc Prompt.",
    propertyFields: [
      {
        key: "action",
        label: "Action",
        type: "select",
        options: [
          { label: "Accept (OK)", value: "accept" },
          { label: "Dismiss (Cancel)", value: "dismiss" },
        ],
        defaultValue: "accept",
      },
      { key: "promptText", label: "Prompt input text (optional)", type: "text", placeholder: "Text to enter in prompt" },
    ],
    defaultProperties: { action: "accept", promptText: "" },
  },

  // ─── Browser - Switch ─────────────────────────────────────────────────────
  {
    type: "SWITCH_TO_FRAME",
    label: "Switch to iFrame",
    category: "Browser - Switch",
    icon: "🖼️",
    description: "Chuyển ngữ cảnh vào bên trong iframe.",
    propertyFields: [
      { key: "selector", label: "iFrame selector", type: "text", placeholder: "iframe#payment", required: true },
    ],
    defaultProperties: { selector: "" },
  },
  {
    type: "SWITCH_TO_MAIN",
    label: "Switch to Main Frame",
    category: "Browser - Switch",
    icon: "🏠",
    description: "Quay về ngữ cảnh trang chính (thoát khỏi iframe).",
    propertyFields: [],
    defaultProperties: {},
  },

  // ─── Browser - Javascript ─────────────────────────────────────────────────
  {
    type: "EXECUTE_JAVASCRIPT",
    label: "Execute JavaScript",
    category: "Browser - Javascript",
    icon: "💻",
    description: "Chạy đoạn mã JavaScript tùy chỉnh trên trang.",
    propertyFields: [
      {
        key: "code",
        label: "JavaScript code",
        type: "code",
        placeholder: "return document.title;",
        required: true,
      },
      { key: "outputVariable", label: "Save result to variable", type: "text", placeholder: "js_result" },
    ],
    defaultProperties: { code: "", outputVariable: "" },
  },

  // ─── Media / Screenshot ───────────────────────────────────────────────────
  {
    type: "SCREENSHOT",
    label: "Screenshot",
    category: "Browser - Navigation",
    icon: "📷",
    description: "Chụp ảnh màn hình (toàn trang hoặc element cụ thể).",
    propertyFields: [
      { key: "outputPath", label: "Output folder", type: "text", placeholder: "D:\\Downloads", defaultValue: "" },
      { key: "fileName", label: "File name", type: "text", placeholder: "screenshot_01", defaultValue: "" },
      { key: "fullPage", label: "Full page", type: "checkbox", defaultValue: true },
      { key: "selector", label: "Element selector (optional)", type: "text", placeholder: "Để trống = chụp cả trang" },
      { key: "outputVariable", label: "Output variable", type: "text", placeholder: "screenshot_path" },
    ],
    defaultProperties: {
      outputPath: "",
      fileName: "",
      fullPage: true,
      selector: "",
      outputVariable: "screenshot_path",
    },
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
//  HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Nhóm actions theo category, trả về Map.
 */
export function getActionsByCategory(): Map<ActionCategory, ActionDefinition[]> {
  const map = new Map<ActionCategory, ActionDefinition[]>();

  for (const meta of CATEGORY_META) {
    map.set(meta.name, []);
  }

  for (const action of ACTION_DEFINITIONS) {
    const list = map.get(action.category);
    if (list) {
      list.push(action);
    }
  }

  // Xóa các category trống
  for (const [key, value] of map) {
    if (value.length === 0) map.delete(key);
  }

  return map;
}

/**
 * Tìm ActionDefinition theo type string.
 */
export function getActionDefinition(type: string): ActionDefinition | undefined {
  return ACTION_DEFINITIONS.find((a) => a.type === type);
}

/**
 * Tìm kiếm actions theo keyword (tìm trong label và description).
 */
export function searchActions(query: string): ActionDefinition[] {
  if (!query.trim()) return ACTION_DEFINITIONS;
  const q = query.toLowerCase();
  return ACTION_DEFINITIONS.filter(
    (a) =>
      a.label.toLowerCase().includes(q) ||
      a.type.toLowerCase().includes(q) ||
      (a.description && a.description.toLowerCase().includes(q))
  );
}

/**
 * Lấy metadata của category theo tên.
 */
export function getCategoryMeta(name: ActionCategory): CategoryMeta | undefined {
  return CATEGORY_META.find((c) => c.name === name);
}
