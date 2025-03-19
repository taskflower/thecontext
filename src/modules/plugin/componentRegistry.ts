/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/plugin/componentRegistry.ts
import React from 'react';

export enum ComponentType {
  ASSISTANT_PROCESSOR = 'AssistantMessageProcessor',
  USER_PROCESSOR = 'UserMessageProcessor',
  FLOW_CONTROLS = 'FlowControls'
}

// Type definition for default component map
export type DefaultComponents = Record<ComponentType, React.ComponentType<any>>;

// For standalone usage outside the flow context
export interface ComponentRegistryValue {
  getComponent: (componentType: ComponentType) => React.ComponentType<any>;
}