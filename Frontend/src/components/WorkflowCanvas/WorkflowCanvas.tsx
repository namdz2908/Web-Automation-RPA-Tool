"use client";

import { Plus, Info } from "lucide-react";

// ─── Workflow Canvas (Giữa) ──────────────────────────────────────────────────
// Phase 1: Placeholder với layout khung
// Phase 3: Sẽ thêm DndContext, sortable blocks, drag overlay
export function WorkflowCanvas() {
  return (
    <div className="h-full bg-[var(--editor-bg)] flex flex-col">
      {/* Canvas Header */}
      <div className="px-4 py-3 bg-white border-b border-[var(--panel-border)] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-base">📋</span>
          <h2 className="font-semibold text-[var(--text-primary)]">
            Main workflow
          </h2>
        </div>
        <button
          className="p-1.5 text-[var(--primary)] hover:bg-[var(--primary-light)] rounded-lg transition-colors cursor-pointer"
          title="Thêm block"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Canvas Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Info Banner */}
        <div className="flex items-start gap-3 p-3 mb-4 bg-blue-50 border border-blue-200 rounded-lg">
          <Info className="w-5 h-5 text-[var(--primary)] shrink-0 mt-0.5" />
          <p className="text-sm text-[var(--primary)]">
            Instructions for writing logic that is easy to read, maintain, and upgrade.{" "}
            <a href="#" className="underline font-medium">
              Visit at HERE
            </a>
          </p>
        </div>

        {/* Sample Workflow Blocks (Static placeholder) */}
        <div className="space-y-2">
          {/* Block 1: Normal block - Before browser opened */}
          <WorkflowBlockPlaceholder
            icon="📋"
            label="Normal block"
            sublabel="Before browser opened"
            index={1}
          />

          {/* Block 2: Normal block - Main logic (container) */}
          <div>
            <WorkflowBlockPlaceholder
              icon="📋"
              label="Normal block"
              sublabel="Main logic · 3 block"
              index={2}
              isContainer
              isExpanded
            />
            {/* Nested blocks */}
            <div className="ml-6 border-l-2 border-blue-200 pl-4 space-y-2 py-2">
              <WorkflowBlockPlaceholder
                icon="🌐"
                label="Go to URL"
                index={3}
              />
              <WorkflowBlockPlaceholder
                icon="🌐"
                label="Go to URL"
                index={4}
              />
              <WorkflowBlockPlaceholder
                icon="📷"
                label="Screenshot"
                index={5}
                isHighlighted
              />
            </div>
          </div>

          {/* Block 3: Normal block - After browser closed */}
          <WorkflowBlockPlaceholder
            icon="📋"
            label="Normal block"
            sublabel="After browser closed"
            index={6}
          />
        </div>

        {/* Drop zone placeholder */}
        <div className="mt-4 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-sm text-[var(--text-muted)]">
            Kéo action từ panel bên trái và thả vào đây
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Placeholder Block Component ──────────────────────────────────────────────
function WorkflowBlockPlaceholder({
  icon,
  label,
  sublabel,
  index,
  isContainer = false,
  isExpanded = false,
  isHighlighted = false,
}: {
  icon: string;
  label: string;
  sublabel?: string;
  index: number;
  isContainer?: boolean;
  isExpanded?: boolean;
  isHighlighted?: boolean;
}) {
  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-2.5 rounded-lg border cursor-pointer transition-all
        ${
          isHighlighted
            ? "bg-blue-50 border-[var(--primary)] shadow-sm"
            : "bg-white border-[var(--panel-border)] hover:border-blue-300 hover:shadow-sm"
        }
      `}
    >
      {/* Expand toggle for container */}
      {isContainer && (
        <span className="text-xs text-[var(--text-muted)]">
          {isExpanded ? "▼" : "▶"}
        </span>
      )}

      {/* Icon */}
      <span className="text-lg">{icon}</span>

      {/* Label */}
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-[var(--text-primary)]">
          {label}
        </span>
        {sublabel && (
          <span className="ml-2 text-xs text-[var(--text-muted)]">
            {sublabel}
          </span>
        )}
      </div>

      {/* Index */}
      <span className="text-xs text-[var(--text-muted)] bg-gray-100 w-6 h-6 flex items-center justify-center rounded">
        {index}
      </span>
    </div>
  );
}
