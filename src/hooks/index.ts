// src/hooks/index.ts

export { useAuth, AuthProvider } from './useAuth';
export { useFlow } from './useFlow';
export { useComponents } from './useComponents';
export { useWidgets } from './useWidgets';
export { useIndexedDB, type StoredItem } from './useIndexedDB';

// Re-eksportuj stare hooki dla zachowania kompatybilności wstecznej
// Uwaga: docelowo wszystkie komponenty powinny używać nowych hooków
export { useFlow as useNavigation } from './useFlow';
export { useFlow as useFlowStep } from './useFlow';
export { useComponents as useComponentLoader } from './useComponents';