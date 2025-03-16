// src/modules/helper/helperActions.ts
export const createHelperActions = (get) => ({
    getCurrentScenario: () => {
      const state = get();
      const workspace = state.items.find(
        (w) => w.id === state.selected.workspace
      );
      if (!workspace) return null;
      return (
        workspace.children?.find((s) => s.id === state.selected.scenario) ||
        null
      );
    },
  
    getActiveScenarioData: () => {
      const state = get();
      const workspace = state.items.find(
        (w) => w.id === state.selected.workspace
      );
      if (!workspace) return { nodes: [], edges: [] };
  
      const scenario = workspace.children?.find(
        (s) => s.id === state.selected.scenario
      );
      if (!scenario) return { nodes: [], edges: [] };
  
      const nodes =
        scenario.children?.map((node) => ({
          id: node.id,
          data: { label: `${node.label}\n${node.assistant ? '(Assistant)' : ''}` },
          position: node.position,
          selected: node.id === state.selected.node,
        })) || [];
  
      const edges =
        scenario.edges?.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: edge.label,
          selected: edge.id === state.selected.edge,
          style: edge.id === state.selected.edge ? { stroke: '#3b82f6', strokeWidth: 3 } : {},
          className: edge.id === state.selected.edge ? 'selected-edge' : '',
          animated: edge.id === state.selected.edge,
        })) || [];
  
      return { nodes, edges };
    },
  });