/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/stepsPlugins/scenarioCreatorLLM/service/LLMDocumentService.ts
import { documentService } from '@/pages/documents/services';
import { useDataStore, useScenarioStore } from '@/store';

/**
 * Serwis odpowiedzialny za zapisywanie odpowiedzi LLM jako dokumentów
 */
export class LLMDocumentService {
  /**
   * Zapisuje odpowiedź LLM jako dokument w folderze scenariusza
   * 
   * @param llmResponse Odpowiedź wygenerowana przez LLM
   * @param prompt Prompt użyty do wygenerowania odpowiedzi
   * @param scenarioId ID scenariusza, dla którego zapisujemy dokument
   * @returns Informacja o powodzeniu operacji
   */
  public static saveResponseToDocument(
    llmResponse: any, 
    prompt: string, 
    scenarioId: string
  ): { success: boolean; error?: string } {
    try {
      // Zapewnij wymagane foldery
      this.ensureRequiredFolders();
      
      // Pobierz scenariusz po ID
      const scenario = useScenarioStore.getState().getScenarioById(scenarioId);
      
      // Jeśli scenariusz nie istnieje, użyj folderu głównego scenariuszy
      const folderId = scenario?.folderId || 'scenarios';
      
      // Przygotuj treść dokumentu
      const content = this.formatResponseContent(llmResponse, prompt);
      
      // Przygotuj tytuł dokumentu
      const timestamp = new Date().toLocaleString();
      const title = scenario 
        ? `LLM - ${scenario.title} - ${timestamp}`
        : `LLM Response - ${timestamp}`;
      
      // Przygotuj tagi
      const tags = ["llm-generated"];
      if (scenario?.title) {
        tags.push(scenario.title);
      }
      
      // Zapisz dokument
      const result = documentService.createDocument(
        title,
        content,
        tags,
        folderId
      );
      
      return result;
    } catch (error) {
      console.error("Błąd podczas zapisywania dokumentu:", error);
      return { 
        success: false, 
        error: `Błąd podczas zapisywania dokumentu: ${(error as Error).message}` 
      };
    }
  }
  
  /**
   * Zapisuje odpowiedź LLM jako dokument dla wielu scenariuszy
   * 
   * @param llmResponse Odpowiedź wygenerowana przez LLM
   * @param prompt Prompt użyty do wygenerowania odpowiedzi
   * @param scenarioIds Lista ID scenariuszy
   * @returns Liczba pomyślnie zapisanych dokumentów
   */
  public static saveResponseToMultipleDocuments(
    llmResponse: any,
    prompt: string,
    scenarioIds: string[]
  ): { successCount: number; errors: string[] } {
    const result = { successCount: 0, errors: [] };
    
    for (const scenarioId of scenarioIds) {
      const saveResult = this.saveResponseToDocument(llmResponse, prompt, scenarioId);
      
      if (saveResult.success) {
        result.successCount++;
      } else if (saveResult.error) {
        (result.errors as string[]).push(saveResult.error);
      }
    }
    
    return result;
  }
  
  /**
   * Formatuje odpowiedź LLM na zawartość dokumentu
   * 
   * @param llmResponse Odpowiedź wygenerowana przez LLM
   * @param prompt Prompt użyty do wygenerowania odpowiedzi
   * @returns Sformatowana treść dokumentu w formacie markdown
   */
  private static formatResponseContent(llmResponse: any, prompt: string): string {
    const timestamp = new Date().toLocaleString();
    
    let content = `# Zawartość wygenerowana przez LLM\n\n`;
    content += `**Data wygenerowania:** ${timestamp}\n`;
    content += `**Użyte zapytanie:** ${prompt}\n\n`;
    
    // Dodaj sekcję scenariuszy
    if (llmResponse.scenarios && llmResponse.scenarios.length > 0) {
      content += `## Scenariusze\n\n`;
      llmResponse.scenarios.forEach((scenario: any, index: number) => {
        content += `### ${index + 1}. ${scenario.title}\n`;
        content += `**Opis:** ${scenario.description || 'Brak opisu'}\n`;
        if (scenario.objective) {
          content += `**Cel:** ${scenario.objective}\n`;
        }
        content += `\n`;
      });
    }
    
    // Dodaj sekcję zadań
    if (llmResponse.tasks && llmResponse.tasks.length > 0) {
      content += `## Zadania\n\n`;
      llmResponse.tasks.forEach((task: any, index: number) => {
        content += `### ${index + 1}. ${task.title}\n`;
        content += `**Opis:** ${task.description || 'Brak opisu'}\n`;
        content += `**Priorytet:** ${task.priority || 'Nieokreślony'}\n`;
        content += `\n`;
      });
    }
    
    // Dodaj sekcję kroków
    if (llmResponse.steps && llmResponse.steps.length > 0) {
      content += `## Kroki\n\n`;
      llmResponse.steps.forEach((step: any, index: number) => {
        content += `### ${index + 1}. ${step.title}\n`;
        content += `**Opis:** ${step.description || 'Brak opisu'}\n`;
        content += `**Typ:** ${step.type || 'Nieokreślony'}\n`;
        content += `\n`;
      });
    }
    
    return content;
  }
  
  /**
   * Zapewnia istnienie wymaganych folderów
   */
  private static ensureRequiredFolders(): void {
    const dataStore = useDataStore.getState();
    
    // Sprawdź czy istnieje folder główny
    const rootFolder = dataStore.folders.find(f => f.id === 'root');
    if (!rootFolder) {
      dataStore.addFolder({
        id: 'root',
        name: 'Wszystkie dokumenty',
        parentId: null
      });
    }
    
    // Sprawdź czy istnieje folder scenariuszy
    const scenariosFolder = dataStore.folders.find(f => f.isScenarioRoot);
    if (!scenariosFolder) {
      dataStore.addFolder({
        id: 'scenarios',
        name: 'Scenariusze',
        parentId: 'root',
        isScenarioRoot: true
      });
    }
  }
}