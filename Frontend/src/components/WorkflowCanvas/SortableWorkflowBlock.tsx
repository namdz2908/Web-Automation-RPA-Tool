"use client";

import { useState } from "react";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  ChevronDown,
  ChevronRight,
  Copy,
  Trash2,
  Power,
  AlertCircle,
} from "lucide-react";
import type { WorkflowNode } from "@/types/workflow";
import { getActionDefinition, getCategoryMeta } from "@/data/actionDefinitions";
import { useWorkflowStore } from "@/stores/workflowStore";
import { CanvasDropZone } from "./CanvasDropZone";

interface SortableWorkflowBlockProps {
  node: WorkflowNode;
  index: number;
  depth?: number;
}

export function SortableWorkflowBlock({
  node,
  index,
  depth = 0,
}: SortableWorkflowBlockProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: node.id,
    data: {
      type: "workflow-node",
      node,
    },
  });

  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
  const selectNode = useWorkflowStore((s) => s.selectNode);
  const removeNode = useWorkflowStore((s) => s.removeNode);
  const duplicateNode = useWorkflowStore((s) => s.duplicateNode);
  const toggleNodeDisabled = useWorkflowStore((s) => s.toggleNodeDisabled);

  const isSelected = selectedNodeId === node.id;
  const actionDef = getActionDefinition(node.type);
  const meta = getCategoryMeta(node.category);
  const isContainer = Boolean(actionDef?.isContainer || node.children !== undefined);
  const children = node.children || [];

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Tóm tắt thông tin thuộc tính hiển thị trên block
  const getSummary = () => {
    const props = node.properties || {};
    if (props.blockName) return String(props.blockName);
    if (props.url) return String(props.url);
    if (props.selector) return String(props.selector);
    if (props.value) return `"${String(props.value)}"`;
    if (props.duration) return `${props.duration}ms`;
    if (props.loopType === "count" && props.count) return `${props.count} lần`;
    if (props.fileName) return String(props.fileName);
    if (node.note) return node.note;
    return null;
  };

  const summary = getSummary();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative select-none transition-opacity ${
        isDragging ? "opacity-30" : "opacity-100"
      }`}
    >
      {/* ── Main Block Card ────────────────────────────────────────────── */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          selectNode(node.id);
        }}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg border transition-all cursor-pointer group
          ${
            isSelected
              ? "bg-blue-50/80 border-[var(--primary)] shadow-sm ring-2 ring-blue-500/20"
              : node.disabled
              ? "bg-gray-100/80 border-gray-200 opacity-60"
              : "bg-white border-[var(--panel-border)] hover:border-blue-300 hover:shadow-xs"
          }
        `}
      >
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="p-1 -ml-1 text-gray-300 group-hover:text-gray-500 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing shrink-0"
          title="Kéo để di chuyển vị trí"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Expand / Collapse toggle cho container */}
        {isContainer ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-0.5 text-gray-500 hover:text-[var(--primary)] hover:bg-gray-100 rounded shrink-0 cursor-pointer"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        ) : (
          <span className="w-4" />
        )}

        {/* Action Icon */}
        <span className="text-base shrink-0">
          {actionDef?.icon || "⚙️"}
        </span>

        {/* Label & Summary */}
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span
            className={`text-sm font-medium truncate ${
              node.disabled ? "line-through text-gray-400" : "text-[var(--text-primary)]"
            }`}
          >
            {node.label || node.type}
          </span>

          {summary && (
            <span className="text-xs text-[var(--text-muted)] bg-gray-100 px-2 py-0.5 rounded truncate max-w-[240px]">
              {summary}
            </span>
          )}

          {node.continueOnError && (
            <span
              className="text-[10px] bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5 shrink-0"
              title="Bỏ qua lỗi và tiếp tục"
            >
              <AlertCircle className="w-3 h-3" />
              Ignore Error
            </span>
          )}

          {isContainer && (
            <span
              className="text-[11px] px-1.5 py-0.5 rounded font-medium shrink-0 ml-auto mr-1"
              style={{
                backgroundColor: meta ? `${meta.color}15` : "#f3f4f6",
                color: meta?.color || "#6b7280",
              }}
            >
              {children.length} block{children.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Quick Actions Toolbar on Hover */}
        <div
          className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Toggle Disabled */}
          <button
            type="button"
            onClick={() => toggleNodeDisabled(node.id)}
            className={`p-1 rounded hover:bg-gray-100 transition-colors ${
              node.disabled ? "text-amber-500" : "text-gray-400 hover:text-gray-600"
            }`}
            title={node.disabled ? "Kích hoạt lại" : "Vô hiệu hóa tạm thời"}
          >
            <Power className="w-3.5 h-3.5" />
          </button>

          {/* Duplicate */}
          <button
            type="button"
            onClick={() => duplicateNode(node.id)}
            className="p-1 text-gray-400 hover:text-[var(--primary)] hover:bg-gray-100 rounded transition-colors"
            title="Nhân bản block"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={() => removeNode(node.id)}
            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
            title="Xóa block"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Index Badge */}
        <span className="text-xs text-[var(--text-muted)] bg-gray-100 w-6 h-6 flex items-center justify-center rounded font-mono shrink-0">
          {index}
        </span>
      </div>

      {/* ── Nested Children for Containers (Normal block, Loop, If...) ── */}
      {isContainer && isExpanded && (
        <div className="ml-5 mt-1.5 pl-3 border-l-2 border-blue-200/80 space-y-1.5 py-1">
          <SortableContext
            items={children.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            {children.map((childNode, childIdx) => (
              <SortableWorkflowBlock
                key={childNode.id}
                node={childNode}
                index={childIdx + 1}
                depth={depth + 1}
              />
            ))}
          </SortableContext>

          {/* Drop target inside empty or at the bottom of container */}
          <CanvasDropZone
            id={`container-drop-${node.id}`}
            parentId={node.id}
            index={children.length}
            isEmpty={children.length === 0}
            hintText="Thả các action con vào bên trong khối này"
            className={children.length === 0 ? "py-4 text-xs" : ""}
          />
        </div>
      )}
    </div>
  );
}
