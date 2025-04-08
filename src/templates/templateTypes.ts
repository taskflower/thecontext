/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types/templates.ts
export interface LayoutTemplate {
    id: string;
    name: string;
    component: React.ComponentType<LayoutProps>;
  }
  
  export interface WidgetTemplate {
    id: string;
    name: string;
    category: 'scenario' | 'workspace' | 'flow';
    component: React.ComponentType<WidgetProps>;
  }
  
  export interface FlowStepTemplate {
    id: string;
    name: string;
    component: React.ComponentType<FlowStepProps>;
    // Metadata about what type of node this template can render
    compatibleNodeTypes: string[];
  }
  
  export interface LayoutProps {
    children: React.ReactNode;
    title?: string;
    showBackButton?: boolean;
    onBackClick?: () => void;
  }
  
  export interface WidgetProps {
    workspaceId?: string;
    scenarioId?: string;
    data?: any;
    onSelect?: (id: string) => void;
    onCreate?: (data: any) => void;
  }
  
  export interface FlowStepProps {
    node: any;
    onSubmit: (input: string) => void;
    onPrevious: () => void;
    isLastNode: boolean;
    contextItems?: any[];
  }
  
  
  