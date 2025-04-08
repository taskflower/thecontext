/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/templateRegistry.ts
import { ComponentType } from "react";
import { layouts } from '../templates/layouts';
import { widgets } from '../templates/widgets';
import { flowSteps } from '../templates/flowSteps';

// Define the category type to ensure type safety
export type WidgetCategory = "scenario" | "workspace" | "flow";

// Define interfaces for templates
export interface LayoutTemplate {
  id: string;
  name: string;
  component: ComponentType<LayoutProps>;
}

export interface WidgetTemplate {
  id: string;
  name: string;
  category: WidgetCategory;
  component: ComponentType<WidgetProps>;
}

export interface FlowStepTemplate {
  id: string;
  name: string;
  component: ComponentType<FlowStepProps>;
  compatibleNodeTypes: string[];
}

export interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export interface WidgetProps {
  data?: any[];
  onSelect?: (id: string) => void;
  onCreate?: (data: any) => void;
  onEdit?: (id: string, event: React.MouseEvent) => void;
}

export interface FlowStepProps {
  node: any;
  onSubmit: (input: string) => void;
  onPrevious: () => void;
  isLastNode: boolean;
  contextItems?: any[];
}

class TemplateRegistry {
  private layouts: Map<string, LayoutTemplate> = new Map();
  private widgets: Map<string, WidgetTemplate> = new Map();
  private flowSteps: Map<string, FlowStepTemplate> = new Map();

  constructor() {
    // Register templates from import maps
    this.registerTemplates();
  }

  private registerTemplates() {
    // Rejestrowanie layoutów
    Object.values(layouts).forEach(layout => {
      this.layouts.set(layout.id, layout as LayoutTemplate);
    });

    // Rejestrowanie widgetów
    Object.values(widgets).forEach(widget => {
      this.widgets.set(widget.id, widget as WidgetTemplate);
    });

    // Rejestrowanie kroków przepływu
    Object.values(flowSteps).forEach(flowStep => {
      this.flowSteps.set(flowStep.id, flowStep as FlowStepTemplate);
    });
  }

  // Methods for layouts
  getLayout(id: string): LayoutTemplate | undefined {
    const template = this.layouts.get(id);
    return template || this.layouts.get("default");
  }

  getAllLayouts(): LayoutTemplate[] {
    return Array.from(this.layouts.values());
  }

  // Methods for widgets
  getWidget(id: string): WidgetTemplate | undefined {
    const template = this.widgets.get(id);
    return template || this.widgets.get("card-list");
  }

  getWidgetsByCategory(category: WidgetCategory): WidgetTemplate[] {
    return Array.from(this.widgets.values()).filter(
      (widget) => widget.category === category
    );
  }

  getAllWidgets(): WidgetTemplate[] {
    return Array.from(this.widgets.values());
  }

  // Methods for flow steps
  getFlowStep(id: string): FlowStepTemplate | undefined {
    console.log(`Getting flow step template for id: ${id}`);
    const template = this.flowSteps.get(id);
    
    if (!template) {
      console.warn(`Flow step template not found for id: ${id}, using default`);
      return this.flowSteps.get("basic-step");
    }
    
    return template;
  }

  getFlowStepForNodeType(nodeType: string): FlowStepTemplate | undefined {
    return (
      Array.from(this.flowSteps.values()).find((template) =>
        template.compatibleNodeTypes.includes(nodeType)
      ) || this.flowSteps.get("basic-step")
    );
  }

  getAllFlowSteps(): FlowStepTemplate[] {
    return Array.from(this.flowSteps.values());
  }
}

// Create singleton and export
export const templateRegistry = new TemplateRegistry();