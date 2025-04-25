// src/tpl/minimal/widgets/index.ts
import { lazy } from 'react';

// Używamy importu dynamicznego z Vite dla komponentów widgetów
export const CardListWidget = lazy(() => import('./CardListWidget'));
export const DataDisplayWidget = lazy(() => import('./DataDisplayWidget'));
export const MetricsWidget = lazy(() => import('./MetricsWidget'));
export const StatsWidget = lazy(() => import('./StatsWidget'));
export const InfoWidget = lazy(() => import('./InfoWidget'));

// Eksportujemy mapę nazw komponentów do ich importów
export const widgetComponents = {
  'card-list': CardListWidget,
  'data-display': DataDisplayWidget,
  'info': InfoWidget,
  'metrics': MetricsWidget,
  'stats': StatsWidget,
};

// Eksportujemy także typy z types.ts
export type {
  CardItem,
  StatItem,
  MetricItem,
  StatsWidgetProps,
  InfoWidgetProps,
  DataDisplayWidgetProps,
  CardListWidgetProps,
  MetricsWidgetProps
} from '../types';