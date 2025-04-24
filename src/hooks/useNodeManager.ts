// src/hooks/useNodeManager.ts
import { useState, useEffect, useMemo } from "react";
import { getValueByPath } from "../utils/byPath";
import { useContextStore } from "./useContextStore";
import { useWorkspaceStore } from "./useWorkspaceStore";

export function useNodeManager() {
  const { getContext, updateByContextPath } = useContextStore();
  const { getCurrentScenario } = useWorkspaceStore();
  const scenario = getCurrentScenario();
  const [idx, setIdx] = useState(0);
  const [history, setHistory] = useState<number[]>([]);

  // Fetch and sort nodes by order field if it exists
  const nodes = useMemo(() => {
    if (!scenario) return [];

    // Get nodes from the appropriate source
    const unsortedNodes =
      (scenario as any).nodes ?? (scenario as any).getSteps?.() ?? [];

    // Sort nodes by order field if it exists
    const sortedNodes = [...unsortedNodes].sort((a, b) => {
      // If order field exists in both nodes, sort by it
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }

      // If only one node has order field, the one without order goes to the end
      if (a.order !== undefined) return -1;
      if (b.order !== undefined) return 1;

      // If neither has order field, keep original order
      return 0;
    });

    return sortedNodes;
  }, [scenario]);

  const node = nodes[idx];
  const isLast = idx === nodes.length - 1;
  const isFirst = idx === 0;

  // Reset index and history when scenario changes
  useEffect(() => {
    setIdx(0);
    setHistory([]);
  }, [scenario?.id]);

  // Get context items for current node
  const contextItems = useMemo(() => {
    const path = node?.contextPath;
    if (!path) return [];
    const ctx = getContext();
    const val = getValueByPath(ctx, path);
    return val !== undefined ? [[path, val]] : Object.entries(ctx);
  }, [node, getContext]);

  // Handle back button
  const handlePrevious = () => {
    if (!history.length) return;
    setHistory((h) => {
      const prev = h[h.length - 1];
      setIdx(prev);
      return h.slice(0, -1);
    });
  };

  // Handle node execution and moving to next node
  const handleExecute = (data: any) => {
    // Save data to context if contextPath is provided
    if (node?.contextPath != null && data !== undefined) {
      updateByContextPath(node.contextPath, data);
    }
    
    // If this is the last node, just return - navigation will be handled by the component
    if (isLast) return;
    
    // Otherwise update history and move to next node
    setHistory((h) => [...h, idx]);
    setIdx((i) => i + 1);
  };

  return {
    currentNode: node,
    isLastNode: isLast,
    isFirstNode: isFirst,
    handlePreviousNode: handlePrevious,
    handleNodeExecution: handleExecute,
    contextItems,
    currentScenario: scenario,
  };
}