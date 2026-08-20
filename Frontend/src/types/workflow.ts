// ─── Core Workflow Types ──────────────────────────────────────────────────────

/**
 * Nhóm actions giống trong ảnh GPM Automate Editor
 */
export type ActionCategory =
  | "Flow Control"
  | "AI"
  | "Mail"
  | "Browser - Navigation"
  | "Browser - Element"
  | "Browser - Mouse"
  | "Browser - Keyboard"
  | "Browser - Scroll"
  | "Browser - Switch"
  | "Browser - Cookie"
  | "Browser - Alert"
  | "Browser - Tab & Popup"
  | "Browser - Javascript"
  | "References"
  | "Google Service";

/**
 * Một node trong workflow tree.
 * Container nodes (Normal block, If/Else, Loop...) có children.
 */
export interface WorkflowNode {
  id: string;
  type: string;
  label: string;
  category: ActionCategory;
  properties: Record<string, unknown>;
  children?: WorkflowNode[];
  disabled?: boolean;
  note?: string;
  continueOnError?: boolean;
  delay?: { min: number; max: number };
  outputVariable?: string;
}

/**
 * Biến trong workflow
 */
export interface Variable {
  id: string;
  name: string;
  type: "string" | "number" | "boolean" | "list";
  defaultValue: unknown;
}

/**
 * Property field types cho dynamic form rendering
 */
export type PropertyFieldType =
  | "text"
  | "number"
  | "checkbox"
  | "select"
  | "textarea"
  | "code"
  | "variable-picker";

/**
 * Schema cho 1 field trong property editor
 */
export interface PropertyField {
  key: string;
  label: string;
  type: PropertyFieldType;
  placeholder?: string;
  defaultValue?: unknown;
  required?: boolean;
  options?: { label: string; value: string }[]; // cho select
  description?: string;
}

/**
 * Định nghĩa metadata của 1 action type
 */
export interface ActionDefinition {
  type: string;
  label: string;
  category: ActionCategory;
  icon: string; // Lucide icon name
  description?: string;
  isContainer?: boolean; // Có thể chứa children (Normal block, Loop...)
  propertyFields: PropertyField[];
  defaultProperties: Record<string, unknown>;
}

/**
 * Toàn bộ workflow data (lưu vào DB)
 */
export interface WorkflowData {
  nodes: WorkflowNode[];
  variables: Variable[];
  settings: {
    name: string;
    description?: string;
  };
}

/**
 * Script từ API backend
 */
export interface Script {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  target_url: string;
  steps: unknown[];
  workflow_data?: WorkflowData;
  created_at: string;
  updated_at: string;
}
