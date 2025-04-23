// src/tpl/default/flowSteps/index.ts
import { lazy } from 'react';

// Używamy importu dynamicznego z Vite dla komponentów kroków przepływu
export const BasicStepTemplate = lazy(() => import('./BasicStepTemplate'));
export const FormInputTemplate = lazy(() => import('./FormInputTemplate'));
export const LlmQueryTemplate = lazy(() => import('./LlmQueryTemplate'));

// Eksportujemy mapę nazw komponentów do ich importów
export const flowStepComponents = {
  'basic-step': BasicStepTemplate,
  'form-step': FormInputTemplate,
  'llm-query': LlmQueryTemplate,
};