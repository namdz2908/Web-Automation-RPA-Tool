"use client";

import { useDraggable } from "@dnd-kit/core";
import { GripVertical } from "lucide-react";
import type { ActionDefinition } from "@/types/workflow";
import { getCategoryMeta } from "@/data/actionDefinitions";

interface DraggableActionItemProps {
  action: ActionDefinition;
}

export function DraggableActionItem({ action }: DraggableActionItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `action-def-${action.type}`,
    data: {
      type: "action-def",
      action,
    },
  });

  const meta = getCategoryMeta(action.category);

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`
        flex items-center gap-2.5 mx-3 mb-1 px-3 py-2 rounded-lg
        border border-transparent hover:border-blue-200 hover:bg-blue-50/50
        cursor-grab active:cursor-grabbing transition-all select-none group
        ${isDragging ? "opacity-40 border-dashed border-blue-400 bg-blue-50" : "bg-white"}
      `}
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
