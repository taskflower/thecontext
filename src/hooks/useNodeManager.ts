/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useNodeManager.ts
import { useState, useEffect, useMemo } from "react";
import { NodeManager } from "../../raw_modules/nodes-module/src";
import { NodeData, ContextItem, NodeExecutionResult } from "../../raw_modules/nodes-module/src";
import { useAppStore } from "../lib/store";
import { useNavigate, useParams } from 'react-router-dom';

// Define a proper interface for the hook return type
interface NodeManagerHook {
  // Node data
  nodeManager: NodeManager;
  currentNode: NodeData | null;
  currentScenario: any | null;
  isLastNode: boolean;
  
  // Context management
  contextItems: ContextItem[];
  
  // Navigation handlers
  handleGoToScenariosList: () => void;
  handlePreviousNode: () => void;
  handleNodeExecution: (userInput: string) => void;
  
  // Debug info
  debugInfo: {
    workspaceId: string | undefined;
    scenarioId: string | undefined;
    nodeId: string | undefined;
    currentNodeIndex: number;
    currentNodeLabel: string | undefined;
    contextItems: ContextItem[];
  };
}

export function useNodeManager(): NodeManagerHook {
  const { 
    workspace: workspaceId, 
    scenario: scenarioId, 
    node: nodeParam 
  } = useParams<{ workspace: string; scenario: string; node?: string }>();
  
  const navigate = useNavigate();
  
  const { 
    workspaces, 
    selectWorkspace, 
    selectScenario,
    currentNodeIndex,
    nextNode,
    prevNode,
    setNodeIndex
  } = useAppStore();
  
  const [contextItems, setContextItems] = useState<ContextItem[]>([]);

  // Set the selected workspace and scenario based on URL params
  useEffect(() => {
    if (workspaceId) {
      selectWorkspace(workspaceId);
    }
    if (scenarioId) {
      selectScenario(scenarioId);
    }
  }, [workspaceId, scenarioId, selectWorkspace, selectScenario]);

  // Calculate current scenario
  const currentScenario = useMemo(() => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    return workspace?.scenarios.find(s => s.id === scenarioId);
  }, [workspaces, workspaceId, scenarioId]);

  const nodeManager = useMemo(() => {
    return new NodeManager(currentScenario?.nodes || []);
  }, [currentScenario?.nodes]);

  const [currentNode, setCurrentNode] = useState<NodeData | null>(null);

  // Check if we're on the last node
  const isLastNode = currentScenario 
    ? currentNodeIndex === currentScenario.nodes.length - 1 
    : false;

  // Handle specific node navigation if node param is present
  useEffect(() => {
    if (nodeParam && currentScenario) {
      const nodeIndex = currentScenario.nodes.findIndex(n => n.id === nodeParam);
      if (nodeIndex !== -1) {
        setNodeIndex(nodeIndex);
      }
    }
  }, [nodeParam, currentScenario, setNodeIndex]);

  // Update current node when scenario or node index changes
  useEffect(() => {
    if (currentScenario && currentNodeIndex !== undefined) {
      const scenarioNodes = nodeManager.getNodesByScenario(currentScenario.id);

      if (scenarioNodes.length > 0 && currentNodeIndex < scenarioNodes.length) {
        const node = nodeManager.prepareNodeForDisplay(
          scenarioNodes[currentNodeIndex].id,
          contextItems
        );

        setCurrentNode(node);
      }
    }
  }, [currentScenario, currentNodeIndex, contextItems, nodeManager]);

  // Debug logging
  useEffect(() => {
    console.log('Current Flow State:', {
      workspaces,
      workspaceId,
      scenarioId,
      currentNodeIndex,
      currentNode,
      contextItems
    });
  }, [workspaces, workspaceId, scenarioId, currentNodeIndex, currentNode, contextItems]);

  // Execute a node with user input
  const executeNode = (userInput: string): NodeExecutionResult | null => {
    if (!currentNode) return null;

    if (currentNode.id) {
      const result = nodeManager.executeNode(
        currentNode.id,
        userInput,
        contextItems
      );

      return result;
    }
    
    return null;
  };

  // Navigation handlers
  const handleGoToScenariosList = () => {
    if (workspaceId) {
      navigate(`/${workspaceId}`);
    } else {
      navigate('/');
    }
  };

  const handlePreviousNode = () => {
    if (currentNodeIndex > 0 && currentScenario) {
      prevNode();
      
      // Update URL to previous node
      const prevNodeId = currentScenario.nodes[currentNodeIndex - 1].id;
      navigate(`/${workspaceId}/${scenarioId}/${prevNodeId}`);
    }
  };

  const handleNodeExecution = (userInput: string) => {
    if (currentNode) {
      // Execute the node and get the result
      const result = executeNode(userInput);
      
      // If the context was updated, update our context state
      if (result && result.contextUpdated) {
        setContextItems(result.updatedContext);
      }
      
      if (!isLastNode) {
        // Navigate to the next node
        nextNode();
        
        // If we know what the next node will be, update URL
        if (currentScenario && currentNodeIndex + 1 < currentScenario.nodes.length) {
          const nextNodeId = currentScenario.nodes[currentNodeIndex + 1].id;
          navigate(`/${workspaceId}/${scenarioId}/${nextNodeId}`);
        }
      } else {
        // Action after flow completion - redirect to scenarios list
        alert('Flow completed!');
        navigate(`/${workspaceId}`);
      }
    }
  };

  // Prepare debug info
  const debugInfo = {
    workspaceId,
    scenarioId,
    nodeId: currentNode?.id,
    currentNodeIndex,
    currentNodeLabel: currentNode?.label,
    contextItems
  };

  return {
    nodeManager,
    currentNode,
    currentScenario,
    isLastNode,
    contextItems,
    handleGoToScenariosList,
    handlePreviousNode,
    handleNodeExecution,
    debugInfo
  };
}