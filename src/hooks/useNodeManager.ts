// src/hooks/useNodeManager.ts
import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from "../lib/store";
import { contextManager } from "./useContextManager";

// Import from the new module structure
import { NodeManager } from "../../raw_modules/revertcontext-nodes-module/src/core/NodeManager";
import { DefaultContextService } from "../../raw_modules/revertcontext-nodes-module/src/services/DefaultContextService";
import { DefaultPluginService } from "../../raw_modules/revertcontext-nodes-module/src/services/PluginService";
import { NodeData } from "../../raw_modules/revertcontext-nodes-module/src/types/NodeTypes";

interface Scenario {
  id: string;
  name: string;
  description: string;
  nodes: NodeData[];
  systemMessage?: string;
}

interface NodeManagerHook {
  nodeManager: NodeManager;
  currentNode: NodeData | null;
  currentScenario: Scenario | null;
  isLastNode: boolean;
  contextItems: Record<string, any>;
  handleGoToScenariosList: () => void;
  handlePreviousNode: () => void;
  handleNodeExecution: (userInput: string) => void;
  updateScenarioSystemMessage: (systemMessage: string) => void;
  toggleNodeSystemMessage: (includeSystemMessage: boolean) => void;
  debugInfo: Record<string, any>;
}

/**
 * Hook for managing nodes using the NodeManager module
 */
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
    setNodeIndex,
    updateScenarioSystemMessage: updateSystemMessage,
    updateNodeIncludeSystemMessage
  } = useAppStore();
  
  // Use context directly from ContextManager
  const [currentContext, setCurrentContext] = useState<Record<string, any>>(
    contextManager.getContext()
  );
  
  const [currentNode, setCurrentNode] = useState<NodeData | null>(null);

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
    return currentWorkspace?.scenarios.find(s => s.id === scenarioId) || null;
  }, [currentWorkspace, scenarioId]);

  // Create a context service for the node manager
  const contextService = useMemo(() => {
    return new DefaultContextService(contextManager);
  }, []);

  // Create a plugin service for the node manager
  const pluginService = useMemo(() => {
    return new DefaultPluginService();
  }, []);

  // Create the node manager with initial nodes and services
  const nodeManager = useMemo(() => {
    if (!currentScenario) return new NodeManager(contextService, [], pluginService);
    return new NodeManager(contextService, currentScenario.nodes, pluginService);
  }, [currentScenario, contextService, pluginService]);

  // Check if we're on the last node
  const isLastNode = currentScenario 
    ? currentNodeIndex === currentScenario.nodes.length - 1 
    : false;

  // Handle specific node navigation if node param is present
  useEffect(() => {
    if (nodeParam && currentScenario) {
      const nodeIndex = currentScenario.nodes.findIndex((n: NodeData) => n.id === nodeParam);
      if (nodeIndex !== -1) {
        setNodeIndex(nodeIndex);
      }
    }
  }, [nodeParam, currentScenario, setNodeIndex]);

  // Update context state when ContextManager changes
  useEffect(() => {
    const newContext = contextManager.getContext();
    setCurrentContext(newContext);
  }, [currentNode]); // Update when the node changes

  // Update current node when scenario or node index changes
  useEffect(() => {
    if (currentScenario && currentNodeIndex !== undefined) {
      const nodes = currentScenario.nodes;

      if (nodes.length > 0 && currentNodeIndex < nodes.length) {
        // Get the current node from scenario nodes
        const node = nodes[currentNodeIndex];
        
        // Prepare the node for display (process templates)
        const nodeData = nodeManager.prepareNodeForDisplay(node.id);
        
        if (nodeData) {
          setCurrentNode(nodeData);
        } else {
          setCurrentNode(node);
        }
      }
    }
  }, [currentScenario, currentNodeIndex, nodeManager]);

  // Handle node execution
  const handleNodeExecution = (userInput: string) => {
    if (currentNode && currentNode.id) {
      // Execute the node and get the result
      const result = nodeManager.executeNode(currentNode.id, userInput);
      
      // Update context if needed
      if (result && result.contextUpdated) {
        setCurrentContext(result.updatedContext);
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
  
  // System message handlers
  const updateScenarioSystemMessage = (systemMessage: string) => {
    if (workspaceId && scenarioId) {
      updateSystemMessage(workspaceId, scenarioId, systemMessage);
    }
  };
  
  // Toggle system message inclusion for current node
  const toggleNodeSystemMessage = (includeSystemMessage: boolean) => {
    if (workspaceId && scenarioId && currentNode?.id) {
      updateNodeIncludeSystemMessage(workspaceId, scenarioId, currentNode.id, includeSystemMessage);
    }
  };

  // Prepare debug info
  const debugInfo = {
    workspaceId,
    scenarioId,
    nodeId: currentNode?.id,
    currentNodeIndex,
    currentNodeLabel: currentNode?.label,
    context: currentContext,
    templateId: currentNode?.templateId,
    systemMessage: currentScenario?.systemMessage,
    includeSystemMessage: currentNode?.includeSystemMessage,
    initialUserMessage: currentNode?.initialUserMessage
  };

  return {
    nodeManager,
    currentNode,
    currentScenario,
    isLastNode,
    contextItems: currentContext,
    handleGoToScenariosList,
    handlePreviousNode,
    handleNodeExecution,
    updateScenarioSystemMessage,
    toggleNodeSystemMessage,
    debugInfo
  };
}