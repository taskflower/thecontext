// src/modules/editor/index.tsx - Entry point for lazy loading
import { lazy } from 'react';

export const EditorModule = lazy(() => import('./EditorPage'));

