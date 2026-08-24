import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type {
  WorkflowNode,
  Variable,
  WorkflowData,
  ActionDefinition,
} from "@/types/workflow";
import { getActionDefinition } from "@/data/actionDefinitions";

// ─── Tree Helper Functions ───────────────────────────────────────────────────

/**
 * Tìm một node trong cây theo ID.
 */
export function findNodeById(
  nodes: WorkflowNode[],
  id: string
): WorkflowNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children && node.children.length > 0) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Tìm node cha và index của node theo ID.
 */
export function findParentAndIndex(
  nodes: WorkflowNode[],
  id: string,
  parent: WorkflowNode | null = null
): { parent: WorkflowNode | null; index: number } | null {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === id) {
      return { parent, index: i };
    }
    if (nodes[i].children && nodes[i].children!.length > 0) {
      const found = findParentAndIndex(nodes[i].children!, id, nodes[i]);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Cập nhật một node trong cây theo ID.
 */
export function updateNodeInTree(
  nodes: WorkflowNode[],
  id: string,
  updater: (node: WorkflowNode) => WorkflowNode
): WorkflowNode[] {
  return nodes.map((node) => {
    if (node.id === id) {
      return updater(node);
    }
    if (node.children && node.children.length > 0) {
      return {
        ...node,
        children: updateNodeInTree(node.children, id, updater),
      };
    }
    return node;
  });
}

/**
 * Xóa một node khỏi cây theo ID.
 */
export function removeNodeFromTree(
  nodes: WorkflowNode[],
  id: string
): { newNodes: WorkflowNode[]; removed: WorkflowNode | null } {
  let removed: WorkflowNode | null = null;

  function filterNodes(list: WorkflowNode[]): WorkflowNode[] {
    const result: WorkflowNode[] = [];
    for (const node of list) {
      if (node.id === id) {
        removed = node;
        continue;
      }
      if (node.children && node.children.length > 0) {
        result.push({
          ...node,
          children: filterNodes(node.children),
        });
      } else {
        result.push(node);
      }
    }
    return result;
  }

  const newNodes = filterNodes(nodes);
  return { newNodes, removed };
}

/**
 * Chèn một node vào cây tại vị trí chỉ định.
 */
export function insertNodeInTree(
  nodes: WorkflowNode[],
  nodeToInsert: WorkflowNode,
  parentId?: string | null,
  index?: number
): WorkflowNode[] {
  if (!parentId) {
    const newNodes = [...nodes];
    if (index !== undefined && index >= 0 && index <= newNodes.length) {
      newNodes.splice(index, 0, nodeToInsert);
    } else {
      newNodes.push(nodeToInsert);
    }
    return newNodes;
  }

  return nodes.map((node) => {
    if (node.id === parentId) {
      const children = node.children ? [...node.children] : [];
      if (index !== undefined && index >= 0 && index <= children.length) {
        children.splice(index, 0, nodeToInsert);
      } else {
        children.push(nodeToInsert);
      }
      return { ...node, children };
    }

    if (node.children && node.children.length > 0) {
      return {
        ...node,
        children: insertNodeInTree(node.children, nodeToInsert, parentId, index),
      };
    }

    return node;
  });
}

/**
 * Nhân bản một node (cùng toàn bộ children) với ID mới ngẫu nhiên.
 */
export function cloneNodeWithNewIds(node: WorkflowNode): WorkflowNode {
  return {
    ...node,
    id: uuidv4(),
    label: `${node.label} (Copy)`,
    children: node.children ? node.children.map(cloneNodeWithNewIds) : undefined,
  };
}

/**
 * Tạo một WorkflowNode mới từ ActionDefinition.
 */
export function createNodeFromDefinition(
  actionDef: ActionDefinition,
  customProperties?: Record<string, unknown>
): WorkflowNode {
  return {
    id: uuidv4(),
    type: actionDef.type,
    label: actionDef.label,
    category: actionDef.category,
    properties: {
      ...actionDef.defaultProperties,
      ...customProperties,
    },
    children: actionDef.isContainer ? [] : undefined,
    disabled: false,
    continueOnError: false,
  };
}

// ─── Zustand Store Interface ──────────────────────────────────────────────────

interface HistorySnapshot {
  nodes: WorkflowNode[];
  variables: Variable[];
}

interface WorkflowState {
  nodes: WorkflowNode[];
  selectedNodeId: string | null;
  variables: Variable[];
  settings: {
    name: string;
    description?: string;
  };
  isDirty: boolean;

  // History stack cho Undo/Redo
  historyPast: HistorySnapshot[];
  historyFuture: HistorySnapshot[];

  // Actions
  setWorkflow: (data: Partial<WorkflowData>) => void;
  selectNode: (id: string | null) => void;
  addNode: (
    nodeOrDef: WorkflowNode | ActionDefinition,
    parentId?: string | null,
    targetIndex?: number
  ) => string;
  moveNode: (
    activeId: string,
    overId: string,
    targetParentId?: string | null,
    insertIndex?: number
  ) => void;
  removeNode: (id: string) => void;
  duplicateNode: (id: string) => void;
  toggleNodeDisabled: (id: string) => void;
  updateNode: (id: string, updates: Partial<WorkflowNode>) => void;
  updateNodeProperties: (id: string, properties: Record<string, unknown>) => void;

  // Variable Actions
  addVariable: (variable: Omit<Variable, "id">) => void;
  updateVariable: (id: string, updates: Partial<Variable>) => void;
  removeVariable: (id: string) => void;

  // Undo / Redo & Clear
  undo: () => void;
  redo: () => void;
  clearWorkflow: () => void;
  markSaved: () => void;
}

const MAX_HISTORY = 30;

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: [],
  selectedNodeId: null,
  variables: [],
  settings: {
    name: "Untitled Script",
    description: "",
  },
  isDirty: false,
  historyPast: [],
  historyFuture: [],

  setWorkflow: (data) => {
    set({
      nodes: data.nodes || [],
      variables: data.variables || [],
      settings: {
        name: data.settings?.name || "Untitled Script",
        description: data.settings?.description || "",
      },
      selectedNodeId: null,
      isDirty: false,
      historyPast: [],
      historyFuture: [],
    });
  },

  selectNode: (id) => {
    set({ selectedNodeId: id });
  },

  addNode: (nodeOrDef, parentId = null, targetIndex) => {
    const state = get();
    const snapshot: HistorySnapshot = {
      nodes: state.nodes,
      variables: state.variables,
    };

    const newNode: WorkflowNode =
      "category" in nodeOrDef && "properties" in nodeOrDef
        ? (nodeOrDef as WorkflowNode)
        : createNodeFromDefinition(nodeOrDef as ActionDefinition);

    const newNodes = insertNodeInTree(
      state.nodes,
      newNode,
      parentId,
      targetIndex
    );

    set({
      nodes: newNodes,
      selectedNodeId: newNode.id,
      isDirty: true,
      historyPast: [...state.historyPast.slice(-MAX_HISTORY + 1), snapshot],
      historyFuture: [],
    });

    return newNode.id;
  },

  moveNode: (activeId, overId, targetParentId = null, insertIndex) => {
    const state = get();
    if (activeId === overId) return;

    const snapshot: HistorySnapshot = {
      nodes: state.nodes,
      variables: state.variables,
    };

    // 1. Remove active node
    const { newNodes: nodesWithoutActive, removed: activeNode } =
      removeNodeFromTree(state.nodes, activeId);

    if (!activeNode) return;

    let finalNodes: WorkflowNode[];

    if (targetParentId !== undefined) {
      // Direct insertion into parent with explicit index
      finalNodes = insertNodeInTree(
        nodesWithoutActive,
        activeNode,
        targetParentId,
        insertIndex
      );
    } else {
      // Find position of overId
      const overInfo = findParentAndIndex(nodesWithoutActive, overId);
      if (overInfo) {
        finalNodes = insertNodeInTree(
          nodesWithoutActive,
          activeNode,
          overInfo.parent?.id || null,
          overInfo.index
        );
      } else {
        finalNodes = [...nodesWithoutActive, activeNode];
      }
    }

    set({
      nodes: finalNodes,
      isDirty: true,
      historyPast: [...state.historyPast.slice(-MAX_HISTORY + 1), snapshot],
      historyFuture: [],
    });
  },

  removeNode: (id) => {
    const state = get();
    const snapshot: HistorySnapshot = {
      nodes: state.nodes,
      variables: state.variables,
    };

    const { newNodes } = removeNodeFromTree(state.nodes, id);

    set({
      nodes: newNodes,
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
      isDirty: true,
      historyPast: [...state.historyPast.slice(-MAX_HISTORY + 1), snapshot],
      historyFuture: [],
    });
  },

  duplicateNode: (id) => {
    const state = get();
    const target = findNodeById(state.nodes, id);
    if (!target) return;

    const snapshot: HistorySnapshot = {
      nodes: state.nodes,
      variables: state.variables,
    };

    const cloned = cloneNodeWithNewIds(target);
    const parentInfo = findParentAndIndex(state.nodes, id);

    const newNodes = insertNodeInTree(
      state.nodes,
      cloned,
      parentInfo?.parent?.id || null,
      parentInfo ? parentInfo.index + 1 : undefined
    );

    set({
      nodes: newNodes,
      selectedNodeId: cloned.id,
      isDirty: true,
      historyPast: [...state.historyPast.slice(-MAX_HISTORY + 1), snapshot],
      historyFuture: [],
    });
  },

  toggleNodeDisabled: (id) => {
    const state = get();
    const snapshot: HistorySnapshot = {
      nodes: state.nodes,
      variables: state.variables,
    };

    const newNodes = updateNodeInTree(state.nodes, id, (node) => ({
      ...node,
      disabled: !node.disabled,
    }));

    set({
      nodes: newNodes,
      isDirty: true,
      historyPast: [...state.historyPast.slice(-MAX_HISTORY + 1), snapshot],
      historyFuture: [],
    });
  },

  updateNode: (id, updates) => {
    const state = get();
    const newNodes = updateNodeInTree(state.nodes, id, (node) => ({
      ...node,
      ...updates,
    }));

    set({
      nodes: newNodes,
      isDirty: true,
    });
  },

  updateNodeProperties: (id, properties) => {
    const state = get();
    const newNodes = updateNodeInTree(state.nodes, id, (node) => ({
      ...node,
      properties: {
        ...node.properties,
        ...properties,
      },
    }));

    set({
      nodes: newNodes,
      isDirty: true,
    });
  },

  addVariable: (variableData) => {
    const state = get();
    const newVariable: Variable = {
      ...variableData,
      id: uuidv4(),
    };

    set({
      variables: [...state.variables, newVariable],
      isDirty: true,
    });
  },

  updateVariable: (id, updates) => {
    const state = get();
    set({
      variables: state.variables.map((v) =>
        v.id === id ? { ...v, ...updates } : v
      ),
      isDirty: true,
    });
  },

  removeVariable: (id) => {
    const state = get();
    set({
      variables: state.variables.filter((v) => v.id !== id),
      isDirty: true,
    });
  },

  undo: () => {
    const state = get();
    if (state.historyPast.length === 0) return;

    const previous = state.historyPast[state.historyPast.length - 1];
    const newPast = state.historyPast.slice(0, -1);

    const currentSnapshot: HistorySnapshot = {
      nodes: state.nodes,
      variables: state.variables,
    };

    set({
      nodes: previous.nodes,
      variables: previous.variables,
      historyPast: newPast,
      historyFuture: [currentSnapshot, ...state.historyFuture],
      isDirty: true,
    });
  },

  redo: () => {
    const state = get();
    if (state.historyFuture.length === 0) return;

    const next = state.historyFuture[0];
    const newFuture = state.historyFuture.slice(1);

    const currentSnapshot: HistorySnapshot = {
      nodes: state.nodes,
      variables: state.variables,
    };

    set({
      nodes: next.nodes,
      variables: next.variables,
      historyPast: [...state.historyPast, currentSnapshot],
      historyFuture: newFuture,
      isDirty: true,
    });
  },

  clearWorkflow: () => {
    const state = get();
    const snapshot: HistorySnapshot = {
      nodes: state.nodes,
      variables: state.variables,
    };

    set({
      nodes: [],
      selectedNodeId: null,
      isDirty: true,
      historyPast: [...state.historyPast.slice(-MAX_HISTORY + 1), snapshot],
      historyFuture: [],
    });
  },

  markSaved: () => {
    set({ isDirty: false });
  },
}));
