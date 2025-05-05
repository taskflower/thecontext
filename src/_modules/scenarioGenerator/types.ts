// src/_modules/scenarioGenerator/types.ts
export interface ScenarioTemplate {
    id: string;
    name: string;
    description: string;
    icon?: string;
    systemMessage?: string;
  }
  
  export interface StepData {
    id: string;
    label: string;
    assistantMessage?: string;
    contextPath?: string;
    tplFile: 'formStep' | 'llmStep' | 'widgetsStep';
    order: number;
    attrs?: {
      schemaPath?: string;
      autoStart?: boolean;
      initialUserMessage?: string;
      widgets?: any[];
      [key: string]: any;
    };
  }
  
  export interface EnhancedScenario extends ScenarioTemplate {
    steps: StepData[];
  }
  
  export interface FormField {
    name: string;
    label: string;
    type: 'text' | 'number' | 'textarea' | 'select' | 'checkbox' | 'date';
    required?: boolean;
    placeholder?: string;
    options?: Array<{ value: string; label: string }>;
    defaultValue?: any;
  }
  
  export interface LlmService {
    generateCompletion: (prompt: string) => Promise<string>;
  }
  
  export interface ValidationResult {
    valid: boolean;
    errors: string[];
  }