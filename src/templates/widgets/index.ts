// src/templates/widgets/index.ts
import { lazy } from 'react';
import { WidgetTemplate, WidgetCategory } from 'template-registry-module';

// Eksport komponentów widgetów dla łatwiejszego importu
export const CardListWidget = lazy(() => import('./CardListWidget'));
export const TableListWidget = lazy(() => import('./TableListWidget'));

// Mapowanie widgetów gotowe do rejestracji
export const widgets: WidgetTemplate[] = [
  {
    id: 'card-list',
    name: 'Card List',
    category: 'scenario' as WidgetCategory,
    component: CardListWidget
  },
  {
    id: 'table-list',
    name: 'Table List',
    category: 'scenario' as WidgetCategory,
    component: TableListWidget
  }
];

// To teraz przeniesione do src/lib/templates.ts