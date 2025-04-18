// src/utils/scenarioGenerator.ts

import { Scenario } from "@/types";


/**
 * Interfejs zawierający dane o scenariuszu do użycia przez LLM
 */
export interface ScenarioTemplate {
  id: string;
  name: string;
  description: string;
  systemMessage?: string;
  steps: {
    id: string;
    label: string;
    assistantMessage?: string;
    contextPath?: string;
    templateId: string;
    type?: string;
    attrs?: Record<string, any>;
    initialUserMessage?: string;
  }[];
}

/**
 * Konwertuje scenariusz na format, który można łatwo wysłać do LLM
 */
export function convertScenarioToTemplate(scenario: Scenario): ScenarioTemplate {
  return {
    id: scenario.id,
    name: scenario.name,
    description: scenario.description,
    systemMessage: scenario.systemMessage,
    steps: scenario.getSteps().map((step: any) => ({
      id: step.id,
      label: step.label,
      assistantMessage: step.assistantMessage,
      contextPath: step.contextPath,
      templateId: step.templateId,
      type: step.type,
      attrs: step.attrs,
      initialUserMessage: step.initialUserMessage
    }))
  };
}

/**
 * Konwertuje szablon scenariusza z powrotem na implementację scenariusza
 */
export function convertTemplateToScenarioImplementation(template: ScenarioTemplate): string {
  const steps = template.steps.map((step, index) => {
    return `
export const step${index + 1}: ScenarioStep = {
  id: "${step.id}",
  scenarioId: "${template.id}",
  label: "${step.label}",
  ${step.assistantMessage ? `assistantMessage: "${step.assistantMessage}",` : ''}
  ${step.contextPath ? `contextPath: "${step.contextPath}",` : ''}
  templateId: "${step.templateId}",
  ${step.type ? `type: "${step.type}",` : ''}
  ${step.attrs ? `attrs: ${JSON.stringify(step.attrs, null, 2)},` : ''}
  ${step.initialUserMessage ? `initialUserMessage: "${step.initialUserMessage}",` : ''}
};`;
  }).join('\n\n');

  const scenarioImplementation = `
// src/templates/default/workspaces/marketing/scenarios/${template.id.toLowerCase()}/steps.ts
import { ScenarioStep } from '../../../../../../baseTemplate';

${steps}

// src/templates/default/workspaces/marketing/scenarios/${template.id.toLowerCase()}/index.ts
import { Scenario } from '../../../../../../baseTemplate';
import { ${template.steps.map((_, index) => `step${index + 1}`).join(', ')} } from './steps';

export const ${template.id.toLowerCase()}Scenario: Scenario = {
  id: "${template.id}",
  name: "${template.name}",
  description: "${template.description}",
  ${template.systemMessage ? `systemMessage: "${template.systemMessage}",` : ''}
  getSteps: () => [
    ${template.steps.map((_, index) => `step${index + 1}`).join(',\n    ')}
  ]
};
`;

  return scenarioImplementation;
}

/**
 * Generuje prompt dla LLM, aby stworzyć nowy scenariusz na podstawie istniejącego
 */
export function generateScenarioPrompt(templateScenario: ScenarioTemplate, newScenarioDescription: string): string {
  return `
Analizując podany wzorcowy scenariusz, stwórz nowy scenariusz pasujący do tego opisu: "${newScenarioDescription}".

WZORCOWY SCENARIUSZ:
Nazwa: ${templateScenario.name}
Opis: ${templateScenario.description}
System Message: ${templateScenario.systemMessage || 'brak'}

Kroki:
${templateScenario.steps.map((step, i) => `
Krok ${i + 1}: ${step.label}
- ID szablonu: ${step.templateId}
- Ścieżka kontekstu: ${step.contextPath || 'brak'}
- Wiadomość asystenta: ${step.assistantMessage || 'brak'}
- Atrybuty: ${JSON.stringify(step.attrs || {}, null, 2)}
- Początkowa wiadomość użytkownika: ${step.initialUserMessage || 'brak'}
`).join('\n')}

Proszę o stworzenie nowego scenariusza z podobnymi krokami, ale dostosowanego do opisu: "${newScenarioDescription}".
Należy zachować podobną strukturę kroków, ale dostosować treści do nowego kontekstu.

Odpowiedź zwróć w formacie JSON zgodnym z poniższym schematem:
{
  "id": "unique-scenario-id",
  "name": "Nazwa nowego scenariusza",
  "description": "Szczegółowy opis nowego scenariusza",
  "systemMessage": "Systemowa wiadomość dla LLM",
  "steps": [
    {
      "id": "unique-step-id",
      "label": "Etykieta kroku",
      "assistantMessage": "Wiadomość asystenta",
      "contextPath": "ścieżka.do.kontekstu",
      "templateId": "id-szablonu",
      "attrs": {
        // atrybuty kroku
      },
      "initialUserMessage": "Początkowa wiadomość użytkownika"
    }
    // kolejne kroki
  ]
}
`;
}

/**
 * Przykładowe użycie utilitki do generowania nowego scenariusza
 */
export async function createNewScenario(
  templateScenario: Scenario, 
  newScenarioDescription: string,
  llmService: any // Tutaj należałoby użyć właściwego interfejsu serwisu LLM
): Promise<string> {
  // Konwertuj scenariusz do szablonu, który można przekazać do LLM
  const scenarioTemplate = convertScenarioToTemplate(templateScenario);
  
  // Wygeneruj prompt dla LLM
  const prompt = generateScenarioPrompt(scenarioTemplate, newScenarioDescription);
  
  // Wywołaj LLM z promptem
  const llmResponse = await llmService.generateCompletion(prompt);
  
  try {
    // Parsuj odpowiedź LLM jako JSON
    const newScenarioTemplate = JSON.parse(llmResponse);
    
    // Konwertuj szablon scenariusza na implementację
    const scenarioImplementation = convertTemplateToScenarioImplementation(newScenarioTemplate);
    
    return scenarioImplementation;
  } catch (error) {
    console.error("Nie udało się przetworzyć odpowiedzi LLM:", error);
    throw new Error("Nieprawidłowy format odpowiedzi LLM");
  }
}