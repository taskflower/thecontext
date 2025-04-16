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
        contextPaths.add(step.contextPath.split('.')[0]); // Dodajemy tylko główną część ścieżki
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
      this.validateStepInputs(step, index, issues, contextPaths, flowSteps);
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
      let missingVars: string[] = [];
      
      templateVars.forEach(variable => {
        const path = variable.replace(/\{\{|\}\}/g, '').trim();
        const value = getContextPath(path);
        
        if (value === undefined || value === null) {
          issues.push(`Krok ${index + 1} (${step.label || 'LLM'}): Brakująca zmienna kontekstowa: ${path}`);
          missingVars.push(path);
        }
      });
      
      // Sprawdź dodatkowo czy auto-starting LLM ma wszystkie potrzebne dane
      if (step.attrs.autoStart === true && templateVars.length > 0 && missingVars.length > 0) {
        issues.push(`Krok ${index + 1} (${step.label || 'LLM'}): Auto-start nie zadziała z powodu brakujących zmiennych: ${missingVars.join(', ')}`);
      }
    }
    
    // Sprawdź dodatkowo wymagane dane dla auto-startu
    if (step.attrs?.autoStart === true) {
      // Jeśli nie ma wiadomości początkowej lub jest pusta, to auto-start wymaga ścieżki primaryWebAnalysing
      if (!step.attrs?.initialUserMessage || step.attrs.initialUserMessage.trim() === '') {
        const webContext = getContextPath('primaryWebAnalysing');
        if (!webContext || !webContext.www) {
          issues.push(`Krok ${index + 1} (${step.label || 'LLM'}): Auto-start wymaga kontekstu 'primaryWebAnalysing.www', który jest niedostępny`);
        }
      }
      
      // Sprawdź stan kontekstu pod ścieżką kroku - czy już istnieją dane
      if (step.contextPath) {
        const stepData = getContextPath(step.contextPath);
        if (stepData && Object.keys(stepData).length > 0) {
          issues.push(`Krok ${index + 1} (${step.label || 'LLM'}): Auto-start może nie być potrzebny - dane już istnieją pod ścieżką ${step.contextPath}`);
        }
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
          resolvedPath = resolvedPath.startsWith("schemas.")
            ? resolvedPath
            : `schemas.form.${resolvedPath}`;
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
    
    // Sprawdź czy wartości domyślne formularza są dostępne w kontekście
    if (step.contextPath) {
      const contextValue = getContextPath(step.contextPath);
      
      // Jeśli dane już istnieją w kontekście, sprawdź czy zawierają wszystkie pola wymagane
      if (contextValue && typeof contextValue === 'object') {
        // Próba pobrania schematu formularza z wszystkich możliwych miejsc
        let formSchema: any[] = [];
        const possibleSchemaPath = step.attrs?.schemaPath || step.attrs?.formSchemaPath;
        
        if (possibleSchemaPath) {
          // Sprawdź różne formaty ścieżek
          const paths = [
            possibleSchemaPath,
            `schemas.form.${possibleSchemaPath}`,
            `formSchemas.${possibleSchemaPath}`
          ];
          
          for (const path of paths) {
            const schema = getContextPath(path);
            if (schema && Array.isArray(schema)) {
              formSchema = schema;
              break;
            }
          }
        }
        
        // Jeśli znaleziono schemat, sprawdź czy wszystkie wymagane pola mają wartości
        if (formSchema.length > 0) {
          const missingRequiredFields = formSchema
            .filter(field => field.required)
            .filter(field => {
              const fieldPath = field.name.split('.');
              let current = contextValue;
              
              // Sprawdź zagnieżdżone ścieżki
              for (const key of fieldPath) {
                if (current === undefined || current === null) return true;
                current = current[key];
              }
              
              return current === undefined || current === null || current === '';
            })
            .map(field => field.name);
          
          if (missingRequiredFields.length > 0) {
            issues.push(`Krok ${index + 1} (${step.label || 'Formularz'}): Brakuje wartości dla wymaganych pól: ${missingRequiredFields.join(', ')}`);
          }
        }
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
    contextPaths: Set<string>,
    flowSteps: any[] // Dodany parametr flowSteps
  ): void {
    // Sprawdź czy wiadomość asystenta zawiera zmienne szablonowe
    if (step.assistantMessage) {
      const templateVars = step.assistantMessage.match(/\{\{([^}]+)\}\}/g) || [];
      
      templateVars.forEach(variable => {
        const path = variable.replace(/\{\{|\}\}/g, '').trim();
        const rootPath = path.split('.')[0];
        
        // Sprawdź czy ścieżka jest generowana przez jakikolwiek wcześniejszy krok
        if (!contextPaths.has(rootPath)) {
          issues.push(`Krok ${index + 1} (${step.label || 'Step'}): Wiadomość asystenta używa ścieżki "${path}", której część główna "${rootPath}" nie jest generowana przez żaden krok`);
        }
      });
    }
    
    // Sprawdź czy jest ustawiona ścieżka kontekstowa dla kroku
    if (!step.contextPath && !step.contextKey) {
      issues.push(`Krok ${index + 1} (${step.label || 'Step'}): Brak zdefiniowanej ścieżki kontekstowej (contextPath lub contextKey)`);
    }
    
    // Dodatkowe sprawdzenie dla kroków z auto-startem
    if (step.templateId === "llm-query" && step.attrs?.autoStart === true) {
      // Sprawdź czy kolejny krok istnieje
      if (index < flowSteps.length - 1) {
        const nextStep = flowSteps[index + 1];
        
        // Sprawdź czy wiadomość asystenta w następnym kroku zawiera odwołania do danych tego kroku
        if (nextStep.assistantMessage) {
          const rootContextKey = step.contextPath ? step.contextPath.split('.')[0] : step.contextKey;
          
          if (rootContextKey && nextStep.assistantMessage.includes(`{{${rootContextKey}`)) {
            issues.push(`Krok ${index + 2} (${nextStep.label || 'Step'}): Ten krok może nie mieć dostępu do danych z poprzedniego kroku z auto-startem (${step.label || 'LLM'})`);
          }
        }
      }
    }
  }
}