/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/stepsPlugins/scenarioCreatorLLM/service/ScenarioService.ts
import { Scenario } from '@/types';
import { useScenarioStore } from '@/store';
import { FolderService } from './FolderService';
import { UtilityService } from './UtilityService';

export class ScenarioService {
  /**
   * Tworzy scenariusze na podstawie danych LLM
   */
  public static async createScenarios(
    scenariosData: any[], 
    projectPrefix: string,
    scenarioMapping: Record<string, string>
  ): Promise<Scenario[]> {
    const scenarios: Scenario[] = [];
    const scenarioStore = useScenarioStore.getState();
    
    if (!scenariosData || !Array.isArray(scenariosData)) {
      console.log("[ScenarioService] Brak scenariuszy w danych LLM");
      return scenarios;
    }
    
    // Tworzenie scenariuszy
    for (const scenarioData of scenariosData) {
      try {
        // Tworzenie folderu dla scenariusza
        const folder = await FolderService.createFolder(
          `${projectPrefix}: ${scenarioData.title}`,
          'scenarios'
        );
        
        if (!folder) {
          console.error(`[ScenarioService] Nie udało się utworzyć folderu dla scenariusza: ${scenarioData.title}`);
          continue;
        }
        
        // Generowanie unikalnego ID
        const scenarioId = `scenario-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        // Tworzenie scenariusza
        const scenario: Scenario = {
          id: scenarioId,
          title: scenarioData.title,
          description: scenarioData.description || '',
          objective: scenarioData.objective || '',
          progress: 0,
          tasks: 0,
          completedTasks: 0,
          connections: [],
          dueDate: UtilityService.generateDueDate(30),
          folderId: folder.id
        };
        
        // Mapowanie oryginalnego ID na faktyczne ID
        scenarioMapping[scenarioData.id] = scenario.id;
        
        // Dodawanie do store'a
        scenarioStore.addScenario(scenario);
        scenarios.push(scenario);
        
        await UtilityService.delay(50);
      } catch (error) {
        console.error(`[ScenarioService] Błąd tworzenia scenariusza: ${error}`);
      }
    }
    
    // Tworzenie połączeń między scenariuszami
    this.createScenarioConnections(scenariosData, scenarioMapping);
    
    return scenarios;
  }
  
  /**
   * Tworzy połączenia między scenariuszami
   */
  private static createScenarioConnections(
    scenariosData: any[],
    scenarioMapping: Record<string, string>
  ): void {
    const scenarioStore = useScenarioStore.getState();
    
    for (const scenarioData of scenariosData) {
      if (scenarioData.connections && Array.isArray(scenarioData.connections)) {
        for (const connectionRef of scenarioData.connections) {
          const sourceId = scenarioMapping[scenarioData.id];
          const targetId = scenarioMapping[connectionRef];
          
          if (sourceId && targetId) {
            scenarioStore.addConnection(sourceId, targetId);
          }
        }
      }
    }
  }
}
