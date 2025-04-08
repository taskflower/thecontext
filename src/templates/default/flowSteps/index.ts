// src/templates/flowSteps/index.ts
import { lazy } from 'react';
import { FlowStepTemplate } from 'template-registry-module';

// Eksport komponentów kroków przepływu dla łatwiejszego importu
export const BasicStepTemplate = lazy(() => import('./BasicStepTemplate'));
export const LlmQueryTemplate = lazy(() => import('./LlmQueryTemplate'));
export const FormInputTemplate = lazy(() => import('./FormInputTemplate'));

// Mapowanie kroków przepływu gotowe do rejestracji
export const flowSteps: FlowStepTemplate[] = [
  {
    id: 'basic-step',
    name: 'Basic Step',
    compatibleNodeTypes: ['default', 'input'],
    component: BasicStepTemplate
  },
  {
    id: 'llm-query',
    name: 'LLM Query',
    compatibleNodeTypes: ['llm'],
    component: LlmQueryTemplate
  },
  {
    id: 'form-step',
    name: 'Form Input',
    compatibleNodeTypes: ['form'],
    component: FormInputTemplate
  }
];

// To teraz przeniesione do src/lib/templates.ts