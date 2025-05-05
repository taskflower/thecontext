// src/_modules/scenarioGenerator/services/scenarioGenerationService.ts
import { 
    EnhancedScenario, 
    LlmService, 
    StepData, 
    ScenarioTemplate 
  } from '../types';
  import { generateScenarioId, generateStepId } from '../utils/scenarioUtils';
  
  /**
   * Creates a prompt for LLM to generate a scenario based on description
   */
  export function createScenarioPrompt(
    description: string,
    templateScenario?: EnhancedScenario
  ): string {
    const basePrompt = `
  Create a detailed scenario structure based on the following description:
  "${description}"
  
  The scenario should include:
  1. A name and description
  2. A series of well-structured steps that logically progress through the scenario
  3. Appropriate step types (formStep, llmStep, widgetsStep) for each part of the flow
  
  Return a JSON object with the following structure:
  {
    "name": "Descriptive Scenario Name",
    "description": "Detailed explanation of what this scenario does",
    "icon": "folder-kanban|calculator|bar-chart|clipboard-list|presentation|file-check|users",
    "steps": [
      {
        "label": "Step 1: Name of first step",
        "tplFile": "formStep|llmStep|widgetsStep",
        "assistantMessage": "Message to show the user",
        "contextPath": "data-path-for-storing-results",
        "attrs": {
          // Attributes specific to step type:
          // For formStep: { "schemaPath": "path.to.form.schema" }
          // For llmStep: { "autoStart": true, "initialUserMessage": "Template message {{with.context.variables}}" }
          // For widgetsStep: { "widgets": [ array of widget configurations ] }
        }
      }
      // Additional steps...
    ]
  }
  
  Be creative but practical. Ensure steps flow logically and build upon each other.
  `;
  
    // If we have a template, add details about it for reference
    if (templateScenario) {
      return `
  ${basePrompt}
  
  Here's a reference scenario to use as a template. Create a new scenario with similar structure but adapted to the description:
  
  TEMPLATE SCENARIO:
  Name: ${templateScenario.name}
  Description: ${templateScenario.description}
  Icon: ${templateScenario.icon || 'folder-kanban'}
  
  Steps:
  ${templateScenario.steps.map((step, i) => `
  Step ${i + 1}: ${step.label}
  - Type: ${step.tplFile}
  - Context path: ${step.contextPath || 'N/A'}
  - Assistant message: ${step.assistantMessage || 'N/A'}
  - Attributes:
  ${Object.entries(step.attrs || {}).map(([key, value]) => `  - ${key}: ${JSON.stringify(value)}`).join('\n')}
  `).join('\n')}
  
  Maintain similar number of steps and structure, but adapt all content to fit the new scenario description.
  `;
    }
  
    return basePrompt;
  }
  
  /**
   * Process AI-generated scenario to ensure it has all required fields
   */
  export function processGeneratedScenario(aiResponse: any): EnhancedScenario {
    try {
      let scenarioData: any;
      
      // Parse the response if it's a string
      if (typeof aiResponse === 'string') {
        scenarioData = JSON.parse(aiResponse);
      } else {
        scenarioData = aiResponse;
      }
      
      // Generate IDs and ensure required fields
      const scenarioId = generateScenarioId(scenarioData.name || 'scenario');
      
      // Process steps to add IDs and ensure correct structure
      const processedSteps: StepData[] = (scenarioData.steps || []).map((step: any, index: number) => {
        return {
          id: generateStepId(step.label),
          label: step.label || `Step ${index + 1}`,
          tplFile: step.tplFile || 'formStep',
          assistantMessage: step.assistantMessage || '',
          contextPath: step.contextPath || `step-${index + 1}-data`,
          order: index,
          attrs: step.attrs || {}
        };
      });
      
      return {
        id: scenarioId,
        name: scenarioData.name || 'New Scenario',
        description: scenarioData.description || '',
        icon: scenarioData.icon || 'folder-kanban',
        systemMessage: scenarioData.systemMessage || '',
        steps: processedSteps
      };
    } catch (error) {
      console.error('Error processing AI response:', error);
      throw new Error('Failed to process the AI-generated scenario. Please try again.');
    }
  }
  
  /**
   * Generate a scenario using AI
   */
  export async function generateScenarioWithAI(
    description: string,
    llmService: LlmService,
    templateScenario?: EnhancedScenario
  ): Promise<EnhancedScenario> {
    // Create prompt based on description and optional template
    const prompt = createScenarioPrompt(description, templateScenario);
    
    try {
      // Get AI response
      const aiResponse = await llmService.generateCompletion(prompt);
      
      // Process the response into a valid scenario
      return processGeneratedScenario(aiResponse);
    } catch (error) {
      console.error('Error generating scenario with AI:', error);
      throw error;
    }
  }
  
  /**
   * Convert a basic Scenario to an EnhancedScenario (for editing existing scenarios)
   */
  export function convertToEnhancedScenario(scenario: ScenarioTemplate & { nodes?: any[] }): EnhancedScenario {
    // Convert nodes to steps
    const steps: StepData[] = (scenario.nodes || []).map((node, index) => ({
      id: node.id || generateStepId(),
      label: node.label || `Step ${index + 1}`,
      assistantMessage: node.assistantMessage || '',
      contextPath: node.contextPath || '',
      tplFile: node.tplFile || 'formStep',
      order: node.order !== undefined ? node.order : index,
      attrs: node.attrs || {}
    }));
    
    // Sort steps by order
    steps.sort((a, b) => a.order - b.order);
    
    return {
      id: scenario.id,
      name: scenario.name,
      description: scenario.description || '',
      icon: scenario.icon || 'folder-kanban',
      systemMessage: scenario.systemMessage || '',
      steps
    };
  }