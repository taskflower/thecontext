// src/templates/widgets/index.ts
import { lazy } from 'react';
import type {  WidgetCategory } from '../../lib/templateRegistry';

// Definiujemy widgety z lazy loading
export const widgets = {
  'card-list': {
    id: 'card-list',
    name: 'Card List',
    category: 'scenario' as WidgetCategory,
    component: lazy(() => import('./CardListWidget'))
  },
  'table-list': {
    id: 'table-list',
    name: 'Table List',
    category: 'scenario' as WidgetCategory,
    component: lazy(() => import('./TableListWidget'))
  }
};

// Eksportuj typy (opcjonalnie)
export type WidgetType = keyof typeof widgets;

// Funkcja pomocnicza do pobrania komponentu widgetu
export function getWidgetComponent(id: string) {
  return widgets[id as WidgetType]?.component || widgets['card-list'].component;
}

// Funkcja do filtrowania według kategorii
export function getWidgetsByCategory(category: WidgetCategory) {
  return Object.values(widgets).filter(widget => widget.category === category);
}