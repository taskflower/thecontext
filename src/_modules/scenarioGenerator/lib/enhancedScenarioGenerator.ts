// src/_modules/scenarioGenerator/lib/enhancedScenarioGenerator.ts

import { Scenario, NodeData, FormField } from "@/types";

/**
 * Interfejs zawierający rozszerzone dane o scenariuszu
 */
export interface EnhancedScenarioTemplate {
  id: string;
  name: string;
  description: string;
  icon?: string;
  systemMessage?: string;
  steps: {
    id: string;
    label: string;
    assistantMessage?: string;
    contextPath?: string;
    tplFile: string;
    order: number;
    attrs?: {
      schemaPath?: string;
      autoStart?: boolean;
      initialUserMessage?: string;
      widgets?: any[];
      [key: string]: any;
    };
  }[];
  initialContext?: Record<string, any>;
}

/**
 * Konwertuje scenariusz na format szablonu
 */
export function convertScenarioToEnhancedTemplate(scenario: Scenario): EnhancedScenarioTemplate {
  return {
    id: scenario.id,
    name: scenario.name,
    description: scenario.description || '',
    icon: scenario.icon,
    systemMessage: scenario.systemMessage,
    steps: (scenario.nodes || []).map((node: NodeData) => ({
      id: node.id,
      label: node.label || '',
      assistantMessage: node.assistantMessage,
      contextPath: node.contextPath,
      tplFile: node.tplFile || 'formStep',
      order: node.order || 0,
      attrs: node.attrs || {}
    }))
  };
}

/**
 * Generuje kod implementacji scenariusza
 */
export function generateScenarioImplementation(template: EnhancedScenarioTemplate): string {
  const steps = template.steps.map((step, index) => {
    return `
export const ${step.id.replace(/-/g, '_')}: NodeData = {
  id: "${step.id}",
  scenarioId: "${template.id}",
  label: "${step.label}",
  ${step.assistantMessage ? `assistantMessage: "${step.assistantMessage}",` : ''}
  ${step.contextPath ? `contextPath: "${step.contextPath}",` : ''}
  tplFile: "${step.tplFile}",
  order: ${step.order},
  attrs: ${JSON.stringify(step.attrs || {}, null, 2)}
};`;
  }).join('\n\n');

  const scenarioDefinition = `
export const ${template.id.replace(/-/g, '_')}Scenario: Scenario = {
  id: "${template.id}",
  name: "${template.name}",
  description: "${template.description}",
  ${template.icon ? `icon: "${template.icon}",` : ''}
  ${template.systemMessage ? `systemMessage: "${template.systemMessage}",` : ''}
  nodes: [
    ${template.steps.map(step => step.id.replace(/-/g, '_')).join(',\n    ')}
  ]
};

export default ${template.id.replace(/-/g, '_')}Scenario;
`;

  const imports = `
// src/scenarios/${template.id}/index.ts
import { Scenario, NodeData } from '@/types';
`;

  return imports + steps + scenarioDefinition;
}

/**
 * Generuje zawartość pliku z kontekstem początkowym
 */
export function generateInitialContextFile(scenario: EnhancedScenarioTemplate): string {
  // Zbierz wszystkie schematy z kroków
  const schemas: Record<string, FormField[]> = {};
  
  scenario.steps.forEach(step => {
    if (step.tplFile === 'formStep' && step.attrs?.schemaPath) {
      const schemaPath = step.attrs.schemaPath.split('.');
      if (schemaPath.length > 1) {
        const schemaKey = schemaPath[schemaPath.length - 1];
        schemas[schemaKey] = [
          { name: 'example', label: 'Przykładowe pole', type: 'text', required: true }
        ];
      }
    }
  });
  
  // Stwórz strukturę kontekstu
  const initialContext = {
    schemas: schemas,
    // Możemy dodać inne domyślne wartości kontekstu
  };
  
  return `
// src/scenarios/${scenario.id}/initialContext.ts
export const initialContext = ${JSON.stringify(initialContext, null, 2)};

export default initialContext;
`;
}

/**
 * Stwórz prompt dla LLM, aby wygenerować nowy scenariusz na podstawie opisu
 */
