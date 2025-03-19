// src/modules/flowPlayer/index.ts
// Central export point for the FlowPlayer module

// Export main components
export { FlowPlayer } from './components/FlowPlayer';
export { FlowControls } from './components/Controls/FlowControls';
export { AssistantMessageProcessor } from './components/MessageProcessors/AssistantMessageProcessor';
export { UserMessageProcessor } from './components/MessageProcessors/UserMessageProcessor';

// Export context provider and hook
export { FlowProvider, useFlowPlayer } from './context/FlowContext';

// Export utility functions
export { calculateFlowPath } from './utils/flowUtils';

// Export types
export * from './types';