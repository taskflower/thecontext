// src/tpl/minimal/index.ts
import { flowStepComponents } from './flowSteps';
import { layoutComponents } from './layouts';
import { widgetComponents } from './widgets';

// Eksportujemy wszystkie komponenty z podfolderów
export {
  // Re-eksportujemy komponenty bezpośrednio
  flowStepComponents,
  layoutComponents,
  widgetComponents,
};

// Eksportujemy nazwę szablonu
export const templateName = 'minimal';