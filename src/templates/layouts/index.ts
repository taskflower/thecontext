// src/templates/layouts/index.ts
import { lazy } from 'react';


// Definiujemy layouty z lazy loading
export const layouts = {
  default: {
    id: 'default',
    name: 'Default Layout',
    component: lazy(() => import('./DefaultLayout'))
  },
  sidebar: {
    id: 'sidebar',
    name: 'Sidebar Layout',
    component: lazy(() => import('./SidebarLayout'))
  }
};

// Eksportuj typy (opcjonalnie)
export type LayoutType = keyof typeof layouts;

// Funkcja pomocnicza do pobrania komponentu układu
export function getLayoutComponent(id: string) {
  return layouts[id as LayoutType]?.component || layouts.default.component;
}