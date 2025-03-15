import { AppState, ElementType } from "./types";

// Initial app state
export const initialState: Pick<AppState, 'items' | 'selected' | 'conversation'> = {
  items: [
    {
      id: 'workspace1', type: ElementType.WORKSPACE, title: 'Project Alpha',
      children: [
        {
          id: 'scenario1', type: ElementType.SCENARIO, name: 'Main Flow', description: 'Primary user journey',
          children: [
            { id: 'node1', type: ElementType.GRAPH_NODE, label: 'Start', assistant: 'Hello! How can I help you today?', position: { x: 100, y: 100 } },
            { id: 'node2', type: ElementType.GRAPH_NODE, label: 'Process', assistant: 'Thank you for your question. Let me think about that.', position: { x: 300, y: 200 } }
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