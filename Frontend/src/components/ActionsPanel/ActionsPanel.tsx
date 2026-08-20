"use client";

import { useState } from "react";
import { Search, ChevronRight, ChevronDown, Zap } from "lucide-react";

// ─── Tạm thời dùng dữ liệu tĩnh (Phase 2 sẽ import từ actionDefinitions) ──
const ACTION_GROUPS = [
  { name: "AI", count: 2, icon: "🤖" },
  { name: "Mail", count: 3, icon: "📧" },
  { name: "Browser - Navigation", count: 9, icon: "🧭" },
  { name: "Browser - Element", count: 4, icon: "🔲" },
  { name: "Browser - Mouse", count: 6, icon: "🖱️" },
  { name: "Browser - Keyboard", count: 3, icon: "⌨️" },
  { name: "Browser - Scroll", count: 4, icon: "📜" },
  { name: "Browser - Switch", count: 3, icon: "🔄" },
  { name: "Browser - Cookie", count: 2, icon: "🍪" },
  { name: "Browser - Alert", count: 2, icon: "⚠️" },
  { name: "Browser - Tab & Popup", count: 2, icon: "📑" },
  { name: "Browser - Javascript", count: 3, icon: "💛" },
  { name: "References", count: 1, icon: "📚" },
  { name: "Google Service", count: 2, icon: "🟢" },
];

// ─── Actions Panel (Bên trái) ─────────────────────────────────────────────────
export function ActionsPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

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

  const filteredGroups = ACTION_GROUPS.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--panel-border)]">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-5 h-5 text-[var(--primary)]" />
          <h2 className="font-semibold text-[var(--text-primary)]">Actions</h2>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search actions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-[var(--panel-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
          />
        </div>
      </div>

      {/* Action Groups */}
      <div className="flex-1 overflow-y-auto">
        {filteredGroups.map((group) => (
          <div key={group.name} className="border-b border-[var(--panel-border)] last:border-b-0">
            {/* Group Header */}
            <button
              onClick={() => toggleGroup(group.name)}
              className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              {expandedGroups.has(group.name) ? (
                <ChevronDown className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
              )}
              <span className="text-base">{group.icon}</span>
              <span className="text-sm font-medium text-[var(--text-primary)] flex-1 text-left truncate">
                {group.name}
              </span>
              <span className="text-xs bg-gray-100 text-[var(--text-secondary)] px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {group.count}
              </span>
            </button>

            {/* Expanded: Action Items */}
            {expandedGroups.has(group.name) && (
              <div className="pb-2">
                {/* Phase 2 sẽ render actual actions ở đây */}
                <div className="px-4 py-2 text-xs text-[var(--text-muted)] italic">
                  {group.count} actions — kéo thả sẽ hoạt động ở Phase 2
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
