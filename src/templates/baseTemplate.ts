// src/templates/baseTemplate.ts
import { ReactNode } from 'react';

/**
 * Interfejs dla komponentu layoutu
 */
export interface LayoutTemplate {
  id: string;
  name: string;
  component: React.ComponentType<any>;
}

/**
 * Interfejs dla komponentu widgetu
 */
export interface WidgetTemplate {
  id: string;
  name: string;
  category: string;
  component: React.ComponentType<any>;
}

/**
 * Interfejs dla komponentu kroku przepływu
 */
export interface FlowStepTemplate {
  id: string;
  name: string;
  compatibleNodeTypes: string[];
  component: React.ComponentType<any>;
}

/**
 * Interfejs kroku scenariusza
 */
export interface ScenarioStep {
  id: string;
  scenarioId: string;
  label: string;
  assistantMessage?: string;
  contextPath?: string;
  templateId: string;
  type?: string;
  attrs?: Record<string, any>;
  initialUserMessage?: string;
  includeSystemMessage?: boolean;
}

/**
 * Interfejs scenariusza
 */
export interface Scenario {
  id: string;
  name: string;
  description: string;
  systemMessage?: string;
  getSteps: () => ScenarioStep[];
}

/**
 * Interfejs workspace'a
 */
export interface Workspace {
  id: string;
  name: string;
  description?: string;
  templateSettings: {
    layoutTemplate: string;
    scenarioWidgetTemplate: string;
    defaultFlowStepTemplate: string;
    theme?: 'light' | 'dark' | 'system';
  };
  getScenarios: () => Scenario[];
  getInitialContext: () => Record<string, any>;
}

/**
 * Interfejs szablonu
 */
export interface Template {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  getLayouts: () => LayoutTemplate[];
  getWidgets: () => WidgetTemplate[];
  getFlowSteps: () => FlowStepTemplate[];
  getWorkspaces: () => Workspace[];
}