export function createScenarioPrompt(
  templateScenario: EnhancedScenarioTemplate, 
  newScenarioDescription: string
): string {
  return `
Analizując poniższy wzorcowy scenariusz, stwórz nowy scenariusz pasujący do tego opisu: 
"${newScenarioDescription}"

WZORCOWY SCENARIUSZ:
Nazwa: ${templateScenario.name}
Opis: ${templateScenario.description}
Ikona: ${templateScenario.icon || 'brak'}
System Message: ${templateScenario.systemMessage || 'brak'}

Kroki:
${templateScenario.steps.map((step, i) => `
Krok ${i + 1}: ${step.label}
- ID: ${step.id}
- Typ szablonu: ${step.tplFile}
- Ścieżka kontekstu: ${step.contextPath || 'brak'}
- Wiadomość asystenta: ${step.assistantMessage || 'brak'}
- Atrybuty:
${Object.entries(step.attrs || {}).map(([key, value]) => `  - ${key}: ${JSON.stringify(value)}`).join('\n')}
`).join('\n')}

Proszę o stworzenie nowego scenariusza bazującego na podanym, ale dostosowanego do następującego opisu:
"${newScenarioDescription}"

Zachowaj podobną strukturę i liczbę kroków, ale dostosuj nazwy, treści wiadomości i konteksty do nowego tematu.
Jeśli w oryginalnych krokach są formularze, dostosuj ich pola do nowego kontekstu.
Jeśli są kroki LLM, dostosuj zapytania do nowego tematu.
Jeśli są widgety, dostosuj ich konfigurację do nowego scenariusza.

Zwróć wynik w formacie JSON zgodnym z poniższym schematem:

{
  "id": "unikalny-id-scenariusza",
  "name": "Nazwa nowego scenariusza",
  "description": "Szczegółowy opis nowego scenariusza",
  "icon": "ikona-scenariusza",
  "systemMessage": "Systemowa wiadomość dla LLM (opcjonalne)",
  "steps": [
    {
      "id": "unikalny-id-kroku",
      "label": "Etykieta kroku",
      "assistantMessage": "Wiadomość asystenta",
      "contextPath": "ścieżka.do.kontekstu",
      "tplFile": "typ-szablonu",
      "order": 0,
      "attrs": {
        // atrybuty specyficzne dla danego typu kroku
        "schemaPath": "ścieżka.do.schematu",
        "autoStart": true,
        "initialUserMessage": "Wiadomość inicjująca LLM",
        "widgets": [
          {
            "tplFile": "typ-widgetu",
            "title": "Tytuł widgetu",
            "dataPath": "ścieżka.do.danych"
          }
        ]
      }
    }
  ]
}

Upewnij się, że wszystkie ID są unikalne i bazują na nazwie nowego scenariusza.
Wszystkie ścieżki kontekstu powinny mieć sens w kontekście nowego scenariusza.
`;
}

/**
 * Generuje nowy scenariusz na podstawie szablonu i opisu
 */
export async function createEnhancedScenario(
  templateScenario: Scenario,
  newScenarioDescription: string,
  llmService: any
): Promise<{
  scenarioCode: string;
  initialContextCode: string;
}> {
  // Konwertuj scenariusz do szablonu
  const enhancedTemplate = convertScenarioToEnhancedTemplate(templateScenario);
  
  // Generuj prompt dla LLM
  const prompt = createScenarioPrompt(enhancedTemplate, newScenarioDescription);
  
  try {
    // Wywołaj LLM z promptem
    const llmResponse = await llmService.generateCompletion(prompt);
    
    // Parsuj odpowiedź LLM jako JSON
    const newScenarioTemplate = JSON.parse(llmResponse);
    
    // Wygeneruj kod implementacji scenariusza
    const scenarioCode = generateScenarioImplementation(newScenarioTemplate);
    
    // Wygeneruj kod kontekstu początkowego
    const initialContextCode = generateInitialContextFile(newScenarioTemplate);
    
    return {
      scenarioCode,
      initialContextCode
    };
  } catch (error) {
    console.error("Nie udało się przetworzyć odpowiedzi LLM:", error);
    throw new Error("Nieprawidłowy format odpowiedzi LLM lub błąd przetwarzania");
  }
}

/**
 * Funkcja pomocnicza do generowania unikalnych ID
 */
export function generateUniqueId(base: string): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${base}-${timestamp}-${randomStr}`;
}

/**
 * Funkcja do walidacji scenariusza przed zapisem
 */
export function validateScenario(scenario: EnhancedScenarioTemplate): string[] {
  const errors: string[] = [];
  
  // Sprawdzenie podstawowych pól
  if (!scenario.id) errors.push("Brak ID scenariusza");
  if (!scenario.name) errors.push("Brak nazwy scenariusza");
  
  // Sprawdzenie kroków
  if (!scenario.steps || scenario.steps.length === 0) {
    errors.push("Scenariusz musi zawierać przynajmniej jeden krok");
  } else {
    // Sprawdzenie poszczególnych kroków
    scenario.steps.forEach((step, index) => {
      if (!step.id) errors.push(`Krok ${index + 1}: Brak ID`);
      if (!step.label) errors.push(`Krok ${index + 1}: Brak etykiety`);
      if (!step.tplFile) errors.push(`Krok ${index + 1}: Brak typu szablonu`);
      
      // Sprawdzenia specyficzne dla typów kroków
      if (step.tplFile === 'llmStep' && step.attrs?.autoStart && !step.attrs?.initialUserMessage) {
        errors.push(`Krok ${index + 1}: Autouruchamiany krok LLM musi mieć wiadomość inicjującą`);
      }
      
      if (step.tplFile === 'widgetsStep' && (!step.attrs?.widgets || step.attrs.widgets.length === 0)) {
        errors.push(`Krok ${index + 1}: Krok z widgetami musi zawierać przynajmniej jeden widget`);
      }
    });
  }
  
  return errors;
}