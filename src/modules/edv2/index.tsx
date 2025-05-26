// src/modules/edv2/index.tsx

// Updated exports for refactored structure
export { default as EditorV2 } from './EditorV2';
export { default as EditorControlV2 } from './EditorControl';

// Workspace components
export { default as WorkspaceEditor } from './workspace/WorkspaceEditor';
export { WidgetEditor } from './workspace/WidgetEditor';

// Scenario components  
export { default as ScenarioEditor } from './scenario/ScenarioEditor';
export { NodesEditor } from './scenario/NodesEditor';
export { FlowEditor } from './scenario/FlowEditor';

// Shared components
export { SchemaEditor } from './shared/SchemaEditor';
export { Breadcrumbs } from './shared/Breadcrumbs';
export { AIGeneratorSection } from './shared/AIGeneratorSection';
export { ItemList } from './shared/ItemList';

// Shared utilities and hooks
export { useAIGenerator } from './shared/useAIGenerator';
export { parsePath, createDefaultNode, createDefaultWidget, createDefaultSchema } from './shared/editorUtils';
export { AI_CONFIGS, TEMPLATES, WIDGET_TYPES } from './shared/editorConfigs';