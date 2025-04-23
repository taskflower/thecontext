// src/tpl/minimal/flowSteps/index.ts
import { lazy } from 'react';

// Używamy importu dynamicznego z Vite dla komponentów kroków przepływu
export const FormStepTemplate = lazy(() => import('./FormStepTemplate'));
export const LlmStepTemplate = lazy(() => import('./LlmStepTemplate'));
export const SummaryStepTemplate = lazy(() => import('./SummaryStepTemplate'));

// Eksportujemy mapę nazw komponentów do ich importów
export const flowStepComponents = {
  'form-step-minimal': FormStepTemplate,
  'llm-step': LlmStepTemplate,
  'summary-step': SummaryStepTemplate,
};