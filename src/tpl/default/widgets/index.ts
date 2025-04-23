// src/tpl/default/widgets/index.ts
import { lazy } from 'react';

// Używamy importu dynamicznego z Vite dla komponentów widgetów
export const CardListWidget = lazy(() => import('./CardListWidget'));
export const ContextDisplayWidget = lazy(() => import('./ContextDisplayWidget'));

// Eksportujemy mapę nazw komponentów do ich importów
export const widgetComponents = {
  'card-list': CardListWidget,
  'context-display': ContextDisplayWidget,
};