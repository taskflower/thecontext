// src/utils/nodeValidators.ts
// Walidacja węzłów

import { NodeData } from '../types/NodeTypes';

/**
 * Klasa błędów walidacji węzłów
 */
export class NodeValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NodeValidationError';
  }
}

/**
 * Waliduje dane węzła
 */
export function validateNode(nodeData: NodeData): boolean {
  // Sprawdzenie wymaganych pól
  if (!nodeData.scenarioId) {
    throw new NodeValidationError('Węzeł musi mieć przypisany scenarioId');
  }
  
  if (!nodeData.label) {
    throw new NodeValidationError('Węzeł musi mieć etykietę');
  }
  
  // Walidacja pozycji
  if (nodeData.position) {
    if (typeof nodeData.position !== 'object' ||
        nodeData.position === null ||
        typeof nodeData.position.x !== 'number' ||
        typeof nodeData.position.y !== 'number') {
      throw new NodeValidationError('Pozycja węzła musi być obiektem z współrzędnymi x i y');
    }
  }
  
  // Walidacja pluginData
  if (nodeData.pluginKey && !nodeData.pluginData) {
    throw new NodeValidationError('Węzeł z kluczem pluginu musi mieć dane pluginu');
  }
  
  // Walidacja ścieżki kontekstu
  if (nodeData.contextJsonPath && !nodeData.contextKey) {
    throw new NodeValidationError('Węzeł z contextJsonPath musi mieć contextKey');
  }
  
  return true;
}