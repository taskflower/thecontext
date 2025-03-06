/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/stepsPlugins/scenarioCreatorLLM/service/ScenarioBuilderService.ts
import { Scenario, Task, Step } from '@/types';
import { ScenarioService } from './ScenarioService';
import { TaskService } from './TaskService';
import { StepService } from './StepService';
import { UtilityService } from './UtilityService';

/**
 * Główna usługa koordynująca tworzenie scenariuszy, zadań i kroków
 */
class ScenarioBuilderService {
  /**
   * Tworzy scenariusze, zadania i kroki na podstawie danych LLM
   * 
   * @param llmData Dane wygenerowane przez LLM
   * @param projectPrefix Prefiks nazw folderów
   * @returns Utworzone scenariusze, zadania i kroki
   */
  public static async createFromLLMData(
    llmData: any,
    projectPrefix: string = 'LLM Campaign'
  ): Promise<{
    scenarios: Scenario[];
    tasks: Task[];
    steps: Step[];
  }> {
    // Inicjalizacja wyniku
    const result = {
      scenarios: [] as Scenario[],
      tasks: [] as Task[],
      steps: [] as Step[]
    };
    
    // Mapowanie referencji scenariuszy i zadań na faktyczne ID
    const scenarioMapping: Record<string, string> = {};
    const taskMapping: Record<string, string> = {};
    
    console.log("[ScenarioBuilder] Przetwarzanie danych LLM");
    
    // 1. Tworzenie scenariuszy
    result.scenarios = await ScenarioService.createScenarios(
      llmData.scenarios || [], 
      projectPrefix, 
      scenarioMapping
    );
    
    // Opóźnienie dla pewności, że scenariusze zostały zapisane
    await UtilityService.delay(200);
    
    // 2. Tworzenie zadań dla scenariuszy
    if (llmData.tasks && llmData.tasks.length > 0) {
      result.tasks = await TaskService.createTasks(
        llmData.tasks,
        scenarioMapping,
        taskMapping
      );
    } else {
      // Generowanie domyślnych zadań
      result.tasks = await TaskService.createDefaultTasks(
        result.scenarios,
        taskMapping
      );
    }
    
    // Opóźnienie dla pewności, że zadania zostały zapisane
    await UtilityService.delay(200);
    
    // 3. Tworzenie kroków dla zadań
    if (llmData.steps && llmData.steps.length > 0) {
      result.steps = await StepService.createSteps(
        llmData.steps,
        taskMapping
      );
    } else {
      // Generowanie domyślnych kroków
      result.steps = await StepService.createDefaultSteps(result.tasks);
    }
    
    return result;
  }
}

export default ScenarioBuilderService;