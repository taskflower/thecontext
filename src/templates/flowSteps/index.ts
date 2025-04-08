// src/templates/flowSteps/index.ts
import { lazy } from 'react';


// Definiujemy kroki przepływu z lazy loading
export const flowSteps = {
  'basic-step': {
    id: 'basic-step',
    name: 'Basic Step',
    compatibleNodeTypes: ['default', 'input'],
    component: lazy(() => import('./BasicStepTemplate'))
  },
  'llm-query': {
    id: 'llm-query',
    name: 'LLM Query',
    compatibleNodeTypes: ['llm'],
    component: lazy(() => import('./LlmQueryTemplate'))
  },
  'form-step': {
    id: 'form-step',
    name: 'Form Input',
    compatibleNodeTypes: ['form'],
    component: lazy(() => import('./FormInputTemplate'))
  }
};

// Eksportuj typy (opcjonalnie)
export type FlowStepType = keyof typeof flowSteps;

// Funkcja pomocnicza do pobrania komponentu kroku przepływu
export function getFlowStepComponent(id: string) {
  return flowSteps[id as FlowStepType]?.component || flowSteps['basic-step'].component;
}

// Funkcja do znalezienia komponentu na podstawie typu węzła
export function getFlowStepForNodeType(nodeType: string) {
  return Object.values(flowSteps).find(
    step => step.compatibleNodeTypes.includes(nodeType)
  ) || flowSteps['basic-step'];
}