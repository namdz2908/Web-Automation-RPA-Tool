"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  pointerWithin,
} from "@dnd-kit/core";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/ResizablePanels";
import { Toolbar } from "@/components/Toolbar/Toolbar";
import { ActionsPanel } from "@/components/ActionsPanel/ActionsPanel";
import { WorkflowCanvas } from "@/components/WorkflowCanvas/WorkflowCanvas";
import { PropertyPanel } from "@/components/PropertyPanel/PropertyPanel";
import { useWorkflowStore, createNodeFromDefinition } from "@/stores/workflowStore";
import type { Script, ActionDefinition, WorkflowNode } from "@/types/workflow";
import { getCategoryMeta } from "@/data/actionDefinitions";

interface EditorClientProps {
  initialScript: Script | null;
  scriptId: string;
}

export function EditorClient({ initialScript, scriptId }: EditorClientProps) {
  const setWorkflow = useWorkflowStore((s) => s.setWorkflow);
  const addNode = useWorkflowStore((s) => s.addNode);
  const moveNode = useWorkflowStore((s) => s.moveNode);
  const isDirty = useWorkflowStore((s) => s.isDirty);
  const markSaved = useWorkflowStore((s) => s.markSaved);

  const [activeDragItem, setActiveDragItem] = useState<{
    type: "action-def" | "workflow-node";
    data: ActionDefinition | WorkflowNode;
  } | null>(null);

  // Cấu hình PointerSensor để không nhầm lẫn giữa click và drag
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Khởi tạo dữ liệu vào Zustand store từ initialScript
  useEffect(() => {
    if (initialScript?.workflow_data) {
      setWorkflow(initialScript.workflow_data);
    } else if (initialScript?.steps && initialScript.steps.length > 0) {
      // Legacy steps array
      const convertedNodes: WorkflowNode[] = (initialScript.steps as Array<{
        type: string;
        selector?: string;
        value?: string;
        timeout?: number;
      }>).map((s, idx) => ({
        id: `legacy-node-${idx}-${Date.now()}`,
        type: s.type || "GOTO",
        label: s.type || "Action",
        category: "Browser - Navigation",
        properties: {
          url: s.value || "",
          selector: s.selector || "",
          value: s.value || "",
          timeout: s.timeout || 10000,
        },
      }));
      setWorkflow({
        nodes: convertedNodes,
        variables: [],
        settings: { name: initialScript.title || "Script" },
      });
    } else if (scriptId === "new") {
      // Starter template for new script
      const starterNodes: WorkflowNode[] = [
        {
          id: "starter-container-1",
          type: "NORMAL_BLOCK",
          label: "Normal block",
          category: "Flow Control",
          properties: { blockName: "Main logic" },
          children: [
            {
              id: "starter-node-1",
              type: "GOTO",
              label: "Go to URL",
              category: "Browser - Navigation",
              properties: { url: "https://google.com", waitUntil: "domcontentloaded" },
            },
            {
              id: "starter-node-2",
              type: "SCREENSHOT",
              label: "Screenshot",
              category: "Browser - Navigation",
              properties: { fileName: "home_page", fullPage: true },
            },
          ],
        },
      ];
      setWorkflow({
        nodes: starterNodes,
        variables: [],
        settings: { name: "Untitled Script" },
      });
    }
  }, [initialScript, scriptId, setWorkflow]);

  // Xử lý bắt đầu kéo
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeData = active.data.current;

    if (activeData?.type === "action-def") {
      setActiveDragItem({
        type: "action-def",
        data: activeData.action,
      });
    } else if (activeData?.type === "workflow-node") {
      setActiveDragItem({
        type: "workflow-node",
        data: activeData.node,
      });
    }
  };

  // Xử lý thả
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragItem(null);

    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // Case 1: Kéo action từ ActionsPanel thả vào Canvas / Container
    if (activeData?.type === "action-def") {
      const actionDef = activeData.action as ActionDefinition;

      if (overData?.type === "drop-zone") {
        // Thả vào drop zone chỉ định
        addNode(actionDef, overData.parentId, overData.index);
      } else if (overData?.type === "workflow-node") {
        // Thả lên trên một node có sẵn -> chèn vào cùng cấp
        const overNode = overData.node as WorkflowNode;
        if (overNode.children !== undefined && actionDef.type !== overNode.type) {
          // Thả vào container node
          addNode(actionDef, overNode.id);
        } else {
          addNode(actionDef, null);
        }
      } else {
        // Fallback thêm vào cuối root
        addNode(actionDef, null);
      }
      return;
    }

    // Case 2: Sắp xếp lại node trong Canvas
    if (activeData?.type === "workflow-node") {
      const activeNode = activeData.node as WorkflowNode;

      if (overData?.type === "drop-zone") {
        moveNode(
          activeNode.id,
          String(over.id),
          overData.parentId,
          overData.index
        );
      } else if (overData?.type === "workflow-node") {
        const overNode = overData.node as WorkflowNode;
        moveNode(activeNode.id, overNode.id);
      }
    }
  };

  const title = initialScript?.title || (scriptId === "new" ? "Untitled Script" : "Loading...");

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen flex flex-col overflow-hidden">
        {/* ── Toolbar ─────────────────────────────────────────────────────── */}
        <Toolbar
          title={title}
          scriptId={scriptId}
          onSave={() => {
            markSaved();
            alert("Đã lưu workflow vào local state! (Phase 5 sẽ đồng bộ vào PostgreSQL DB)");
          }}
          onRun={() => {
            alert("Kích hoạt chạy kịch bản! (Phase 5 sẽ gửi yêu cầu tới Worker)");
          }}
        />

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
        <footer className="h-7 bg-[var(--primary)] text-white text-xs flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isDirty ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
                }`}
              />
              {isDirty ? "Chưa lưu thay đổi" : "Đã đồng bộ"}
            </span>
          </div>
          <div className="flex items-center gap-4 text-white/80">
            <span>📁 {initialScript?.title || "New Script"}</span>
            <span>⚡ Ready</span>
          </div>
        </footer>
      </div>

      {/* ── Drag Overlay Preview ────────────────────────────────────────── */}
      <DragOverlay dropAnimation={null}>
        {activeDragItem ? (
          activeDragItem.type === "action-def" ? (
            <ActionDragPreview action={activeDragItem.data as ActionDefinition} />
          ) : (
            <NodeDragPreview node={activeDragItem.data as WorkflowNode} />
          )
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// ─── Drag Previews ────────────────────────────────────────────────────────────

function ActionDragPreview({ action }: { action: ActionDefinition }) {
  const meta = getCategoryMeta(action.category);

  return (
    <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white border-2 border-[var(--primary)] shadow-xl cursor-grabbing scale-105 min-w-[220px]">
      <span className="text-lg">{action.icon}</span>
      <span className="text-sm font-semibold text-[var(--text-primary)]">
        {action.label}
      </span>
      {action.isContainer && (
        <span
          className="text-[10px] px-1.5 py-0.5 rounded font-medium ml-auto"
          style={{
            backgroundColor: meta ? `${meta.color}20` : "#f3f4f6",
            color: meta?.color || "#6b7280",
          }}
        >
          Container
        </span>
      )}
    </div>
  );
}

function NodeDragPreview({ node }: { node: WorkflowNode }) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-blue-50 border-2 border-[var(--primary)] shadow-xl cursor-grabbing scale-105 min-w-[240px]">
      <span className="text-lg">⚙️</span>
      <span className="text-sm font-semibold text-[var(--primary)]">
        {node.label || node.type}
      </span>
    </div>
  );
}
