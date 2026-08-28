"use client";

import Link from "next/link";
import {
  Play,
  FlaskConical,
  Save,
  Undo2,
  Redo2,
  Trash2,
  CircleDot,
  Sparkles,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { useWorkflowStore } from "@/stores/workflowStore";

interface ToolbarProps {
  title: string;
  scriptId: string;
  onSave?: () => void;
  onRun?: () => void;
  isSaving?: boolean;
}

export function Toolbar({
  title,
  scriptId,
  onSave,
  onRun,
  isSaving = false,
}: ToolbarProps) {
  const undo = useWorkflowStore((s) => s.undo);
  const redo = useWorkflowStore((s) => s.redo);
  const clearWorkflow = useWorkflowStore((s) => s.clearWorkflow);
  const canUndo = useWorkflowStore((s) => s.historyPast.length > 0);
  const canRedo = useWorkflowStore((s) => s.historyFuture.length > 0);
  const isDirty = useWorkflowStore((s) => s.isDirty);

  const handleClearAll = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ các khối lệnh trong kịch bản này?")) {
      clearWorkflow();
    }
  };

  return (
    <div className="h-12 bg-white border-b border-[var(--panel-border)] flex items-center justify-between px-3 shrink-0 select-none">
      {/* Left: Actions */}
      <div className="flex items-center gap-1">
        <Link
          href="/"
          className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-gray-100 rounded-lg transition-colors"
          title="Về trang chủ danh sách script"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div className="w-px h-6 bg-[var(--panel-border)] mx-1" />

        <ToolbarButton
          icon={<Play className="w-4 h-4" />}
          label="Run"
          variant="primary"
          onClick={onRun}
        />
        <ToolbarButton
          icon={<FlaskConical className="w-4 h-4" />}
          label="Test"
          onClick={onRun}
        />
        <ToolbarButton
          icon={<Save className="w-4 h-4" />}
          label={isSaving ? "Saving..." : isDirty ? "Save *" : "Save"}
          variant={isDirty ? "primary" : "default"}
          onClick={onSave}
          disabled={isSaving}
        />

        <div className="w-px h-6 bg-[var(--panel-border)] mx-1" />

        <ToolbarButton
          icon={<Undo2 className="w-4 h-4" />}
          title="Undo (Ctrl+Z)"
          onClick={undo}
          disabled={!canUndo}
        />
        <ToolbarButton
          icon={<Redo2 className="w-4 h-4" />}
          title="Redo (Ctrl+Y)"
          onClick={redo}
          disabled={!canRedo}
        />

        <div className="w-px h-6 bg-[var(--panel-border)] mx-1" />

        <ToolbarButton
          icon={<Trash2 className="w-4 h-4" />}
          label="Clear All"
          variant="danger"
          onClick={handleClearAll}
        />

        <div className="w-px h-6 bg-[var(--panel-border)] mx-1" />

        <ToolbarButton
          icon={<CircleDot className="w-4 h-4 text-[var(--accent-red)]" />}
          label="Record action"
          onClick={() => alert("Tính năng Record Action sẽ hỗ trợ trong bản cập nhật kế tiếp.")}
        />
        <ToolbarButton
          icon={<Sparkles className="w-4 h-4 text-[var(--accent-orange)]" />}
          label="Generate with AI"
          onClick={() => alert("Tính năng AI Assistant sẽ hỗ trợ trong bản cập nhật kế tiếp.")}
        />
      </div>

      {/* Right: Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-[var(--text-secondary)]">
        <span className="text-[var(--primary)] font-medium">
          {scriptId === "new" ? "New Script" : `Script #${scriptId}`}
        </span>
        <ChevronRight className="w-3 h-3" />
        <span className="truncate max-w-[200px]">{title}</span>
      </div>
    </div>
  );
}

// ─── Toolbar Button Helper ────────────────────────────────────────────────────
function ToolbarButton({
  icon,
  label,
  title: titleProp,
  variant = "default",
  onClick,
  disabled = false,
}: {
  icon: React.ReactNode;
  label?: string;
  title?: string;
  variant?: "default" | "primary" | "danger";
  onClick?: () => void;
  disabled?: boolean;
}) {
  const baseClasses =
    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";
  const variantClasses = {
    default:
      "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-gray-100",
    primary:
      "text-[var(--primary)] hover:bg-[var(--primary-light)] font-medium",
    danger:
      "text-[var(--text-secondary)] hover:text-[var(--accent-red)] hover:bg-red-50",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]}`}
      title={titleProp || label}
    >
      {icon}
      {label && <span className="hidden lg:inline">{label}</span>}
    </button>
  );
}
