// src/modules/appTree/index.tsx - Entry point for lazy loading
import { lazy } from 'react';

export const AppTreeModule = lazy(() => import('./AppTreeCard'));

