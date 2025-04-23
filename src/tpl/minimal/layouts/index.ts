// src/tpl/minimal/layouts/index.ts
import { lazy } from 'react';

// Używamy importu dynamicznego z Vite dla komponentów layoutów
export const SimpleLayout = lazy(() => import('./SimpleLayout'));

// Eksportujemy mapę nazw komponentów do ich importów
export const layoutComponents = {
  'simple': SimpleLayout,
};