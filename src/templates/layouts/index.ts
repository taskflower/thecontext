// src/templates/layouts/index.ts
import { lazy } from 'react';
import { LayoutTemplate } from 'template-registry-module';

// Eksport komponentów layoutów dla łatwiejszego importu
export const DefaultLayout = lazy(() => import('./DefaultLayout'));
export const SidebarLayout = lazy(() => import('./SidebarLayout'));

// Mapowanie layoutów gotowe do rejestracji
export const layouts: LayoutTemplate[] = [
  {
    id: 'default',
    name: 'Default Layout',
    component: DefaultLayout
  },
  {
    id: 'sidebar',
    name: 'Sidebar Layout',
    component: SidebarLayout
  }
];

// To teraz przeniesione do src/lib/templates.ts