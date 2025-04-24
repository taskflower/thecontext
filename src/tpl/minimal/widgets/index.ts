// src/tpl/minimal/widgets/index.ts
import { lazy } from 'react';

// Używamy importu dynamicznego z Vite dla komponentów widgetów
export const CardListWidget = lazy(() => import('./CardListWidget'));
export const DataDisplayWidget = lazy(() => import('./DataDisplayWidget'));
export const InfoWidget = lazy(() => import('./InfoWidget'));
export const MetricsWidget = lazy(() => import('./MetricsWidget'));
export const StatsWidget = lazy(() => import('./StatsWidget'));

// Eksportujemy mapę nazw komponentów do ich importów
export const widgetComponents = {
  'card-list': CardListWidget,
  'data-display': DataDisplayWidget,
  'info': InfoWidget,
  'metrics': MetricsWidget,
  'stats': StatsWidget,
};