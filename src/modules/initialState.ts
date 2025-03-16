// src/modules/initialState.ts
import { AppState, ElementType } from "./types";

// Stan początkowy aplikacji
export const initialState: Pick<AppState, 'items' | 'selected' | 'conversation'> = {
  items: [
    {
      id: 'workspace1', 
      type: ElementType.WORKSPACE, 
      title: 'Project Alpha',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      // Kontekst bezpośrednio w workspace
      contextItems: [
        {
          key: 'project_name',
          value: 'Project Alpha',
          valueType: 'text'
        },
        {
          key: 'created_date',
          value: new Date().toISOString(),
          valueType: 'text'
        },
        {
          key: 'configuration',
          value: JSON.stringify({
            default_language: 'en',
            max_tokens: 2048,
            temperature: 0.7
          }),
          valueType: 'json'
        }
      ],
      children: [
        {
          id: 'scenario1', 
          type: ElementType.SCENARIO, 
          name: 'Main Flow', 
          description: 'Primary user journey',
          children: [
            { 
              id: 'node1', 
              type: ElementType.GRAPH_NODE, 
              label: 'Start', 
              assistant: 'Hello! How can I help you today with {{project_name}}?', 
              position: { x: 100, y: 100 } 
            },
            { 
              id: 'node2', 
              type: ElementType.GRAPH_NODE, 
              label: 'Process', 
              assistant: 'Thank you for your question. Let me think about that using configuration: {{configuration}}.', 
              position: { x: 300, y: 200 } 
            }
          ],
          edges: [
            { id: 'edge1', source: 'node1', target: 'node2', label: 'Flow' }
          ]
        }
      ]
    }
  ],
  selected: { workspace: 'workspace1', scenario: 'scenario1' },
  conversation: []
};