"use client";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus, Info, Layers } from "lucide-react";
import { useWorkflowStore } from "@/stores/workflowStore";
import { SortableWorkflowBlock } from "./SortableWorkflowBlock";
import { CanvasDropZone } from "./CanvasDropZone";

export function WorkflowCanvas() {
  const nodes = useWorkflowStore((s) => s.nodes);
  const selectNode = useWorkflowStore((s) => s.selectNode);
  const addNode = useWorkflowStore((s) => s.addNode);

  // Đếm tổng số node (bao gồm cả children lồng nhau)
  const countTotalNodes = (list: typeof nodes): number => {
    return list.reduce((total, node) => {
      return total + 1 + (node.children ? countTotalNodes(node.children) : 0);
    }, 0);
  };

  const totalCount = countTotalNodes(nodes);

  const handleAddNormalBlock = () => {
    addNode({
      type: "NORMAL_BLOCK",
      label: "Normal Block",
      category: "Flow Control",
      icon: "📋",
      isContainer: true,
      propertyFields: [
        { key: "blockName", label: "Block name", type: "text", placeholder: "e.g. Main logic" },
      ],
      defaultProperties: { blockName: "Main Logic" },
    });
  };

  return (
    <div
      className="h-full bg-[var(--editor-bg)] flex flex-col select-none"
      onClick={() => selectNode(null)}
    >
      {/* ── Canvas Header ────────────────────────────────────────────── */}
      <div className="px-4 py-3 bg-white border-b border-[var(--panel-border)] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-[var(--primary)]" />
          <h2 className="font-semibold text-[var(--text-primary)]">
            Main workflow
          </h2>
          <span className="text-xs bg-blue-50 text-[var(--primary)] border border-blue-200 px-2 py-0.5 rounded-full font-medium">
            {totalCount} block{totalCount !== 1 ? "s" : ""}
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleAddNormalBlock();
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[var(--primary)] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
          title="Thêm Normal Block mới"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Khối</span>
        </button>
      </div>

      {/* ── Canvas Content ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {/* Info Banner */}
        <div className="flex items-start gap-3 p-3 bg-blue-50/80 border border-blue-200 rounded-xl">
          <Info className="w-5 h-5 text-[var(--primary)] shrink-0 mt-0.5" />
          <div className="text-xs text-blue-900 leading-relaxed">
            <span className="font-semibold">Mẹo kéo thả:</span> Kéo action từ danh mục bên trái thả vào canvas. 
            Bạn có thể thả vào giữa các khối lệnh hoặc thả vào bên trong các khối <strong>Container (Normal Block, Loop, If/Else)</strong>.
          </div>
        </div>

        {/* ── Workflow Blocks Tree ────────────────────────────────────── */}
        {nodes.length === 0 ? (
          <CanvasDropZone
            id="root-drop-empty"
            parentId={null}
            index={0}
            isEmpty={true}
            hintText="Kéo action từ danh mục bên trái hoặc bấm '+ Thêm Khối' để bắt đầu kịch bản"
            className="my-8"
          />
        ) : (
          <div className="space-y-1.5 pb-8">
            <SortableContext
              items={nodes.map((n) => n.id)}
              strategy={verticalListSortingStrategy}
            >
              {nodes.map((node, idx) => (
                <SortableWorkflowBlock
                  key={node.id}
                  node={node}
                  index={idx + 1}
                  depth={0}
                />
              ))}
            </SortableContext>

            {/* Drop zone at the bottom of root */}
            <CanvasDropZone
              id="root-drop-bottom"
              parentId={null}
              index={nodes.length}
              isEmpty={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}
