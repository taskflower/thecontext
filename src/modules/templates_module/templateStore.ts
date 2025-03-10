// src/modules/templates_module/templateStore.ts
// (dawniej scenarioStore.ts)
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
  
  // Import template to scenario
  importTemplateAsNode: (templateIndex, mountPoint, prefix = 'imported') => {
    const template = get().templates[templateIndex];
    if (template) {
      const templateNodeId = `${prefix}.template.${template.name.replace(/\\s+/g, '_')}`;
      const templateNode = {
        id: templateNodeId,
        message: `Szablon: ${template.name}\\n${template.description || ''}`,
        category: 'template',
        templateData: template,
      };
      
      // Access scenarioStore to add the node and edge
      useScenarioStore.getState().addNode(
        templateNodeId, 
        templateNode.message, 
        'template', 
        template
      );
      
      useScenarioStore.getState().addEdge(mountPoint, templateNodeId);
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