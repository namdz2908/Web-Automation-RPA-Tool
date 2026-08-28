"use client";

import { useState } from "react";
import { Settings, Variable, MousePointerClick, CheckCircle2 } from "lucide-react";
import { useWorkflowStore, findNodeById } from "@/stores/workflowStore";
import { getActionDefinition } from "@/data/actionDefinitions";
import type { PropertyField } from "@/types/workflow";

export function PropertyPanel() {
  const [activeTab, setActiveTab] = useState<"property" | "variables">("property");
  const variables = useWorkflowStore((s) => s.variables);

  return (
    <div className="h-full bg-white flex flex-col select-none">
      {/* Tab Header */}
      <div className="flex border-b border-[var(--panel-border)] shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab("property")}
          className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
            activeTab === "property"
              ? "text-[var(--primary)] border-b-2 border-[var(--primary)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Settings className="w-4 h-4" />
          Property
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("variables")}
          className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
            activeTab === "variables"
              ? "text-[var(--primary)] border-b-2 border-[var(--primary)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Variable className="w-4 h-4" />
          Variables
          <span className="text-xs bg-gray-100 text-[var(--text-secondary)] px-1.5 py-0.5 rounded-full font-mono">
            {variables.length}
          </span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "property" ? (
          <DynamicPropertyTabContent />
        ) : (
          <VariablesTabContent />
        )}
      </div>
    </div>
  );
}

