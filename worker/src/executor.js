// ─── Workflow Executor ───────────────────────────────────────────────────────
// Bộ não của Worker: đọc kịch bản (dạng cây hoặc mảng phẳng), duyệt từng
// node, nội suy biến, dispatch action, xử lý vòng lặp/rẽ nhánh, ghi kết quả.
// ─────────────────────────────────────────────────────────────────────────────
const { executeAction } = require('./actions');
const { interpolateProperties } = require('./utils/variableParser');
const { saveStepResult } = require('./db');
const { SCREENSHOTS_DIR } = require('./actions/media');

// ─── Flow Control Errors ─────────────────────────────────────────────────────
class BreakLoopError extends Error {
  constructor() {
    super('BREAK_LOOP');
    this.name = 'BreakLoopError';
  }
}

// ─── Execution Context ──────────────────────────────────────────────────────
/**
 * Tạo execution context mới cho mỗi lượt chạy.
 */
function createExecutionContext(browserContext, executionId, initialVariables = {}) {
  return {
    browserContext,       // Playwright BrowserContext (để quản lý tab, cookie)
    executionId,          // ID lượt chạy trong DB
    variables: { ...initialVariables }, // Runtime variables
    stepCounter: 0,       // Bộ đếm bước (tăng dần toàn cục)
    errors: [],           // Danh sách lỗi đã bỏ qua (continueOnError)
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN EXECUTOR
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Thực thi toàn bộ kịch bản.
 * Hỗ trợ cả 2 định dạng:
 *   - Mảng phẳng `steps[]` (tương thích ngược với dữ liệu cũ)
 *   - Cây khối `WorkflowNode[]` (cấu trúc mới từ Drag-and-Drop Editor)
 *
 * @param {import('playwright').Page} page
 * @param {object} context - Execution context
 * @param {Array} nodes - Danh sách nodes/steps cần thực thi
 */
async function executeWorkflow(page, context, nodes) {
  if (!Array.isArray(nodes) || nodes.length === 0) {
    console.log('[Executor] No nodes to execute');
    return;
  }

  for (const node of nodes) {
    // Bỏ qua node đã bị vô hiệu hóa
    if (node.disabled) {
      console.log(`[Executor] Skipping disabled node: ${node.type} "${node.label || ''}"`);
      continue;
    }

    await executeNode(page, context, node);
  }
}

/**
 * Thực thi một node đơn lẻ.
 * Phân loại: Container / Loop / Condition / Action thường.
 */
async function executeNode(page, context, node) {
  const { type } = node;

  switch (type) {
    case 'NORMAL_BLOCK':
      await executeContainer(page, context, node);
      break;

    case 'LOOP_BLOCK':
      await executeLoop(page, context, node);
      break;

    case 'CONDITION_BLOCK':
      await executeCondition(page, context, node);
      break;

    case 'TRY_CATCH':
      await executeTryCatch(page, context, node);
      break;

    case 'BREAK_LOOP':
      throw new BreakLoopError();

    default:
      // Action thường (GOTO, CLICK, TYPE, SCREENSHOT...)
      await executeSingleAction(page, context, node);
      break;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SINGLE ACTION EXECUTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Thực thi một action đơn lẻ: nội suy biến → dispatch → lưu kết quả → delay.
 */
async function executeSingleAction(page, context, node) {
  context.stepCounter++;
  const stepIndex = context.stepCounter;
  const { type, properties = {}, outputVariable, continueOnError = false, delay } = node;

  console.log(`\n[Executor] ▶ Step ${stepIndex}: ${type} "${node.label || ''}"`)

  try {
    // 1. Nội suy biến ${var} trong properties
    const interpolatedProps = interpolateProperties(properties, context.variables);

    // 2. Dispatch action tới handler
    const step = { type, properties: interpolatedProps };
    const result = await executeAction(page, context, step);

    // 3. Lưu kết quả vào biến runtime (nếu action có output)
    if (outputVariable && result !== undefined && result !== null) {
      context.variables[outputVariable] = result;
      console.log(`[Executor]   → Saved to variable "${outputVariable}": "${String(result).substring(0, 100)}"`);
    }

    // Xử lý các action thay đổi page (NEW_TAB, CLOSE_TAB, SWITCH_TAB)
    if (['NEW_TAB', 'CLOSE_TAB', 'SWITCH_TAB'].includes(type) && result) {
      // result là page mới → cập nhật tham chiếu
      page = result;
    }

    // 4. Lưu kết quả vào DB
    const stepResult = {
      stepIndex,
      actionType: type,
      screenshotUrl: type === 'SCREENSHOT' ? result : null,
      extractedText: ['EXTRACT_TEXT', 'GET_ATTRIBUTE', 'EXECUTE_JAVASCRIPT'].includes(type)
        ? String(result || '')
        : null,
    };
    await saveStepResult(context.executionId, stepResult);

    console.log(`[Executor] ✓ Step ${stepIndex}: ${type} completed`);

  } catch (err) {
    console.error(`[Executor] ✗ Step ${stepIndex}: ${type} FAILED — ${err.message}`);

    if (continueOnError) {
      // Ghi nhận lỗi nhưng tiếp tục
      context.errors.push({ stepIndex, type, error: err.message });
      console.log(`[Executor]   → continueOnError=true, skipping...`);

      // Lưu bước lỗi vào DB
      await saveStepResult(context.executionId, {
        stepIndex,
        actionType: type,
        extractedText: `ERROR: ${err.message}`,
      });
    } else {
      throw err; // Dừng toàn bộ kịch bản
    }
  }

  // 5. Delay sau khi hoàn thành bước
  if (delay) {
    const delayMs = randomDelay(delay.min || 0, delay.max || 0);
    if (delayMs > 0) {
      console.log(`[Executor]   → Delay ${delayMs}ms`);
      await sleep(delayMs);
    }
  }

  return page; // Trả về page (có thể đã thay đổi do tab actions)
}

// ═══════════════════════════════════════════════════════════════════════════════
//  CONTAINER / FLOW CONTROL
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Normal Block (Container): Duyệt tuần tự các children bên trong.
 */
async function executeContainer(page, context, node) {
  const blockName = node.properties?.blockName || node.label || 'Unnamed Block';
  console.log(`\n[Executor] ┌─ BLOCK: "${blockName}" (${(node.children || []).length} children)`);

  if (node.children && node.children.length > 0) {
    await executeWorkflow(page, context, node.children);
  }

  console.log(`[Executor] └─ END BLOCK: "${blockName}"`);
}

/**
 * Loop Block: Lặp children theo count, for_each hoặc while.
 */
async function executeLoop(page, context, node) {
  const { loopType = 'count', count = 1, listVariable, itemVariable = 'item', indexVariable = 'index' } = node.properties || {};
  const children = node.children || [];

  console.log(`\n[Executor] 🔁 LOOP: type=${loopType}`);

  try {
    switch (loopType) {
      case 'count': {
        const iterations = parseInt(count, 10) || 1;
        console.log(`[Executor]   Iterating ${iterations} times`);
        for (let i = 0; i < iterations; i++) {
          context.variables[indexVariable] = i;
          console.log(`[Executor]   ── Iteration ${i + 1}/${iterations}`);
          await executeWorkflow(page, context, children);
        }
        break;
      }

      case 'for_each': {
        // Lấy danh sách từ biến
        const listVarName = (listVariable || '').replace(/^\$\{|\}$/g, '');
        const list = context.variables[listVarName];
        if (!Array.isArray(list)) {
          console.warn(`[Executor]   Variable "${listVarName}" is not an array, skipping loop`);
          break;
        }
        console.log(`[Executor]   Iterating over ${list.length} items`);
        for (let i = 0; i < list.length; i++) {
          context.variables[indexVariable] = i;
          context.variables[itemVariable] = list[i];
          console.log(`[Executor]   ── Item ${i + 1}/${list.length}: ${JSON.stringify(list[i]).substring(0, 80)}`);
          await executeWorkflow(page, context, children);
        }
        break;
      }

      case 'while': {
        // Lặp tối đa 1000 lần để tránh vòng lặp vô tận
        const MAX_WHILE = 1000;
        let iteration = 0;
        console.log(`[Executor]   While loop (max ${MAX_WHILE} iterations)`);
        while (iteration < MAX_WHILE) {
          context.variables[indexVariable] = iteration;
          console.log(`[Executor]   ── While iteration ${iteration + 1}`);
          await executeWorkflow(page, context, children);
          iteration++;
        }
        if (iteration >= MAX_WHILE) {
          console.warn(`[Executor]   While loop hit max iterations (${MAX_WHILE}), breaking`);
        }
        break;
      }

      default:
        console.warn(`[Executor]   Unknown loop type: ${loopType}`);
    }
  } catch (err) {
    if (err instanceof BreakLoopError) {
      console.log(`[Executor] ⏹️ BREAK_LOOP — exiting loop`);
    } else {
      throw err;
    }
  }

  console.log(`[Executor] 🔁 END LOOP`);
}

/**
 * Condition Block (If/Else): Kiểm tra điều kiện → chạy nhánh phù hợp.
 * children[0] = true branch content, children[1] = false branch content (optional)
 * Hoặc: node.trueBranch / node.falseBranch
 */
async function executeCondition(page, context, node) {
  const { conditionType = 'element_exists', selector, variableName, expectedValue, jsExpression } = node.properties || {};

  console.log(`\n[Executor] 🔀 IF: conditionType=${conditionType}`);

  let conditionMet = false;

  try {
    switch (conditionType) {
      case 'element_exists':
        conditionMet = await page.locator(selector).count() > 0;
        break;

      case 'element_not_exists':
        conditionMet = await page.locator(selector).count() === 0;
        break;

      case 'variable_equals': {
        const varName = (variableName || '').replace(/^\$\{|\}$/g, '');
        conditionMet = String(context.variables[varName]) === String(expectedValue);
        break;
      }

      case 'variable_contains': {
        const varName = (variableName || '').replace(/^\$\{|\}$/g, '');
        conditionMet = String(context.variables[varName] || '').includes(String(expectedValue));
        break;
      }

      case 'js_expression':
        conditionMet = await page.evaluate(jsExpression);
        break;

      default:
        console.warn(`[Executor]   Unknown condition type: ${conditionType}`);
    }
  } catch (err) {
    console.warn(`[Executor]   Condition check failed: ${err.message} → treating as false`);
    conditionMet = false;
  }

  console.log(`[Executor]   Condition result: ${conditionMet ? 'TRUE ✓' : 'FALSE ✗'}`);

  // Xác định nhánh True / False
  const trueBranch = node.trueBranch || (node.children ? [node.children[0]].filter(Boolean) : []);
  const falseBranch = node.falseBranch || (node.children ? [node.children[1]].filter(Boolean) : []);

  if (conditionMet && trueBranch.length > 0) {
    console.log(`[Executor]   → Executing TRUE branch`);
    await executeWorkflow(page, context, trueBranch);
  } else if (!conditionMet && falseBranch.length > 0) {
    console.log(`[Executor]   → Executing FALSE branch`);
    await executeWorkflow(page, context, falseBranch);
  } else {
    console.log(`[Executor]   → No branch to execute`);
  }

  console.log(`[Executor] 🔀 END IF`);
}

/**
 * Try/Catch Block: Bọc các bước trong Try; nếu lỗi, chạy khối Catch.
 */
async function executeTryCatch(page, context, node) {
  const { errorVariable = 'error_msg' } = node.properties || {};
  const tryBlock = node.children?.[0];
  const catchBlock = node.children?.[1];

  console.log(`\n[Executor] 🛡️ TRY/CATCH`);

  try {
    if (tryBlock) {
      console.log(`[Executor]   → Executing TRY block`);
      await executeNode(page, context, tryBlock);
    }
  } catch (err) {
    console.log(`[Executor]   → TRY failed: ${err.message}`);
    context.variables[errorVariable] = err.message;

    if (catchBlock) {
      console.log(`[Executor]   → Executing CATCH block (error saved to "${errorVariable}")`);
      await executeNode(page, context, catchBlock);
    }
  }

  console.log(`[Executor] 🛡️ END TRY/CATCH`);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  BACKWARD COMPATIBILITY: Flat Steps Array
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Chuyển đổi mảng steps phẳng (cũ) thành cấu trúc nodes tương thích.
 * Dữ liệu cũ: [{ type: "GOTO", selector: "...", value: "..." }]
 */
function convertFlatStepsToNodes(steps) {
  return steps.map((step, index) => ({
    id: `step_${index}`,
    type: step.type,
    label: step.type,
    properties: {
      url: step.value,        // GOTO sử dụng value làm URL
      selector: step.selector,
      value: step.value,
      timeout: step.timeout || 10000,
    },
    outputVariable: step.outputVariable,
    continueOnError: step.continueOnError || false,
    delay: step.delay,
  }));
}

// ═══════════════════════════════════════════════════════════════════════════════
//  UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay(min, max) {
  if (min === 0 && max === 0) return 0;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
  executeWorkflow,
  createExecutionContext,
  convertFlatStepsToNodes,
};
