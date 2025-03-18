// src/modules/flowPlayer/index.ts
// Central export point for the FlowPlayer module

// Export components
export { FlowPlayer } from './components/FlowPlayer';
export { UserMessageProcessor } from './components/MessageProcessors/UserMessageProcessor';
export { AssistantMessageProcessor } from './components/MessageProcessors/AssistantMessageProcessor';
export { FlowControls } from './components/Controls/FlowControls';

// Export hooks
export { useFlowPlayer } from './hooks/useFlowPlayer';

// Export types
export * from './types';