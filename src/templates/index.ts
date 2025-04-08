// src/templates/index.ts
// Główny plik eksportujący wszystkie typy szablonów

// Importy układów
export * from './layouts';

// Importy widgetów
export * from './widgets';

// Importy kroków przepływu
export * from './flowSteps';

// Eksportowanie typów wspólnych (jeśli są potrzebne)
export interface CommonTemplateProps {
  // Wspólne właściwości szablonów, jeśli takie są
}