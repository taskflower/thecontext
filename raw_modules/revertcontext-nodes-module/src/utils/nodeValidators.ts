// src/utils/nodeValidators.ts
import { NodeData } from '../types';

export class NodeValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NodeValidationError';
  }
}

export function validateNode(nodeData: NodeData): boolean {
  // Sprawdź wymagane pola
  if (!nodeData.scenarioId) {
    throw new NodeValidationError('Node must have a scenarioId');
  }
  
  if (!nodeData.label) {
    throw new NodeValidationError('Node must have a label');
  }
  
  // Walidacja pozycji
  if (nodeData.position) {
    if (typeof nodeData.position !== 'object' ||
        nodeData.position === null ||
        typeof nodeData.position.x !== 'number' ||
        typeof nodeData.position.y !== 'number') {
      throw new NodeValidationError('Node position must be an object with x and y coordinates');
    }
  }
  
  // Walidacja pluginData
  if (nodeData.pluginKey && !nodeData.pluginData) {
    throw new NodeValidationError('Node with pluginKey must have pluginData');
  }
  
  // Walidacja ścieżki kontekstu
  if (nodeData.contextJsonPath && !nodeData.contextKey) {
    throw new NodeValidationError('Node with contextJsonPath must have contextKey');
  }
  
  return true;
}