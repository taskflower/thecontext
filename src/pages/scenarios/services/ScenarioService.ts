import { useScenarioStore, useDataStore, useTaskStore } from "@/store";
import { Scenario } from "@/types";

// Type dla wyników serwisu
type ServiceResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Type dla statystyk scenariusza
export type ScenarioStats = {
  totalTasks: number;
  completedTasks: number;
  progress: number;
};

class ScenarioService {
  // Pobieranie statystyk scenariusza
  getScenarioStats(scenarioId: string): ScenarioStats {
    const { tasks } = useTaskStore.getState();
    
    // Filtrowanie zadań dla tego scenariusza
    const scenarioTasks = tasks.filter(task => task.scenarioId === scenarioId);
    const completedTasks = scenarioTasks.filter(task => task.status === 'completed').length;
    const totalTasks = scenarioTasks.length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    return {
      totalTasks,
      completedTasks,
      progress
    };
  }

  // Pobieranie scenariusza po ID
  getScenarioById(id: string): Scenario | undefined {
    const { scenarios } = useScenarioStore.getState();
    return scenarios.find(scenario => scenario.id === id);
  }

  // Pobieranie zadań dla danego scenariusza
  getScenarioTasks(scenarioId: string) {
    const { tasks } = useTaskStore.getState();
    return tasks.filter(t => t.scenarioId === scenarioId);
  }

  // Pobieranie scenariusza z obliczonymi statystykami
  getScenarioWithStats(id: string): (Scenario & ScenarioStats) | undefined {
    const scenario = this.getScenarioById(id);
    if (!scenario) return undefined;
    
    const stats = this.getScenarioStats(id);
    return {
      ...scenario,
      ...stats
    };
  }

  // Pobieranie wszystkich scenariuszy z obliczonymi statystykami
  getAllScenariosWithStats(): (Scenario & ScenarioStats)[] {
    const { scenarios } = useScenarioStore.getState();
    return scenarios.map(scenario => {
      const stats = this.getScenarioStats(scenario.id);
      return {
        ...scenario,
        ...stats
      };
    });
  }

  // Pobieranie połączonych scenariuszy z statystykami
  getConnectedScenarios(scenarioId: string): (Scenario & ScenarioStats)[] {
    const { scenarios } = useScenarioStore.getState();
    const scenario = this.getScenarioById(scenarioId);
    
    if (!scenario || !scenario.connections || scenario.connections.length === 0) {
      return [];
    }
    
    return scenarios
      .filter(s => scenario.connections?.includes(s.id) || false)
      .map(s => {
        const stats = this.getScenarioStats(s.id);
        return {
          ...s,
          ...stats
        };
      });
  }

  // Tworzenie nowego scenariusza
  createScenario(title: string, description: string, dueDate: string): ServiceResult<Scenario> {
    if (!title.trim()) {
      return { success: false, error: "Title is required" };
    }

    try {
      const { addScenario } = useScenarioStore.getState();
      const { addFolder } = useDataStore.getState();
      
      // Tworzenie unikalnego ID dla scenariusza
      const id = crypto.randomUUID();
      
      // Tworzenie powiązanego folderu
      const folderResult = addFolder({
        id: crypto.randomUUID(),
        name: title,
        parentId: "scenarios" // Użyj głównego folderu scenariuszy
      });
      
      if (!folderResult.success) {
        return { success: false, error: folderResult.error || "Failed to create folder" };
      }
      
      const folderId = folderResult.data || null;
      
      const newScenario: Scenario = {
        id,
        title,
        description,
        dueDate,
        progress: 0,
        tasks: 0,
        completedTasks: 0,
        connections: [],
        connectionType: "related",
        folderId
      };
      
      addScenario(newScenario);
      return { success: true, data: newScenario };
    } catch (err) {
      console.error("Error creating scenario:", err);
      return { success: false, error: "Failed to create scenario" };
    }
  }

  // Aktualizacja scenariusza
  updateScenario(id: string, updates: Partial<Scenario>): ServiceResult<Scenario> {
    try {
      const { updateScenario } = useScenarioStore.getState();
      const currentScenario = this.getScenarioById(id);
      
      if (!currentScenario) {
        return { success: false, error: "Scenario not found" };
      }
      
      const updatedScenario = { ...currentScenario, ...updates };
      const result = updateScenario(id, updatedScenario);
      
      if (!result) {
        return { success: false, error: "Failed to update scenario" };
      }
      
      return { success: true, data: updatedScenario };
    } catch (err) {
      console.error("Error updating scenario:", err);
      return { success: false, error: "Failed to update scenario" };
    }
  }

  // Usuwanie scenariusza
  deleteScenario(id: string): ServiceResult {
    try {
      const { deleteScenario } = useScenarioStore.getState();
      const { deleteFolder } = useDataStore.getState();
      
      // Pobierz scenariusz przed usunięciem, aby uzyskać dostęp do jego folderu
      const scenario = this.getScenarioById(id);
      if (!scenario) {
        return { success: false, error: "Scenario not found" };
      }
      
      // Usuń powiązany folder, jeśli istnieje
      if (scenario.folderId) {
        const folderResult = deleteFolder(scenario.folderId);
        if (!folderResult.success) {
          return { success: false, error: folderResult.error || "Failed to delete folder" };
        }
      }
      
      // Usuń scenariusz ze store
      const result = deleteScenario(id);
      if (!result) {
        return { success: false, error: "Failed to delete scenario" };
      }
      
      return { success: true };
    } catch (err) {
      console.error("Error deleting scenario:", err);
      return { success: false, error: "Failed to delete scenario" };
    }
  }

  // Łączenie scenariuszy
  connectScenarios(
    sourceId: string, 
    targetId: string, 
    connectionType: string = "related"
  ): ServiceResult {
    try {
      const { addConnection, updateConnectionType } = useScenarioStore.getState();
      const sourceScenario = this.getScenarioById(sourceId);
      const targetScenario = this.getScenarioById(targetId);
      
      if (!sourceScenario || !targetScenario) {
        return { success: false, error: "One or both scenarios not found" };
      }
      
      // Dodaj połączenie
      const addResult = addConnection(sourceId, targetId);
      if (!addResult) {
        return { success: false, error: "Failed to create connection" };
      }
      
      // Aktualizuj typ połączenia
      const typeResult = updateConnectionType(sourceId, connectionType);
      if (!typeResult) {
        return { success: false, error: "Failed to set connection type" };
      }
      
      return { success: true };
    } catch (err) {
      console.error("Error connecting scenarios:", err);
      return { success: false, error: "Failed to connect scenarios" };
    }
  }

  // Usuwanie połączenia między scenariuszami
  removeScenarioConnection(sourceId: string, targetId: string): ServiceResult {
    try {
      const { removeConnection } = useScenarioStore.getState();
      const sourceScenario = this.getScenarioById(sourceId);
      
      if (!sourceScenario) {
        return { success: false, error: "Source scenario not found" };
      }
      
      // Usuń połączenie
      const result = removeConnection(sourceId, targetId);
      if (!result) {
        return { success: false, error: "Failed to remove connection" };
      }
      
      return { success: true };
    } catch (err) {
      console.error("Error removing connection:", err);
      return { success: false, error: "Failed to remove connection" };
    }
  }
}

// Utwórz i wyeksportuj singleton serwisu
const scenarioService = new ScenarioService();
export default scenarioService;