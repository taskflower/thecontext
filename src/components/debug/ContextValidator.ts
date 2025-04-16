// src/components/debug/ContextValidator.ts
import { useAppStore } from "@/lib/store";

/**
 * Klasa pomocnicza do walidacji kontekstu i wykrywania problemów z szablonami
 */
export class ContextValidator {
  /**
   * Waliduje scenariusz i jego kroki, zwraca listę wykrytych problemów
   * @param scenario Bieżący scenariusz
   * @param flowSteps Kroki przepływu do sprawdzenia
   * @returns Tablica stringów z opisami wykrytych problemów
   */
  static validateScenario(scenario: any, flowSteps: any[]): string[] {
    const issues: string[] = [];
    
    // Pobierz stan aplikacji aby użyć go poza komponentem React
    const { getContext, getContextPath } = useAppStore.getState();
    const context = getContext();
    
    if (!scenario) {
      issues.push("Brak aktywnego scenariusza");
      return issues;
    }
    
    if (!flowSteps || flowSteps.length === 0) {
      issues.push("Scenariusz nie zawiera żadnych kroków");
      return issues;
    }
    
    // Sprawdź zależności między krokami
    const contextPaths = new Set<string>();
    
    // Zbierz wszystkie ścieżki kontekstowe generowane przez kroki
    flowSteps.forEach(step => {
      if (step.contextPath) {
        contextPaths.add(step.contextPath);
      }
    });
    
    // Sprawdź każdy krok pod kątem problemów
    flowSteps.forEach((step, index) => {
      // Sprawdź kroki LLM pod kątem szablonów i brakujących zmiennych
      if (step.templateId === "llm-query") {
        this.validateLlmStep(step, index, issues, context, getContextPath);
      }
      
      // Sprawdź kroki formularzy
      if (step.templateId === "form-step") {
        this.validateFormStep(step, index, issues, getContextPath);
      }
      
      // Sprawdź ogólnie brakujące dane wejściowe
      this.validateStepInputs(step, index, issues, contextPaths);
    });
    
    return issues;
  }
  
  /**
   * Sprawdza krok LLM pod kątem potencjalnych problemów
   */
  private static validateLlmStep(
    step: any, 
    index: number, 
    issues: string[], 
    context: any,
    getContextPath: (path: string) => any
  ): void {
    // Sprawdź czy schemat istnieje
    const schemaPath = step.attrs?.schemaPath || step.attrs?.llmSchemaPath;
    if (schemaPath) {
      let schema: any = null;
      
      // Sprawdź nowy format ścieżki
      if (step.attrs?.schemaPath) {
        let resolvedPath = step.attrs.schemaPath;
        if (!resolvedPath.startsWith("schemas.llm.")) {
          resolvedPath = `schemas.llm.${resolvedPath}`;
        }
        schema = getContextPath(resolvedPath);
      }
      
      // Jeśli nie znaleziono, sprawdź stary format
      if (!schema && step.attrs?.llmSchemaPath) {
        let legacyPath = step.attrs.llmSchemaPath;
        if (!legacyPath.startsWith("llmSchemas.")) {
          legacyPath = `llmSchemas.${legacyPath}`;
        }
        schema = getContextPath(legacyPath);
      }
      
      if (!schema) {
        issues.push(`Krok ${index + 1} (${step.label || 'LLM'}): Nie znaleziono schematu LLM pod ścieżką ${schemaPath}`);
      }
    }
    
    // Sprawdź wiadomość początkową pod kątem zmiennych
    if (step.attrs?.initialUserMessage) {
      const initialMsg = step.attrs.initialUserMessage;
      const templateVars = initialMsg.match(/\{\{([^}]+)\}\}/g) || [];
      
      templateVars.forEach(variable => {
        const path = variable.replace(/\{\{|\}\}/g, '').trim();
        const value = getContextPath(path);
        
        if (value === undefined || value === null) {
          issues.push(`Krok ${index + 1} (${step.label || 'LLM'}): Brakująca zmienna kontekstowa: ${path}`);
        }
      });
      
      // Sprawdź dodatkowo czy auto-starting LLM ma wszystkie potrzebne dane
      if (step.attrs.autoStart === true && templateVars.length > 0 && issues.length > 0) {
        issues.push(`Krok ${index + 1} (${step.label || 'LLM'}): Auto-start może nie działać z powodu brakujących zmiennych`);
      }
    }
  }
  
  /**
   * Sprawdza krok formularza pod kątem potencjalnych problemów
   */
  private static validateFormStep(
    step: any, 
    index: number, 
    issues: string[], 
    getContextPath: (path: string) => any
  ): void {
    // Sprawdź czy schemat formularza istnieje
    const schemaPath = step.attrs?.schemaPath || step.attrs?.formSchemaPath;
    if (schemaPath) {
      let schema: any = null;
      
      // Sprawdź nowy format ścieżki
      if (step.attrs?.schemaPath) {
        let resolvedPath = step.attrs.schemaPath;
        if (!resolvedPath.startsWith("schemas.form.")) {
          resolvedPath = `schemas.form.${resolvedPath}`;
        }
        schema = getContextPath(resolvedPath);
      }
      
      // Jeśli nie znaleziono, sprawdź stary format
      if (!schema && step.attrs?.formSchemaPath) {
        let legacyPath = step.attrs.formSchemaPath;
        if (!legacyPath.startsWith("formSchemas.")) {
          legacyPath = `formSchemas.${legacyPath}`;
        }
        schema = getContextPath(legacyPath);
      }
      
      if (!schema) {
        issues.push(`Krok ${index + 1} (${step.label || 'Formularz'}): Nie znaleziono schematu formularza pod ścieżką ${schemaPath}`);
      }
    }
  }
  
  /**
   * Ogólna walidacja zależności między krokami
   */
  private static validateStepInputs(
    step: any, 
    index: number, 
    issues: string[],
    contextPaths: Set<string>
  ): void {
    // Sprawdź czy wiadomość asystenta zawiera zmienne szablonowe
    if (step.assistantMessage) {
      const templateVars = step.assistantMessage.match(/\{\{([^}]+)\}\}/g) || [];
      
      templateVars.forEach(variable => {
        const path = variable.replace(/\{\{|\}\}/g, '').trim();
        
        // Sprawdź czy ścieżka jest generowana przez jakikolwiek wcześniejszy krok
        if (!contextPaths.has(path.split('.')[0])) {
          issues.push(`Krok ${index + 1} (${step.label || 'Step'}): Wiadomość asystenta używa ścieżki "${path}", która nie jest generowana przez żaden krok`);
        }
      });
    }
  }
}