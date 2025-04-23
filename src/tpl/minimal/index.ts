// src/tpl/minimal/index.ts
import { flowStepComponents } from './flowSteps';
import { layoutComponents } from './layouts';

// Eksportujemy wszystkie komponenty z podfolderów
export {
  // Re-eksportujemy komponenty bezpośrednio
  flowStepComponents,
  layoutComponents,
};

// Minimal template nie ma własnych widgetów - używa tych z default

// Eksportujemy nazwę szablonu
export const templateName = 'minimal';