"use client";

import { useDroppable } from "@dnd-kit/core";
import { Plus } from "lucide-react";

interface CanvasDropZoneProps {
  id: string;
  parentId?: string | null;
  index?: number;
  isEmpty?: boolean;
  hintText?: string;
  className?: string;
}

export function CanvasDropZone({
  id,
  parentId = null,
  index,
  isEmpty = false,
  hintText = "Kéo action từ panel bên trái và thả vào đây",
  className = "",
}: CanvasDropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: "drop-zone",
      parentId,
      index,
    },
  });

  if (isEmpty) {
    return (
      <div
        ref={setNodeRef}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-all
          flex flex-col items-center justify-center gap-2
          ${
            isOver
              ? "border-[var(--primary)] bg-blue-50/80 scale-[1.01] shadow-inner"
              : "border-gray-300 hover:border-gray-400 bg-white/50"
          }
          ${className}
        `}
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            isOver ? "bg-[var(--primary)] text-white" : "bg-gray-100 text-gray-400"
          }`}
        >
          <Plus className="w-5 h-5" />
        </div>
        <p
          className={`text-sm font-medium transition-colors ${
            isOver ? "text-[var(--primary)]" : "text-[var(--text-muted)]"
          }`}
        >
          {isOver ? "Thả vào đây để thêm bước mới" : hintText}
        </p>
      </div>
    );
  }

  // Thin drop zone between blocks
  return (
    <div
      ref={setNodeRef}
      className={`h-2 -my-1 rounded transition-all duration-150 ${
        isOver
          ? "h-8 my-1 bg-blue-100 border-2 border-dashed border-[var(--primary)] flex items-center justify-center text-xs font-semibold text-[var(--primary)]"
          : "opacity-0 hover:opacity-100 hover:h-3 hover:bg-blue-50"
      } ${className}`}
    >
      {isOver && "Thả vào đây"}
    </div>
  );
}
