// src/modules/templates_module/templateStore.ts
import { create } from 'zustand';
import { useScenarioStore } from '../scenarios_module/scenarioStore';
import { Node, Edge } from '../scenarios_module/types';
import { initialTemplates } from '../init_data/mockTemplateData';

export interface Template {
  name: string;
  description: string;
  nodes: Record<string, Node>;
  edges: Edge[];
}

interface TemplateState {
  templates: Template[];
  
  // Actions for templates
  setTemplates: (templates: Template[]) => void;
  addTemplate: (template: Template) => void;
  removeTemplate: (index: number) => void;
  
  // Import template to scenario
  importTemplateAsNode: (templateIndex: number, mountPoint: string, prefix?: string) => void;
  
  // Export/Import templates
  exportTemplatesToJson: () => Template[];
  importTemplatesFromJson: (data: Template[]) => void;
}

export const useTemplateStore = create<TemplateState>((set, get) => ({
  // Load templates from mock data
  templates: initialTemplates,
  
  // Template actions
  setTemplates: (templates) => set({ templates }),
  
  addTemplate: (template) => set((state) => ({
    templates: [...state.templates, template]
  })),
  
  removeTemplate: (index) => set((state) => ({
    templates: state.templates.filter((_, i) => i !== index)
  })),
  
  // Import template to scenario - modified to directly add all nodes
  importTemplateAsNode: (templateIndex, mountPoint, prefix = 'imported') => {
    const template = get().templates[templateIndex];
    if (template) {
      const scenarioStore = useScenarioStore.getState();
      
      // Create a mapping of original IDs to new prefixed IDs
      const idMapping: Record<string, string> = {};
      
      // First, add all nodes with prefixed IDs
      Object.entries(template.nodes).forEach(([originalId, node]) => {
        const newId = `${prefix}.${originalId}`;
        idMapping[originalId] = newId;
        
        // Add node with new ID
        scenarioStore.addNode(
          newId,
          node.message,
          node.category,
          undefined // No need to reference template data
        );
      });
      
      // Then add all edges with mapped IDs
      template.edges.forEach(edge => {
        const newSource = idMapping[edge.source] || edge.source;
        const newTarget = idMapping[edge.target] || edge.target;
        
        scenarioStore.addEdge(newSource, newTarget);
      });
      
      // Connect the mountPoint to the first node if specified
      if (mountPoint && Object.keys(idMapping).length > 0) {
        // Find entry nodes (nodes that have no incoming edges in the template)
        const targetNodes = template.edges.map(edge => edge.target);
        const entryNodes = Object.keys(template.nodes).filter(
          nodeId => !targetNodes.includes(nodeId)
        );
        
        // Connect mountPoint to all entry nodes
        if (entryNodes.length > 0) {
          entryNodes.forEach(entryNode => {
            const newEntryId = idMapping[entryNode];
            scenarioStore.addEdge(mountPoint, newEntryId);
          });
        } else {
          // If no entry nodes found, connect to the first node
          const firstNodeId = Object.keys(idMapping)[0];
          scenarioStore.addEdge(mountPoint, firstNodeId);
        }
      }
    }
  },
  
  // Export/Import templates
  exportTemplatesToJson: () => {
    return get().templates;
  },
  
  importTemplatesFromJson: (data) => {
    if (Array.isArray(data)) {
      set({ templates: data });
    }
  }
}));