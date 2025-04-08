import { 
    LayoutTemplate, 
    WidgetTemplate, 
    FlowStepTemplate, 
    WidgetCategory 
  } from '../types';
  
  /**
   * Pobiera domyślny szablonów layoutu
   */
  export function getDefaultLayoutTemplate(templates: LayoutTemplate[]): LayoutTemplate | undefined {
    return templates.find(template => template.id === 'default');
  }
  
  /**
   * Pobiera domyślny szablon widgetu dla danej kategorii
   */
  export function getDefaultWidgetTemplate(
    templates: WidgetTemplate[], 
    category: WidgetCategory
  ): WidgetTemplate | undefined {
    const defaultTemplateIds = {
      scenario: 'card-list',
      workspace: 'card-list',
      flow: 'default-flow-widget'
    };
    
    return templates.find(
      template => template.id === defaultTemplateIds[category] && template.category === category
    );
  }
  
  /**
   * Pobiera domyślny szablon kroku przepływu
   */
  export function getDefaultFlowStepTemplate(templates: FlowStepTemplate[]): FlowStepTemplate | undefined {
    return templates.find(template => template.id === 'basic-step');
  }
  
  /**
   * Znajduje szablon kroku przepływu kompatybilny z typem węzła
   */
  export function findCompatibleFlowStepTemplate(
    templates: FlowStepTemplate[],
    nodeType: string
  ): FlowStepTemplate | undefined {
    return templates.find(
      template => template.compatibleNodeTypes.includes(nodeType)
    );
  }
  
  /**
   * Przygotowuje jednolite nazwy ścieżek dla szablonów
   */
  export function normalizePath(path: string): string {
    // Usuń przedrostek './' lub '/' jeśli istnieje
    let normalizedPath = path.replace(/^(\.\/|\/)/g, '');
    
    // Usuń rozszerzenie pliku jeśli istnieje
    normalizedPath = normalizedPath.replace(/\.[^/.]+$/, '');
    
    return normalizedPath;
  }