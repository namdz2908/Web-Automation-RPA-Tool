"use client";

import Link from "next/link";
import {
  Play,
  FlaskConical,
  Save,
  Undo2,
  Redo2,
  Search,
  Trash2,
  CircleDot,
  Sparkles,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

interface ToolbarProps {
  title: string;
  scriptId: string;
}

export function Toolbar({ title, scriptId }: ToolbarProps) {
  return (
    <div className="h-12 bg-white border-b border-[var(--panel-border)] flex items-center justify-between px-3 shrink-0">
      {/* Left: Actions */}
      <div className="flex items-center gap-1">
        <Link
          href="/"
          className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-gray-100 rounded-lg transition-colors"
          title="Về trang chủ"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div className="w-px h-6 bg-[var(--panel-border)] mx-1" />

        <ToolbarButton icon={<Play className="w-4 h-4" />} label="Run" variant="primary" />
        <ToolbarButton icon={<FlaskConical className="w-4 h-4" />} label="Test" />
        <ToolbarButton icon={<Save className="w-4 h-4" />} label="Save" />

        <div className="w-px h-6 bg-[var(--panel-border)] mx-1" />

        <ToolbarButton icon={<Undo2 className="w-4 h-4" />} title="Undo" />
        <ToolbarButton icon={<Redo2 className="w-4 h-4" />} title="Redo" />

        <div className="w-px h-6 bg-[var(--panel-border)] mx-1" />

        <ToolbarButton icon={<Search className="w-4 h-4" />} label="Search" />
        <ToolbarButton icon={<Trash2 className="w-4 h-4" />} label="Clear All" variant="danger" />

        <div className="w-px h-6 bg-[var(--panel-border)] mx-1" />

        <ToolbarButton icon={<CircleDot className="w-4 h-4 text-[var(--accent-red)]" />} label="Record action" />
        <ToolbarButton icon={<Sparkles className="w-4 h-4 text-[var(--accent-orange)]" />} label="Generate with AI" />
      </div>

      {/* Right: Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-[var(--text-secondary)]">
        <span className="text-[var(--primary)] font-medium">
          {scriptId === "new" ? "New Script" : `Script #${scriptId}`}
        </span>
        <ChevronRight className="w-3 h-3" />
        <span>{title}</span>
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
}: {
  icon: React.ReactNode;
  label?: string;
  title?: string;
  variant?: "default" | "primary" | "danger";
}) {
  const baseClasses =
    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm transition-colors cursor-pointer";
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
      className={`${baseClasses} ${variantClasses[variant]}`}
      title={titleProp || label}
    >
      {icon}
      {label && <span className="hidden lg:inline">{label}</span>}
    </button>
  );
}
