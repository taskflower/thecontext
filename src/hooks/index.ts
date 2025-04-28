// src/hooks/index.ts - Zunifikowany plik indeksu dla wszystkich hookoków

// Autoryzacja
export { useAuth, AuthProvider } from './useAuth';


// Nawigacja
export { useNavigation } from './useNavigation';

// Loader komponentów
export { useComponentLoader } from './useComponentLoader';

// Flow Step
export { useFlowStep } from './useFlowStep';

// IndexedDB (zachowany, bo ma specyficzne zastosowanie)
export { useIndexedDB, type StoredItem } from './useIndexedDB';