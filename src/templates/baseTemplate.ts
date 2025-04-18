// src/templates/baseTemplate.ts
import { TemplateSettings } from '@/views/types';
import { ReactNode } from 'react';

/**
 * Interface for layout component props
 */
export interface LayoutProps {
  children: ReactNode;
  title?: string;
}

/**
 * Interface for layout template
 */
export interface LayoutTemplate {
  id: string;
  name: string;
  component: React.ComponentType<any>;
}

/**
 * Interface for widget component
 */
export interface WidgetTemplate {
  id: string;
  name: string;
  category: string;
  component: React.ComponentType<any>;
}

/**
 * Interface for flow step component props
 */
export interface FlowStepProps {
  node: any;
  onSubmit: (data: any) => void;
  onPrevious: () => void;
  isLastNode?: boolean;
}

/**
 * Interface for flow step template
 */
export interface FlowStepTemplate {
  id: string;
  name: string;
  compatibleNodeTypes: string[];
  component: React.ComponentType<any>;
}

/**
 * Interface for scenario step
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
 * Interface for scenario
 */
export interface Scenario {
  id: string;
  name: string;
  description: string;
  systemMessage?: string;
  getSteps: () => ScenarioStep[];
}

/**
 * Interface for workspace
 */


export interface Workspace {
  id: string;
  name: string;
  description?: string;
  scenarios: Scenario[];
  templateSettings: TemplateSettings;
  initialContext: Record<string, any>;
  getScenarios: () => Scenario[];
  getInitialContext: () => Record<string, any>;
}

/**
 * Interface for template
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