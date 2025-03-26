// Eksportujemy wszystkie komponenty i funkcje z modułu flowCanvas

// Adaptery
export { adaptNodeToReactFlow, adaptEdgeToReactFlow } from './adapters';

// Komponenty węzłów
export { default as CustomNode } from './nodes/CustomNode';

// Handlery
export { useFlowHandlers } from './handlers';

// Stałe i konfiguracja
export const GRID_SIZE = 20;
export const DEFAULT_MAX_ZOOM = 1.25;

// Typy do eksportu
export * from './types';

// Eksport konfiguracji węzłów
import { NodeTypes } from 'reactflow';
import CustomNode from './nodes/CustomNode';

export const nodeTypes: NodeTypes = { 
  custom: CustomNode 
};