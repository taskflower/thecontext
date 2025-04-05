/**
 * Types for the hook points system
 */
import React from 'react';

// Hook point component props
export interface HookPointProps {
  name: string;
  defaultComponent?: React.ReactNode;
  props?: Record<string, any>;
}

// Hook point registration
export interface HookPointRegistration {
  name: string;
  component: React.ComponentType<any>;
  priority: number;
  position: 'before' | 'after' | 'replace';
  pluginId: string;
}

// Available hook points in the application
export enum HookPointName {
  // Layout hook points
  HEADER_BEFORE = 'header:before',
  HEADER_AFTER = 'header:after',
  HEADER_REPLACE = 'header:replace',
  NAVIGATION_BEFORE = 'navigation:before',
  NAVIGATION_AFTER = 'navigation:after',
  NAVIGATION_REPLACE = 'navigation:replace',
  FOOTER_BEFORE = 'footer:before',
  FOOTER_AFTER = 'footer:after',
  FOOTER_REPLACE = 'footer:replace',
  
  // Step hook points
  ASSISTANT_MESSAGE_BEFORE = 'assistantMessage:before',
  ASSISTANT_MESSAGE_AFTER = 'assistantMessage:after',
  ASSISTANT_MESSAGE_REPLACE = 'assistantMessage:replace',
  USER_INPUT_BEFORE = 'userInput:before',
  USER_INPUT_AFTER = 'userInput:after', 
  USER_INPUT_REPLACE = 'userInput:replace',
  
  // Panel hook points
  LEFT_PANEL_TOP = 'leftPanel:top',
  LEFT_PANEL_BOTTOM = 'leftPanel:bottom',
  RIGHT_PANEL_TOP = 'rightPanel:top',
  RIGHT_PANEL_BOTTOM = 'rightPanel:bottom',
  BOTTOM_PANEL_LEFT = 'bottomPanel:left',
  BOTTOM_PANEL_RIGHT = 'bottomPanel:right',
}

// Hook point context
export interface HookPointContextValue {
  hookPoints: Record<string, HookPointRegistration[]>;
  registerHookPoint: (registration: HookPointRegistration) => void;
  unregisterHookPoint: (name: string, pluginId: string) => void;
  getHookPointComponents: (name: string) => HookPointRegistration[];
}