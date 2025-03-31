// Importy typów potrzebne dla początkowych danych
import { TYPES } from "./store";
import { AppState } from "./store";

// Początkowe dane dla lekcji Duolingo z zapisem odpowiedzi do kontekstu
export const getInitialData = (): Partial<AppState> => {
  return {
    items: [
      {
        id: 'workspace-duolingo',
        type: TYPES.WORKSPACE,
        title: 'Lekcje Duolingo',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        description: 'Przestrzeń z lekcjami językowymi w stylu Duolingo.',
        slug: 'lekcje-duolingo',
        contextItems: [
          {
            id: 'context-translateAnswer',
            title: 'translateAnswer',
            type: 'text', // lub np. ContextType.TEXT
            content: '',
            createdAt: Date.now(),
            updatedAt: Date.now()
          }
        ],
        children: [
          {
            id: 'scenario-lesson1',
            type: TYPES.SCENARIO,
            name: 'Lekcja: Podstawowe Zwroty',
            description: 'Prosta lekcja ucząca podstawowych zwrotów w języku angielskim.',
            label: 'Lekcja 1',
            children: [
              {
                id: 'node-start',
                type: TYPES.NODE,
                label: 'Start',
                assistantMessage: 'Witaj! Zaczniemy naukę podstawowych zwrotów. Gotowy?',
                userPrompt: '',
                position: { x: 100, y: 100 }
              },
              {
                id: 'node-translate',
                type: TYPES.NODE,
                label: 'Przetłumacz zdanie',
                assistantMessage: 'Przetłumacz na angielski: "Dzień dobry".',
                userPrompt: '',
                contextKey: 'translateAnswer',
                persistent: true, // <-- Klucz zapisujący wartość do kontekstu
                position: { x: 400, y: 100 }
              },
              {
                id: 'node-feedback',
                type: TYPES.NODE,
                label: 'Sprawdzenie tłumaczenia',
                assistantMessage: 'Twoje tłumaczenie: "{{translateAnswer}}". Poprawne tłumaczenie to: "Good morning".',
                userPrompt: '',
                position: { x: 700, y: 100 }
              },
              {
                id: 'node-congrats',
                type: TYPES.NODE,
                label: 'Gratulacje',
                assistantMessage: 'Gratulacje! Udało Ci się poprawnie przetłumaczyć zdanie.',
                userPrompt: '',
                position: { x: 1000, y: 100 }
              }
            ],
            edges: [
              {
                id: 'edge-1',
                type: TYPES.EDGE,
                source: 'node-start',
                target: 'node-translate',
                label: 'start → tłumaczenie'
              },
              {
                id: 'edge-2',
                type: TYPES.EDGE,
                source: 'node-translate',
                target: 'node-feedback',
                label: 'tłumaczenie → sprawdzenie'
              },
              {
                id: 'edge-3',
                type: TYPES.EDGE,
                source: 'node-feedback',
                target: 'node-congrats',
                label: 'sprawdzenie → gratulacje'
              }
            ]
          }
        ]
      }
    ],
    selected: {
      workspace: 'workspace-duolingo',
      scenario: 'scenario-lesson1',
      node: ''
    },
    stateVersion: 0
  };
};
