// src/_modules/scenarioGenerator/utils/scenarioUtils.ts
import { v4 as uuidv4 } from 'uuid';
import { EnhancedScenario, StepData, ValidationResult } from '../types';

/**
 * Generates a unique ID based on a name
 */
export function generateScenarioId(name: string): string {
  return `${name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')}-${uuidv4().substring(0, 8)}`;
}

/**
 * Generates a unique ID for a step
 */
export function generateStepId(label?: string): string {
  const prefix = label 
    ? label.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '').substring(0, 10) 
    : 'step';
  return `${prefix}-${uuidv4().substring(0, 8)}`;
}

/**
 * Validates a scenario before saving
 */
export function validateScenario(scenario: EnhancedScenario): ValidationResult {
  const errors: string[] = [];
  
  // Basic validation
  if (!scenario.id) errors.push("Scenario ID is required");
  if (!scenario.name) errors.push("Scenario name is required");
  
  // Steps validation
  if (!scenario.steps || scenario.steps.length === 0) {
    errors.push("At least one step is required");
  } else {
    // Check each step
    scenario.steps.forEach((step, index) => {
      if (!step.id) errors.push(`Step ${index + 1}: ID is required`);
      if (!step.label) errors.push(`Step ${index + 1}: Label is required`);
      if (!step.tplFile) errors.push(`Step ${index + 1}: Template type is required`);
      
      // Validate by step type
      if (step.tplFile === 'formStep' && !step.attrs?.schemaPath) {
        errors.push(`Step ${index + 1}: Form steps require a schema path`);
      }
      
      if (step.tplFile === 'llmStep' && step.attrs?.autoStart && !step.attrs?.initialUserMessage) {
        errors.push(`Step ${index + 1}: Auto-start LLM steps require an initial message`);
      }
      
      if (step.tplFile === 'widgetsStep' && (!step.attrs?.widgets || step.attrs.widgets.length === 0)) {
        errors.push(`Step ${index + 1}: Widget steps require at least one widget`);
      }
    });
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Generates TypeScript implementation code for a scenario
 */
export function generateScenarioImplementation(scenario: EnhancedScenario): string {
  const steps = scenario.steps.map(step => {
    return `
export const ${step.id.replace(/-/g, '_')}: NodeData = {
  id: "${step.id}",
  scenarioId: "${scenario.id}",
  label: "${step.label}",
  ${step.assistantMessage ? `assistantMessage: "${step.assistantMessage}",` : ''}
  ${step.contextPath ? `contextPath: "${step.contextPath}",` : ''}
  tplFile: "${step.tplFile}",
  order: ${step.order},
  attrs: ${JSON.stringify(step.attrs || {}, null, 2)}
};`;
  }).join('\n\n');

  const scenarioDefinition = `
export const ${scenario.id.replace(/-/g, '_')}Scenario: Scenario = {
  id: "${scenario.id}",
  name: "${scenario.name}",
  description: "${scenario.description}",
  ${scenario.icon ? `icon: "${scenario.icon}",` : ''}
  ${scenario.systemMessage ? `systemMessage: "${scenario.systemMessage}",` : ''}
  nodes: [
    ${scenario.steps.map(step => step.id.replace(/-/g, '_')).join(',\n    ')}
  ]
};

export default ${scenario.id.replace(/-/g, '_')}Scenario;
`;

  const imports = `
// src/scenarios/${scenario.id}/index.ts
import { Scenario, NodeData } from '@/types';
`;

  return imports + steps + scenarioDefinition;
}

/**
 * Generates code for initial context with form schemas
 */
export function generateInitialContextCode(scenario: EnhancedScenario): string {
  // Collect all schemas from steps
  const schemas: Record<string, any> = {};
  
  scenario.steps.forEach(step => {
    if (step.tplFile === 'formStep' && step.attrs?.schemaPath) {
      const schemaPath = step.attrs.schemaPath.split('.');
      if (schemaPath.length > 1) {
        const schemaKey = schemaPath[schemaPath.length - 1];
        schemas[schemaKey] = [
          { name: 'example', label: 'Example Field', type: 'text', required: true }
        ];
      }
    }
  });
  
  // Create context structure
  const initialContext = {
    schemas: schemas,
    // Other default context values
  };
  
  return `
// src/scenarios/${scenario.id}/initialContext.ts
export const initialContext = ${JSON.stringify(initialContext, null, 2)};

export default initialContext;
`;
}

/**
 * Creates a step with default values based on type
 */
export function createDefaultStep(type: StepData['tplFile'], order: number, prevStep?: StepData): StepData {
  const stepId = generateStepId();
  const step: StepData = {
    id: stepId,
    label: `Step ${order + 1}`,
    tplFile: type,
    contextPath: `${stepId}-data`,
    order: order,
    attrs: {}
  };
  
  // Set type-specific defaults
  switch (type) {
    case 'formStep':
      step.attrs = {
        schemaPath: `schemas.${stepId}`
      };
      break;
      
    case 'llmStep':
      step.attrs = {
        autoStart: true,
        initialUserMessage: prevStep?.contextPath 
          ? `Based on the data {{${prevStep.contextPath}}}, please analyze and provide insights in JSON format.`
          : 'Please analyze the provided data and return insights as JSON.'
      };
      break;
      
    case 'widgetsStep':
      step.attrs = {
        widgets: [
          { 
            tplFile: 'title', 
            title: 'Results' 
          },
          { 
            tplFile: 'info', 
            title: 'Analysis', 
            dataPath: prevStep?.contextPath || 'results.data' 
          }
        ]
      };
      break;
  }
  
  return step;
}

/**
 * Updates step order after rearrangement
 */
export function reorderSteps(steps: StepData[]): StepData[] {
  return steps.map((step, index) => ({
    ...step,
    order: index,
    label: step.label.includes(':') 
      ? `Step ${index + 1}: ${step.label.split(':').slice(1).join(':').trim()}`
      : `Step ${index + 1}`
  }));
}