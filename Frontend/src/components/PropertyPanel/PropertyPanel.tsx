"use client";

import { useState } from "react";
import { Settings, Variable, MousePointerClick } from "lucide-react";

// ─── Property Panel (Bên phải) ───────────────────────────────────────────────
// Phase 1: Placeholder layout
// Phase 4: Sẽ thêm dynamic property form dựa trên selected node
export function PropertyPanel() {
  const [activeTab, setActiveTab] = useState<"property" | "variables">("property");

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Tab Header */}
      <div className="flex border-b border-[var(--panel-border)] shrink-0">
        <button
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
          onClick={() => setActiveTab("variables")}
          className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
            activeTab === "variables"
              ? "text-[var(--primary)] border-b-2 border-[var(--primary)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Variable className="w-4 h-4" />
          Variables
          <span className="text-xs bg-gray-100 text-[var(--text-secondary)] px-1.5 py-0.5 rounded-full">
            9
          </span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "property" ? (
          <PropertyTabContent />
        ) : (
          <VariablesTabContent />
        )}
      </div>
    </div>
  );
}

// ─── Property Tab Placeholder ────────────────────────────────────────────────
function PropertyTabContent() {
  return (
    <div className="p-4">
      {/* Action Type Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <span className="text-xl">📷</span>
        </div>
        <div>
          <h3 className="font-semibold text-[var(--text-primary)]">Screenshot</h3>
          <p className="text-xs text-[var(--text-muted)]">No comment</p>
        </div>
      </div>

      {/* Auto-save badge */}
      <div className="mb-4">
        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-green-50 text-green-600 rounded-full">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
          Auto-save is enabled
        </span>
      </div>

      {/* Property Fields (placeholder) */}
      <div className="space-y-4">
        <PropertyFieldPlaceholder label="Output path" value="D:\Downloads" />
        <PropertyFieldPlaceholder label="File name" value="ảnh test" />

        <div className="flex items-center gap-2">
          <input type="checkbox" checked readOnly className="accent-[var(--primary)]" />
          <label className="text-sm text-[var(--text-primary)]">Full page</label>
        </div>

        <PropertyFieldPlaceholder label="Output Variable Name" value="img_test" />
        <PropertyFieldPlaceholder
          label="Delay after completion (ms) (min,max)"
          value="0,0"
        />

        <div className="flex items-center gap-2">
          <input type="checkbox" readOnly className="accent-[var(--primary)]" />
          <label className="text-sm text-[var(--text-primary)]">Continue on error</label>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
            Note
          </label>
          <textarea
            rows={3}
            placeholder="Quick note about this action — visible only in the editor, does not affect runtime"
            className="w-full px-3 py-2 text-sm border border-[var(--panel-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Variables Tab Placeholder ───────────────────────────────────────────────
function VariablesTabContent() {
  return (
    <div className="p-4">
      <div className="text-center py-8">
        <MousePointerClick className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
        <p className="text-sm text-[var(--text-secondary)]">
          Quản lý biến sẽ được xây dựng ở Phase 4
        </p>
      </div>
    </div>
  );
}

// ─── Property Field Helper ───────────────────────────────────────────────────
function PropertyFieldPlaceholder({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
        {label}
      </label>
      <input
        type="text"
        defaultValue={value}
        className="w-full px-3 py-2 text-sm border border-[var(--panel-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
      />
    </div>
  );
}
