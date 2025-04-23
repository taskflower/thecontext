// src/hooks/useNodeManager.ts
import { useState, useEffect, useMemo } from "react";
import { getValueByPath } from "../_npLib/byPath";
import { useContextStore } from "./useContextStore";
import { useWorkspaceStore } from "./useWorkspaceStore";

export function useNodeManager() {
  const { getContext, updateByContextPath } = useContextStore();
  const { getCurrentScenario } = useWorkspaceStore();
  const scenario = getCurrentScenario();
  const [idx, setIdx] = useState(0);
  const [history, setHistory] = useState<number[]>([]);

  // Pobierz i posortuj węzły według pola order, jeśli istnieje
  const nodes = useMemo(() => {
    if (!scenario) return [];

    // Pobierz węzły z odpowiedniego źródła
    const unsortedNodes =
      (scenario as any).nodes ?? (scenario as any).getSteps?.() ?? [];

    // Sortuj węzły według pola order, jeśli istnieje
    const sortedNodes = [...unsortedNodes].sort((a, b) => {
      // Jeśli pole order istnieje w obu węzłach, sortuj według niego
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }

      // Jeśli tylko jeden węzeł ma pole order, ten bez order idzie na koniec
      if (a.order !== undefined) return -1;
      if (b.order !== undefined) return 1;

      // Jeśli żaden nie ma pola order, zachowaj oryginalną kolejność
      return 0;
    });

    return sortedNodes;
  }, [scenario]);

  const node = nodes[idx];
  const isLast = idx === nodes.length - 1;

  // Resetuj indeks i historię przy zmianie scenariusza
  useEffect(() => {
    setIdx(0);
    setHistory([]);
  }, [scenario?.id]);

  // Pobierz elementy kontekstu dla bieżącego węzła
  const contextItems = useMemo(() => {
    const path = node?.contextPath;
    if (!path) return [];
    const ctx = getContext();
    const val = getValueByPath(ctx, path);
    return val !== undefined ? [[path, val]] : Object.entries(ctx);
  }, [node, getContext]);

  // Obsługa przycisku Wstecz
  const handlePrevious = () => {
    if (!history.length) return;
    setHistory((h) => {
      const prev = h[h.length - 1];
      setIdx(prev);
      return h.slice(0, -1);
    });
  };

  // Obsługa wykonania węzła i przejścia do następnego
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
