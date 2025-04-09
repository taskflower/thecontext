// src/core/TemplateRegistry.ts
// Główna klasa rejestru szablonów

import { 
    LayoutTemplate, 
    WidgetTemplate, 
    FlowStepTemplate, 
    WidgetCategory 
  } from '../types';
  
  import {
    validateLayoutTemplate,
    validateWidgetTemplate,
    validateFlowStepTemplate,
  } from '../utils/TemplateValidators';
  
  import {
    getDefaultLayoutTemplate,
    getDefaultWidgetTemplate,
    getDefaultFlowStepTemplate,
    findCompatibleFlowStepTemplate
  } from '../utils/registryHelpers';
  
  /**
   * Główna klasa rejestru szablonów
   * 
   * Odpowiada za zarządzanie szablonami layoutów, widgetów i kroków przepływu
   */
  export class TemplateRegistry {
    private layouts: Map<string, LayoutTemplate> = new Map();
    private widgets: Map<string, WidgetTemplate> = new Map();
    private flowSteps: Map<string, FlowStepTemplate> = new Map();
  
    /**
     * Rejestruje nowy szablon layoutu
     */
    registerLayout(template: LayoutTemplate): TemplateRegistry {
      try {
        validateLayoutTemplate(template);
        this.layouts.set(template.id, template);
      } catch (error) {
        console.error(`Błąd rejestracji szablonu layoutu: ${(error as Error).message}`);
      }
      return this;
    }
  
    /**
     * Rejestruje wiele szablonów layoutów
     */
    registerLayouts(templates: LayoutTemplate[]): TemplateRegistry {
      templates.forEach(template => this.registerLayout(template));
      return this;
    }
  
    /**
     * Rejestruje nowy szablon widgetu
     */
    registerWidget(template: WidgetTemplate): TemplateRegistry {
      try {
        validateWidgetTemplate(template);
        this.widgets.set(template.id, template);
      } catch (error) {
        console.error(`Błąd rejestracji szablonu widgetu: ${(error as Error).message}`);
      }
      return this;
    }
  
    /**
     * Rejestruje wiele szablonów widgetów
     */
    registerWidgets(templates: WidgetTemplate[]): TemplateRegistry {
      templates.forEach(template => this.registerWidget(template));
      return this;
    }
  
    /**
     * Rejestruje nowy szablon kroku przepływu
     */
    registerFlowStep(template: FlowStepTemplate): TemplateRegistry {
      try {
        validateFlowStepTemplate(template);
        this.flowSteps.set(template.id, template);
      } catch (error) {
        console.error(`Błąd rejestracji szablonu kroku przepływu: ${(error as Error).message}`);
      }
      return this;
    }
  
    /**
     * Rejestruje wiele szablonów kroków przepływu
     */
    registerFlowSteps(templates: FlowStepTemplate[]): TemplateRegistry {
      templates.forEach(template => this.registerFlowStep(template));
      return this;
    }
  
    /**
     * Pobiera szablon layoutu po ID
     */
    getLayout(id: string): LayoutTemplate | undefined {
      const template = this.layouts.get(id);
      
      if (!template) {
        const defaultTemplate = getDefaultLayoutTemplate(this.getAllLayouts());
        if (defaultTemplate) {
          console.warn(`Nie znaleziono szablonu layoutu dla id: ${id}, używam domyślnego`);
          return defaultTemplate;
        }
      }
      
      return template;
    }
  
    /**
     * Pobiera wszystkie zarejestrowane szablony layoutów
     */
    getAllLayouts(): LayoutTemplate[] {
      return Array.from(this.layouts.values());
    }
  
    /**
     * Pobiera szablon widgetu po ID
     */
    getWidget(id: string): WidgetTemplate | undefined {
      const template = this.widgets.get(id);
      return template;
    }
  
    /**
     * Pobiera szablony widgetów według kategorii
     */
    getWidgetsByCategory(category: WidgetCategory): WidgetTemplate[] {
      return Array.from(this.widgets.values()).filter(
        widget => widget.category === category
      );
    }
  
    /**
     * Pobiera domyślny szablon widgetu dla kategorii
     */
    getDefaultWidgetForCategory(category: WidgetCategory): WidgetTemplate | undefined {
      const widgets = this.getWidgetsByCategory(category);
      return getDefaultWidgetTemplate(widgets, category);
    }
  
    /**
     * Pobiera wszystkie zarejestrowane szablony widgetów
     */
    getAllWidgets(): WidgetTemplate[] {
      return Array.from(this.widgets.values());
    }
  
    /**
     * Pobiera szablon kroku przepływu po ID
     */
    getFlowStep(id: string): FlowStepTemplate | undefined {
      const template = this.flowSteps.get(id);
      
      if (!template) {
        const defaultTemplate = getDefaultFlowStepTemplate(this.getAllFlowSteps());
        if (defaultTemplate) {
          console.warn(`Nie znaleziono szablonu kroku przepływu dla id: ${id}, używam domyślnego`);
          return defaultTemplate;
        }
      }
      
      return template;
    }
  
    /**
     * Pobiera szablon kroku przepływu kompatybilny z danym typem węzła
     */
    getFlowStepForNodeType(nodeType: string): FlowStepTemplate | undefined {
      const template = findCompatibleFlowStepTemplate(this.getAllFlowSteps(), nodeType);
      
      if (!template) {
        const defaultTemplate = getDefaultFlowStepTemplate(this.getAllFlowSteps());
        if (defaultTemplate) {
          console.warn(`Nie znaleziono kompatybilnego szablonu dla typu węzła: ${nodeType}, używam domyślnego`);
          return defaultTemplate;
        }
      }
      
      return template;
    }
  
    /**
     * Pobiera wszystkie zarejestrowane szablony kroków przepływu
     */
    getAllFlowSteps(): FlowStepTemplate[] {
      return Array.from(this.flowSteps.values());
    }
  
    /**
     * Usuwa szablon layoutu
     */
    removeLayout(id: string): boolean {
      return this.layouts.delete(id);
    }
  
    /**
     * Usuwa szablon widgetu
     */
    removeWidget(id: string): boolean {
      return this.widgets.delete(id);
    }
  
    /**
     * Usuwa szablon kroku przepływu
     */
    removeFlowStep(id: string): boolean {
      return this.flowSteps.delete(id);
    }
  
    /**
     * Czyści wszystkie zarejestrowane szablony
     */
    clear(): void {
      this.layouts.clear();
      this.widgets.clear();
      this.flowSteps.clear();
    }
  }
  
  /**
   * Tworzy nową instancję rejestru szablonów
   */
  export function createTemplateRegistry(): TemplateRegistry {
    return new TemplateRegistry();
  }