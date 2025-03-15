import { AppState, ElementType } from "./types";

// Initial app state
export const initialState: AppState = {
  items: [
    {
      id: 'workspace1', type: ElementType.WORKSPACE, title: 'Project Alpha',
      children: [
        {
          id: 'scenario1', type: ElementType.SCENARIO, name: 'Main Flow', description: 'Primary user journey',
          children: [
            { id: 'node1', type: ElementType.GRAPH_NODE, label: 'Start', value: 100, position: { x: 100, y: 100 } },
            { id: 'node2', type: ElementType.GRAPH_NODE, label: 'Process', value: 250, position: { x: 300, y: 200 } }
          ],
          edges: [
            { id: 'edge1', source: 'node1', target: 'node2', label: 'Flow' }
          ]
        }
      ]
    }
  ],
  selected: { workspace: 'workspace1', scenario: 'scenario1' },
  stateVersion: 0
};