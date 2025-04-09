// src/utils/nodeTransformers.ts
// Transformacje węzłów

import { NodeData } from '../types/NodeTypes';

/**
 * Konwertuje dane węzła do formatu kompatybilnego z React Flow
 */
export function nodeToReactFlowNode(nodeData: NodeData): any {
  return {
    id: nodeData.id,
    type: nodeData.type || 'default',
    position: nodeData.position || { x: 0, y: 0 },
    data: {
      label: nodeData.label,
      description: nodeData.description,
      assistantMessage: nodeData.assistantMessage,
      contextKey: nodeData.contextKey,
      contextJsonPath: nodeData.contextJsonPath,
      pluginKey: nodeData.pluginKey,
      pluginData: nodeData.pluginData,
      scenarioId: nodeData.scenarioId,
      templateId: nodeData.templateId,
      formFields: nodeData.formFields,
      includeSystemMessage: nodeData.includeSystemMessage
    }
  };
}

/**
 * Konwertuje węzeł React Flow z powrotem do formatu NodeData
 */
export function reactFlowNodeToNode(rfNode: any): NodeData {
  return {
    id: rfNode.id,
    scenarioId: rfNode.data.scenarioId,
    type: rfNode.type === 'default' ? 'node' : rfNode.type,
    label: rfNode.data.label,
    description: rfNode.data.description,
    position: rfNode.position,
    assistantMessage: rfNode.data.assistantMessage,
    userPrompt: rfNode.data.userPrompt,
    contextKey: rfNode.data.contextKey,
    contextJsonPath: rfNode.data.contextJsonPath,
    pluginKey: rfNode.data.pluginKey,
    pluginData: rfNode.data.pluginData,
    templateId: rfNode.data.templateId,
    formFields: rfNode.data.formFields,
    includeSystemMessage: rfNode.data.includeSystemMessage
  };
}