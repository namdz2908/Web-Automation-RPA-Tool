"use client";

// ─── Resizable Panels Wrapper ─────────────────────────────────────────────────
// Thin wrapper around react-resizable-panels for consistent API

import {
  Group,
  Panel,
  Separator,
} from "react-resizable-panels";

interface ResizablePanelGroupProps {
  direction: "horizontal" | "vertical";
  children: React.ReactNode;
  className?: string;
}

export function ResizablePanelGroup({
  direction,
  children,
  className = "",
}: ResizablePanelGroupProps) {
  return (
    <Group orientation={direction} className={`h-full ${className}`}>
      {children}
    </Group>
  );
}

interface ResizablePanelProps {
  defaultSize?: number | string;
  minSize?: number | string;
  maxSize?: number | string;
  children: React.ReactNode;
  className?: string;
}

export function ResizablePanel({
  defaultSize,
  minSize,
  maxSize,
  children,
  className = "",
}: ResizablePanelProps) {
  return (
    <Panel
      defaultSize={defaultSize !== undefined ? `${defaultSize}%` : undefined}
      minSize={minSize !== undefined ? `${minSize}%` : undefined}
      maxSize={maxSize !== undefined ? `${maxSize}%` : undefined}
      className={className}
    >
      {children}
    </Panel>
  );
}

export function ResizableHandle() {
  return (
    <Separator className="w-1 bg-[var(--panel-border)] hover:bg-[var(--primary)] transition-colors data-[separator]:cursor-col-resize" />
  );
}
