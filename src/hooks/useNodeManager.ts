// src/hooks/useNodeManager.ts
import { useState, useEffect, useMemo } from "react";
import { getValueByPath } from "../lib/byPath";
import { useContextStore } from "./useContextStore";
import { useWorkspaceStore } from "./useWorkspaceStore";

export function useNodeManager() {
  const { getContext, updateByContextPath } = useContextStore();
  const { getCurrentScenario } = useWorkspaceStore();
  const scenario = getCurrentScenario();
  const [idx, setIdx] = useState(0);
  const [history, setHistory] = useState<number[]>([]);

  const nodes = useMemo(() => {
    if (!scenario) return [];

    return (scenario as any).nodes ?? (scenario as any).getSteps?.() ?? [];
  }, [scenario]);
  const node = nodes[idx];
  const isLast = idx === nodes.length - 1;

  useEffect(() => {
    setIdx(0);
    setHistory([]);
  }, [scenario?.id]);

  const contextItems = useMemo(() => {
    const path = node?.contextPath;
    if (!path) return [];
    const ctx = getContext();
    const val = getValueByPath(ctx, path);
    return val !== undefined ? [[path, val]] : Object.entries(ctx);
  }, [node, getContext]);

  const handlePrevious = () => {
    if (!history.length) return;
    setHistory((h) => {
      const prev = h[h.length - 1];
      setIdx(prev);
      return h.slice(0, -1);
    });
  };

  const handleExecute = (data: any) => {
    if (node?.contextPath != null && data !== undefined) {
      updateByContextPath(node.contextPath, data);
    }
    if (isLast) return;
    setHistory((h) => [...h, idx]);
    setIdx((i) => i + 1);
  };

  return {
    currentNode: node,
    isLastNode: isLast,
    handlePreviousNode: handlePrevious,
    handleNodeExecution: handleExecute,
    contextItems,
    currentScenario: scenario,
  };
}
