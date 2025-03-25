// Importy typów potrzebne dla początkowych danych
import { TYPES } from "./store";
import { AppState } from "./store";

// Początkowe dane demonstracyjne
export const getInitialData = (): Partial<AppState> => {
  return {
    items: [
      {
        id: 'workspace-demo',
        type: TYPES.WORKSPACE,
        title: 'Demo Workspace',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        children: [
          {
            id: 'scenario-demo',
            type: TYPES.SCENARIO,
            name: 'Przykładowy Scenariusz',
            description: 'Przykładowa konwersacja z kilkoma krokami.',
            label: 'Demo',
            children: [
              {
                id: 'node-start',
                type: TYPES.NODE,
                label: 'Start',
                assistantMessage: 'Witaj! Jak mogę Ci dzisiaj pomóc?',
                userPrompt: '',
                position: { x: 100, y: 100 }
              },
              {
                id: 'node-select',
                type: TYPES.NODE,
                label: 'Wybór tematu',
                assistantMessage: 'Mamy kilka dostępnych tematów: AI, Programowanie, Design. Jaki temat Cię interesuje?',
                userPrompt: 'Chciałbym dowiedzieć się więcej o dostępnych tematach.',
                position: { x: 400, y: 100 }
              },
              {
                id: 'node-ai',
                type: TYPES.NODE,
                label: 'AI',
                assistantMessage: 'Sztuczna inteligencja to fascynujący temat! Obejmuje uczenie maszynowe, przetwarzanie języka naturalnego, wizję komputerową i wiele innych dziedzin.',
                userPrompt: 'Interesuje mnie temat AI.',
                position: { x: 700, y: 0 }
              },
              {
                id: 'node-programming',
                type: TYPES.NODE,
                label: 'Programowanie',
                assistantMessage: 'Programowanie to sztuka tworzenia instrukcji dla komputerów. Popularne języki to JavaScript, Python, Java i wiele innych.',
                userPrompt: 'Chciałbym porozmawiać o programowaniu.',
                position: { x: 700, y: 200 }
              }
            ],
            edges: [
              {
                id: 'edge-1',
                type: TYPES.EDGE,
                source: 'node-start',
                target: 'node-select',
                label: 'start → wybór'
              },
              {
                id: 'edge-2',
                type: TYPES.EDGE,
                source: 'node-select',
                target: 'node-ai',
                label: 'wybór AI'
              },
              {
                id: 'edge-3',
                type: TYPES.EDGE,
                source: 'node-select',
                target: 'node-programming',
                label: 'wybór Programowanie'
              }
            ]
          }
        ],
        description: "",
        slug: ""
      }
    ],
    selected: {
      workspace: 'workspace-demo',
      scenario: 'scenario-demo',
      node: ''
    },
    stateVersion: 0
  };
};