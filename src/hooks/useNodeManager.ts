// src/hooks/useNodeManager.ts
import { useState, useEffect, useMemo } from "react";
import { NodeManager } from "../../raw_modules/nodes-module/src";
import { NodeData, ContextItem } from "../../raw_modules/nodes-module/src";
import { useAppStore } from "../lib/store";

export function useNodeManager() {
  const { workspaces, selectedWorkspace, selectedScenario, currentNodeIndex } =
    useAppStore();

  const currentScenario = useMemo(() => {
    const workspace = workspaces.find((w) => w.id === selectedWorkspace);
    return workspace?.scenarios.find((s) => s.id === selectedScenario);
  }, [workspaces, selectedWorkspace, selectedScenario]);

  const nodeManager = useMemo(() => {
    return new NodeManager(currentScenario?.nodes || []);
  }, [currentScenario?.nodes]);

  const [currentNode, setCurrentNode] = useState<NodeData | null>(null);
  const [contextItems, setContextItems] = useState<ContextItem[]>([]);

  useEffect(() => {
    if (currentScenario && currentNodeIndex !== undefined) {
      const scenarioNodes = nodeManager.getNodesByScenario(currentScenario!.id);

      if (scenarioNodes.length > 0 && currentNodeIndex < scenarioNodes.length) {
        const node = nodeManager.prepareNodeForDisplay(
          scenarioNodes[currentNodeIndex].id,
          contextItems
        );

        setCurrentNode(node);
      }
    }
  }, [currentScenario, currentNodeIndex, contextItems]);

  const executeNode = (userInput: string) => {
    if (!currentNode) return;

    if (currentNode.id) {
      const result = nodeManager.executeNode(
        currentNode.id,
        userInput,
        contextItems
      );

      if (result) {
        if (result.contextUpdated) {
          setContextItems(result.updatedContext);
        }
      }
    }
  };

  return {
    nodeManager,
    currentNode,
    contextItems,
    executeNode,
  };
}
