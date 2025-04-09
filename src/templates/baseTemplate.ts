// src/templates/baseTemplate.ts
import { LayoutTemplate, WidgetTemplate, FlowStepTemplate, WidgetCategory } from '../../raw_modules/template-registry-module/src';

/**
 * Base interface for all template configurations
 */
export interface BaseTemplateConfig {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  layouts: LayoutTemplate[];
  widgets: WidgetTemplate[];
  flowSteps: FlowStepTemplate[];
}

/**
 * Base interface for template settings that can be stored in a workspace
 */
export interface BaseTemplateSettings {
  layoutTemplate: string;
  scenarioWidgetTemplate: string;
  defaultFlowStepTemplate: string;
  showContextWidget?: boolean;
  theme?: 'light' | 'dark' | 'system';
  customStyles?: Record<string, string>;
}

// Interface for a scenario
export interface Scenario {
  id: string;
  name: string;
  description: string;
  nodes: any[];
  systemMessage?: string;
  edges?: any[];
}

/**
 * Base interface for workspace data with template settings
 */
export interface BaseWorkspaceData {
  id: string;
  name: string;
  description?: string;
  scenarios: Scenario[];
  templateSettings: BaseTemplateSettings;
  initialContext?: Record<string, any>;
}

/**
 * Base class for template registration
 */
export abstract class BaseTemplate {
  /**
   * The unique identifier for this template
   */
  abstract readonly id: string;
  
  /**
   * The human-readable name for this template
   */
  abstract readonly name: string;
  
  /**
   * A short description of the template
   */
  abstract readonly description: string;
  
  /**
   * The version of the template
   */
  abstract readonly version: string;
  
  /**
   * The author of the template
   */
  abstract readonly author: string;

  /**
   * Get the template configuration
   */
  abstract getConfig(): BaseTemplateConfig;
  
  /**
   * Get the default workspace data for this template
   */
  abstract getDefaultWorkspaceData(): BaseWorkspaceData;
}