"use client";

import { useState, useMemo } from "react";
import { Search, ChevronRight, ChevronDown, Zap, GripVertical } from "lucide-react";
import {
  CATEGORY_META,
  getActionsByCategory,
  searchActions,
  getCategoryMeta,
} from "@/data/actionDefinitions";
import type { ActionDefinition, ActionCategory } from "@/types/workflow";

// ─── Actions Panel (Bên trái) ─────────────────────────────────────────────────
export function ActionsPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Nhóm actions theo category
  const actionsByCategory = useMemo(() => getActionsByCategory(), []);

  // Kết quả tìm kiếm
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    return searchActions(searchQuery);
  }, [searchQuery]);

  const toggleGroup = (name: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--panel-border)]">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-5 h-5 text-[var(--primary)]" />
          <h2 className="font-semibold text-[var(--text-primary)]">Actions</h2>
          <span className="ml-auto text-xs text-[var(--text-muted)] bg-gray-100 px-1.5 py-0.5 rounded-full">
            {Array.from(actionsByCategory.values()).reduce((s, a) => s + a.length, 0)}
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Tìm kiếm actions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-[var(--panel-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {searchResults ? (
          /* ── Kết quả tìm kiếm (Flat list) ──────────────────────── */
          searchResults.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">
              Không tìm thấy action nào cho &ldquo;{searchQuery}&rdquo;
            </div>
          ) : (
            <div className="py-1">
              <div className="px-4 py-2 text-xs text-[var(--text-muted)]">
                Tìm thấy {searchResults.length} kết quả
              </div>
              {searchResults.map((action) => (
                <ActionItem key={action.type} action={action} />
              ))}
            </div>
          )
        ) : (
          /* ── Danh sách theo Category (Accordion) ───────────────── */
          CATEGORY_META.map((meta) => {
            const actions = actionsByCategory.get(meta.name);
            if (!actions || actions.length === 0) return null;

            const isExpanded = expandedGroups.has(meta.name);

            return (
              <div
                key={meta.name}
                className="border-b border-[var(--panel-border)] last:border-b-0"
              >
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(meta.name)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                  )}
                  <span className="text-base">{meta.icon}</span>
                  <span className="text-sm font-medium text-[var(--text-primary)] flex-1 text-left truncate">
                    {meta.name}
                  </span>
                  <span className="text-xs bg-gray-100 text-[var(--text-secondary)] px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {actions.length}
                  </span>
                </button>

                {/* Expanded: Action Items */}
                {isExpanded && (
                  <div className="pb-1">
                    {actions.map((action) => (
                      <ActionItem key={action.type} action={action} />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Action Item Component ────────────────────────────────────────────────────
// Phase 3 sẽ thêm useDraggable từ @dnd-kit để kéo thả vào Canvas
function ActionItem({ action }: { action: ActionDefinition }) {
  const meta = getCategoryMeta(action.category);

  return (
    <div
      className="flex items-center gap-2.5 mx-3 mb-1 px-3 py-2 rounded-lg
        border border-transparent hover:border-blue-200 hover:bg-blue-50/50
        cursor-grab active:cursor-grabbing transition-all group"
      title={action.description}
    >
      {/* Drag handle */}
      <GripVertical className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-400 shrink-0" />

      {/* Icon */}
      <span className="text-base shrink-0">{action.icon}</span>

      {/* Label & description */}
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-[var(--text-primary)] block truncate">
          {action.label}
        </span>
        {action.description && (
          <span className="text-xs text-[var(--text-muted)] block truncate">
            {action.description}
          </span>
        )}
      </div>

      {/* Container badge */}
      {action.isContainer && (
        <span
          className="text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0"
          style={{
            backgroundColor: meta ? `${meta.color}15` : "#f3f4f6",
            color: meta?.color || "#6b7280",
          }}
        >
          Container
        </span>
      )}
    </div>
  );
}
