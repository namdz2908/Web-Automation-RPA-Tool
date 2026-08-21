// ─── Variable Parser ─────────────────────────────────────────────────────────
// Xử lý nội suy biến runtime: thay thế ${variable_name} trong chuỗi bằng
// giá trị thực tế từ context.variables.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Regex tìm tất cả ${variable_name} trong chuỗi.
 * Hỗ trợ tên biến chứa chữ cái, số, dấu gạch dưới và dấu chấm.
 */
const VARIABLE_REGEX = /\$\{([a-zA-Z_][a-zA-Z0-9_.\-]*)\}/g;

/**
 * Nội suy một chuỗi: thay thế tất cả ${var} bằng giá trị trong variables.
 * Nếu biến không tồn tại, giữ nguyên chuỗi gốc ${var}.
 *
 * @param {string} text - Chuỗi cần nội suy
 * @param {object} variables - Bảng biến runtime { name: value }
 * @returns {string} Chuỗi đã được thay thế
 *
 * @example
 *   interpolate("Hello ${name}, your code is ${otp}", { name: "Nam", otp: "1234" })
 *   // → "Hello Nam, your code is 1234"
 */
function interpolate(text, variables = {}) {
  if (typeof text !== 'string') return text;
  if (!text.includes('${')) return text; // Fast path: không có biến

  return text.replace(VARIABLE_REGEX, (match, varName) => {
    if (varName in variables) {
      const value = variables[varName];
      return value !== null && value !== undefined ? String(value) : '';
    }
    // Biến không tồn tại → giữ nguyên
    return match;
  });
}

/**
 * Nội suy tất cả giá trị string trong một object properties.
 * Duyệt đệ quy: nếu value là string → interpolate, nếu là object → duyệt sâu.
 *
 * @param {object} properties - Object chứa các thuộc tính cần nội suy
 * @param {object} variables - Bảng biến runtime
 * @returns {object} Object mới đã nội suy tất cả chuỗi
 */
function interpolateProperties(properties, variables = {}) {
  if (!properties || typeof properties !== 'object') return properties;

  const result = {};
  for (const [key, value] of Object.entries(properties)) {
    if (typeof value === 'string') {
      result[key] = interpolate(value, variables);
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        typeof item === 'string' ? interpolate(item, variables) : item
      );
    } else if (typeof value === 'object' && value !== null) {
      result[key] = interpolateProperties(value, variables);
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Trích xuất danh sách tên biến được sử dụng trong chuỗi.
 *
 * @param {string} text
 * @returns {string[]} Danh sách tên biến
 *
 * @example
 *   extractVariableNames("Go to ${url} and type ${email}")
 *   // → ["url", "email"]
 */
function extractVariableNames(text) {
  if (typeof text !== 'string') return [];
  const names = [];
  let match;
  const regex = new RegExp(VARIABLE_REGEX.source, 'g');
  while ((match = regex.exec(text)) !== null) {
    if (!names.includes(match[1])) {
      names.push(match[1]);
    }
  }
  return names;
}

module.exports = { interpolate, interpolateProperties, extractVariableNames };
