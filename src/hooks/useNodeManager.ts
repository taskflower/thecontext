/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useNodeManager.ts
import { useState, useEffect, useMemo } from "react";
import { NodeManager } from "../../raw_modules/nodes-module/src";
import { NodeData, ContextItem, NodeExecutionResult } from "../../raw_modules/nodes-module/src";
import { useAppStore } from "../lib/store";
import { useNavigate, useParams } from 'react-router-dom';

interface EnhancedNodeData extends NodeData {
  templateId?: string;
}

interface NodeManagerHook {
  // Node data
  nodeManager: NodeManager;
  currentNode: EnhancedNodeData | null;
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
    templateId?: string;
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

  // Używamy EnhancedNodeData zamiast NodeData dla currentNode
  const [currentNode, setCurrentNode] = useState<EnhancedNodeData | null>(null);

  // Set the selected workspace and scenario based on URL params
  useEffect(() => {
    if (workspaceId) {
      selectWorkspace(workspaceId);
    }
    if (scenarioId) {
      selectScenario(scenarioId);
    }
  }, [workspaceId, scenarioId, selectWorkspace, selectScenario]);

  // Calculate current scenario and workspace
  const currentWorkspace = useMemo(() => {
    return workspaces.find(w => w.id === workspaceId);
  }, [workspaces, workspaceId]);

  const currentScenario = useMemo(() => {
    return currentWorkspace?.scenarios.find(s => s.id === scenarioId);
  }, [currentWorkspace, scenarioId]);

  const nodeManager = useMemo(() => {
    return new NodeManager(currentScenario?.nodes || []);
  }, [currentScenario?.nodes]);

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
        // Get the current node from scenario nodes
        const currentNodeId = scenarioNodes[currentNodeIndex].id;
        
        // Prepare the node for display
        const preparedNode = nodeManager.prepareNodeForDisplay(
          currentNodeId,
          contextItems
        );

        // Get the templateId directly from the scenario definition
        const currentTemplateId = (currentScenario.nodes[currentNodeIndex] as any).templateId || 
                               currentWorkspace?.templateSettings?.defaultFlowStepTemplate || 
                               'basic-step';

        // Używamy spread operatora aby zachować właściwości i dodać templateId
        if (preparedNode) {
          // Tworzymy obiekt EnhancedNodeData
          const enhancedNode: EnhancedNodeData = {
            ...preparedNode,
            templateId: currentTemplateId
          };
          
          setCurrentNode(enhancedNode);
        }
      }
    }
  }, [currentScenario, currentNodeIndex, contextItems, nodeManager, currentWorkspace]);

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
    contextItems,
    templateId: currentNode?.templateId
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