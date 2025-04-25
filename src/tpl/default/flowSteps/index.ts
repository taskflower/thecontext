// src/tpl/default/flowSteps/index.ts
import { lazy } from 'react';

// Use dynamic import with Vite for flow step components
export const FormStepTemplate = lazy(() => import('./FormStepTemplate'));
export const LlmStepTemplate = lazy(() => import('./LlmStepTemplate'));
export const WidgetsStepTemplate = lazy(() => import('./WidgetsStepTemplate'));

// Export map of component names to their imports
export const flowStepComponents = {
  'form-step': FormStepTemplate,
  'form-step-minimal': FormStepTemplate, // Alias for backward compatibility
  'llm-step': LlmStepTemplate,
  'llm-step-minimal': LlmStepTemplate, // Alias for backward compatibility
  'widgets-step': WidgetsStepTemplate,
  'widgets-step-minimal': WidgetsStepTemplate, // Alias for backward compatibility
};