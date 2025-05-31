// src/modules/simpleSchemaEditor/index.tsx
import { lazy } from 'react';

export const SimpleSchemaEditorModule = lazy(() => import('./SimpleSchemaEditor'));
export { default as SimpleSchemaEditor } from './SimpleSchemaEditor';
export { EditableSchemaField } from './components/EditableSchemaField';
export { AddSchemaForm } from './components/AddSchemaForm';

// Export types
export type { ContextSchema, Schema, SchemaField } from './types';