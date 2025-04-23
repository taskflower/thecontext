// src/tpl/default/layouts/index.ts
import { lazy } from 'react';

// Używamy importu dynamicznego z Vite dla komponentów layoutów
export const DefaultLayout = lazy(() => import('./DefaultLayout'));
export const SidebarLayout = lazy(() => import('./SidebarLayout'));

// Eksportujemy mapę nazw komponentów do ich importów
export const layoutComponents = {
  'default': DefaultLayout,
  'sidebar': SidebarLayout,
};