// ─── Dynamic Property Form ───────────────────────────────────────────────────
function DynamicPropertyTabContent() {
  const nodes = useWorkflowStore((s) => s.nodes);
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
  const updateNode = useWorkflowStore((s) => s.updateNode);
  const updateNodeProperties = useWorkflowStore((s) => s.updateNodeProperties);

  const selectedNode = selectedNodeId ? findNodeById(nodes, selectedNodeId) : null;
  const actionDef = selectedNode ? getActionDefinition(selectedNode.type) : null;

  if (!selectedNode) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center h-full text-[var(--text-muted)]">
        <MousePointerClick className="w-10 h-10 mb-3 opacity-40 text-[var(--primary)]" />
        <p className="text-sm font-medium text-[var(--text-secondary)]">Chưa chọn khối lệnh nào</p>
        <p className="text-xs mt-1 text-[var(--text-muted)]">
          Bấm vào một khối trên canvas để xem và chỉnh sửa thuộc tính
        </p>
      </div>
    );
  }

  const properties = selectedNode.properties || {};
  const fields = actionDef?.propertyFields || [];

  const handlePropertyChange = (key: string, value: unknown) => {
    updateNodeProperties(selectedNode.id, { [key]: value });
  };

  return (
    <div className="p-4 space-y-4">
      {/* Action Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
        <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center text-xl shrink-0">
          {actionDef?.icon || "⚙️"}
        </div>
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={selectedNode.label || selectedNode.type}
            onChange={(e) => updateNode(selectedNode.id, { label: e.target.value })}
            className="font-semibold text-sm text-[var(--text-primary)] w-full bg-transparent hover:bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[var(--primary)] px-1 rounded truncate"
            title="Bấm để đổi tên khối lệnh"
          />
          <p className="text-xs text-[var(--text-muted)] px-1 truncate">
            {actionDef?.description || selectedNode.category}
          </p>
        </div>
      </div>

      {/* Auto-save badge */}
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full font-medium">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          Tự động lưu thay đổi
        </span>
        <span className="text-[11px] text-[var(--text-muted)] font-mono">
          ID: {selectedNode.id.substring(0, 8)}
        </span>
      </div>

      {/* Dynamic Fields from action definition */}
      <div className="space-y-3.5">
        {fields.map((field) => (
          <DynamicFieldInput
            key={field.key}
            field={field}
            value={properties[field.key]}
            onChange={(val) => handlePropertyChange(field.key, val)}
          />
        ))}

        {/* Global Common Block Settings */}
        <div className="pt-3 border-t border-gray-100 space-y-3">
          <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Cài đặt chung
          </h4>

          {/* Continue on Error */}
          <label className="flex items-center gap-2 text-xs text-[var(--text-primary)] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={Boolean(selectedNode.continueOnError)}
              onChange={(e) =>
                updateNode(selectedNode.id, { continueOnError: e.target.checked })
              }
              className="accent-[var(--primary)] rounded cursor-pointer"
            />
            <span>Bỏ qua lỗi và tiếp tục (Continue on error)</span>
          </label>

          {/* Note / Comment */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Ghi chú (Note)
            </label>
            <textarea
              rows={2}
              value={selectedNode.note || ""}
              onChange={(e) => updateNode(selectedNode.id, { note: e.target.value })}
              placeholder="Ghi chú về khối lệnh này (chỉ hiển thị trên editor)..."
              className="w-full px-2.5 py-1.5 text-xs border border-[var(--panel-border)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Single Field Renderer ────────────────────────────────────────────────────
function DynamicFieldInput({
  field,
  value,
  onChange,
}: {
  field: PropertyField;
  value: unknown;
  onChange: (val: unknown) => void;
}) {
  const currentValue = value !== undefined ? value : field.defaultValue || "";

  switch (field.type) {
    case "checkbox":
      return (
        <label className="flex items-center gap-2 text-xs text-[var(--text-primary)] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={Boolean(currentValue)}
            onChange={(e) => onChange(e.target.checked)}
            className="accent-[var(--primary)] rounded cursor-pointer"
          />
          <span className="font-medium">{field.label}</span>
        </label>
      );

    case "select":
      return (
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <select
            value={String(currentValue)}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs border border-[var(--panel-border)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--primary)] bg-white cursor-pointer"
          >
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );

    case "textarea":
    case "code":
      return (
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <textarea
            rows={field.type === "code" ? 4 : 2}
            value={String(currentValue)}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className={`w-full px-2.5 py-1.5 text-xs border border-[var(--panel-border)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none ${
              field.type === "code" ? "font-mono bg-gray-50 text-blue-900" : ""
            }`}
          />
        </div>
      );

    case "number":
      return (
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="number"
            value={currentValue !== "" ? Number(currentValue) : ""}
            onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder={field.placeholder}
            className="w-full px-2.5 py-1.5 text-xs border border-[var(--panel-border)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>
      );

    case "text":
    default:
      return (
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={String(currentValue)}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className="w-full px-2.5 py-1.5 text-xs border border-[var(--panel-border)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
          {field.description && (
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{field.description}</p>
          )}
        </div>
      );
  }
}

// ─── Variables Tab ────────────────────────────────────────────────────────────
function VariablesTabContent() {
  const variables = useWorkflowStore((s) => s.variables);
  const addVariable = useWorkflowStore((s) => s.addVariable);
  const removeVariable = useWorkflowStore((s) => s.removeVariable);

  const [varName, setVarName] = useState("");
  const [varType, setVarType] = useState<"string" | "number" | "boolean" | "list">("string");
  const [varDefault, setVarDefault] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!varName.trim()) return;

    addVariable({
      name: varName.trim(),
      type: varType,
      defaultValue: varDefault,
    });

    setVarName("");
    setVarDefault("");
  };

  return (
    <div className="p-4 space-y-4">
      {/* Form thêm biến */}
      <form onSubmit={handleAdd} className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2.5">
        <h4 className="text-xs font-semibold text-[var(--text-primary)]">Thêm biến mới</h4>
        <div>
          <input
            type="text"
            placeholder="Tên biến (e.g. email, password, otp)"
            value={varName}
            onChange={(e) => setVarName(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs border border-[var(--panel-border)] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={varType}
            onChange={(e) => setVarType(e.target.value as "string" | "number" | "boolean" | "list")}
            className="px-2 py-1.5 text-xs border border-[var(--panel-border)] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          >
            <option value="string">String</option>
            <option value="number">Number</option>
            <option value="boolean">Boolean</option>
            <option value="list">List</option>
          </select>
          <input
            type="text"
            placeholder="Giá trị mặc định"
            value={varDefault}
            onChange={(e) => setVarDefault(e.target.value)}
            className="flex-1 px-2.5 py-1.5 text-xs border border-[var(--panel-border)] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>
        <button
          type="submit"
          disabled={!varName.trim()}
          className="w-full py-1.5 text-xs font-medium text-white bg-[var(--primary)] hover:opacity-90 disabled:opacity-40 rounded-lg transition-opacity cursor-pointer"
        >
          + Thêm biến
        </button>
      </form>

      {/* Danh sách biến */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
          Danh sách biến ({variables.length})
        </h4>

        {variables.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)] italic py-2">
            Chưa có biến nào. Các biến sẽ được sử dụng qua cú pháp &#36;&#123;tên_biến&#125;.
          </p>
        ) : (
          variables.map((v) => (
            <div
              key={v.id}
              className="flex items-center justify-between p-2 rounded-lg border border-gray-200 bg-white text-xs"
            >
              <div>
                <span className="font-mono font-semibold text-[var(--primary)]">
                  &#36;&#123;{v.name}&#125;
                </span>
                <span className="ml-2 text-[10px] text-gray-400">({v.type})</span>
                {v.defaultValue !== undefined && v.defaultValue !== "" && (
                  <p className="text-[11px] text-gray-500 truncate max-w-[180px]">
                    = {String(v.defaultValue)}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeVariable(v.id)}
                className="text-gray-400 hover:text-red-500 p-1 cursor-pointer"
                title="Xóa biến"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
