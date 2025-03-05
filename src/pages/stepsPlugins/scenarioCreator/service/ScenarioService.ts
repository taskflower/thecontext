/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/ScenarioService.ts
import { Scenario, Folder, ConnectionType } from '@/types';
import { useDataStore } from '@/store';

/**
 * Serwis do zarządzania scenariuszami w aplikacji
 * Enkapsuluje logikę biznesową i zapewnia spójny interfejs do operacji na scenariuszach
 */
export class ScenarioService {
  
  /**
   * Tworzy nowy scenariusz wraz z przypisanym folderem
   * 
   * @param scenarioData dane scenariusza
   * @param folderName opcjonalna nazwa folderu, domyślnie używa tytułu scenariusza
   * @returns obiekt zawierający ID utworzonego scenariusza i ID utworzonego folderu
   */
  public static createScenarioWithFolder(
    scenarioData: Partial<Scenario>, 
    folderName?: string
  ): { scenarioId: string, folderId: string } {
    const store = useDataStore.getState();
    
    // 1. Wygeneruj unikalne identyfikatory
    const folderId = this.generateUniqueId('folder');
    const scenarioId = this.generateUniqueId('scenario');
    
    // 2. Utwórz folder dla scenariusza
    const folderToCreate: Folder = {
      id: folderId,
      name: folderName || `${scenarioData.title || 'New Scenario'}`,
      parentId: 'scenarios', // Folder główny dla scenariuszy
      isScenarioFolder: true  // Oznacz jako folder scenariusza
    };
    
    store.addFolder(folderToCreate);
    
    // 3. Utwórz scenariusz z danymi domyślnymi
    // const now = new Date().toISOString();
    const defaultDueDate = this.generateDueDate();
    
    const scenarioToCreate: Scenario = {
      id: scenarioId,
      title: scenarioData.title || 'New Scenario',
      description: scenarioData.description || '',
      objective: scenarioData.objective || '',
      progress: 0,
      tasks: 0,
      completedTasks: 0,
      dueDate: scenarioData.dueDate || defaultDueDate,
      folderId: folderId,
      connections: scenarioData.connections || [],
      connectionType: scenarioData.connectionType,

      ...scenarioData, // Pozostałe pola z przekazanych danych
    };
    
    store.addScenario(scenarioToCreate);
    
    console.log(`Created scenario "${scenarioToCreate.title}" with folder "${folderToCreate.name}"`);
    
    return { scenarioId, folderId };
  }
  
  /**
   * Tworzy połączenie między dwoma scenariuszami
   * 
   * @param sourceId ID scenariusza źródłowego
   * @param targetId ID scenariusza docelowego
   * @param type typ połączenia
   */
  public static createConnection(
    sourceId: string, 
    targetId: string, 
    type: ConnectionType = 'related'
  ): void {
    const store = useDataStore.getState();
    store.addScenarioConnection(sourceId, targetId, type);
    console.log(`Created connection from "${sourceId}" to "${targetId}" of type "${type}"`);
  }
  
  /**
   * Tworzy grupę powiązanych scenariuszy na podstawie szablonów
   * 
   * @param templates szablony scenariuszy do utworzenia
   * @param projectPrefix przedrostek dla nazw folderów projektów
   * @param statusCallback opcjonalny callback do aktualizacji statusu tworzenia
   * @returns lista utworzonych scenariuszy
   */
  public static async createScenarioGroup(
    templates: any[], 
    projectPrefix: string = 'Project',
    statusCallback?: (id: string, status: 'pending' | 'success' | 'error') => void
  ): Promise<Scenario[]> {
    const createdScenarios: Scenario[] = [];
    const idMapping: Record<string, string> = {};
    
    // 1. Utwórz wszystkie scenariusze (bez połączeń)
    for (const template of templates) {
      try {
        if (statusCallback) {
          statusCallback(template.id, 'pending');
        }
        
        // Utwórz scenariusz z folderem
        const folderName = `${projectPrefix}: ${template.title}`;
        const { scenarioId } = this.createScenarioWithFolder(
          {
            title: template.title,
            description: template.description,
            objective: template.objective
          },
          folderName
        );
        
        // Zapisz mapowanie ID szablonu do rzeczywistego ID
        idMapping[template.id] = scenarioId;
        
        // Pobierz utworzony scenariusz
        const store = useDataStore.getState();
        const createdScenario = store.getScenarioById(scenarioId);
        
        if (createdScenario) {
          createdScenarios.push(createdScenario);
        }
        
        if (statusCallback) {
          statusCallback(template.id, 'success');
        }
        
        // Symulacja opóźnienia dla lepszego UX
        await this.delay(300);
        
      } catch (error) {
        console.error(`Error creating scenario from template: ${template.id}`, error);
        if (statusCallback) {
          statusCallback(template.id, 'error');
        }
      }
    }
    
    // 2. Utwórz połączenia między scenariuszami
    for (const template of templates) {
      if (template.connections && Array.isArray(template.connections)) {
        for (const connectionId of template.connections) {
          // Sprawdź, czy oba scenariusze zostały utworzone
          if (idMapping[template.id] && idMapping[connectionId]) {
            this.createConnection(
              idMapping[template.id],
              idMapping[connectionId],
              'related'
            );
          }
        }
      }
    }
    
    return createdScenarios;
  }
  
  /**
   * Usuwa scenariusz wraz z jego folderem
   * 
   * @param scenarioId ID scenariusza do usunięcia
   */
  public static deleteScenario(scenarioId: string): void {
    const store = useDataStore.getState();
    const scenario = store.getScenarioById(scenarioId);
    
    if (!scenario) {
      console.warn(`Cannot delete scenario: Scenario with ID ${scenarioId} not found`);
      return;
    }
    
    // Usuń scenariusz (spowoduje również usunięcie folderu)
    store.deleteScenario(scenarioId);
    console.log(`Deleted scenario "${scenario.title}" with ID ${scenarioId}`);
  }
  
  /**
   * Generuje unikalny identyfikator z określonym przedrostkiem
   * 
   * @param prefix przedrostek identyfikatora
   * @returns unikalny identyfikator
   */
  private static generateUniqueId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
  
  /**
   * Generuje datę terminu (domyślnie 30 dni od teraz)
   * 
   * @param daysFromNow liczba dni od teraz
   * @returns data w formacie ISO string (tylko data, bez czasu)
   */
  private static generateDueDate(daysFromNow: number = 30): string {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split('T')[0];
  }
  
  /**
   * Pomocnicza metoda do wprowadzania opóźnień
   * 
   * @param ms liczba milisekund do opóźnienia
   * @returns Promise rozwiązywany po upływie określonego czasu
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default ScenarioService;