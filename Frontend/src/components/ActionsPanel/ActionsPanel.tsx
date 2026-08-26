"use client";

import { useState, useMemo } from "react";
import { Search, ChevronRight, ChevronDown, Zap } from "lucide-react";
import {
  CATEGORY_META,
  getActionsByCategory,
  searchActions,
} from "@/data/actionDefinitions";
import { DraggableActionItem } from "./DraggableActionItem";

// ─── Actions Panel (Bên trái) ─────────────────────────────────────────────────
export function ActionsPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(["Flow Control", "Browser - Navigation", "Browser - Mouse"])
  );

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
    <div className="h-full bg-white flex flex-col select-none">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--panel-border)] shrink-0">
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
                <DraggableActionItem key={action.type} action={action} />
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
                      <DraggableActionItem key={action.type} action={action} />
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
