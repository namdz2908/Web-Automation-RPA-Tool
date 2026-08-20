"use client";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/ResizablePanels";
import { Toolbar } from "@/components/Toolbar/Toolbar";
import { ActionsPanel } from "@/components/ActionsPanel/ActionsPanel";
import { WorkflowCanvas } from "@/components/WorkflowCanvas/WorkflowCanvas";
import { PropertyPanel } from "@/components/PropertyPanel/PropertyPanel";
import type { Script } from "@/types/workflow";

interface EditorClientProps {
  initialScript: Script | null;
  scriptId: string;
}

export function EditorClient({ initialScript, scriptId }: EditorClientProps) {
  const isNew = scriptId === "new";
  const title = initialScript?.title || (isNew ? "Untitled Script" : "Loading...");

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <Toolbar title={title} scriptId={scriptId} />

      {/* ── 3-Panel Editor Layout ───────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Panel Trái: Actions */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <ActionsPanel />
          </ResizablePanel>

          <ResizableHandle />

          {/* Panel Giữa: Workflow Canvas */}
          <ResizablePanel defaultSize={55} minSize={35}>
            <WorkflowCanvas />
          </ResizablePanel>

          <ResizableHandle />

          {/* Panel Phải: Properties */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
            <PropertyPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* ── Footer Status Bar ───────────────────────────────────────────── */}
      <footer className="h-7 bg-[var(--primary)] text-white text-xs flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-[var(--accent-green)] rounded-full" />
            Saved
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span>📁 {initialScript?.title || "New Script"}</span>
          <span>⚠ 0 Error List</span>
        </div>
      </footer>
    </div>
  );
}
