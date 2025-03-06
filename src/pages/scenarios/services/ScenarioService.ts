// src/pages/scenarios/services/ScenarioService.ts
import { useScenarioStore, useDataStore, useTaskStore } from "@/store";
import { Scenario } from "@/types";

// Type for service results
type ServiceResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Type for scenario statistics
export type ScenarioStats = {
  totalTasks: number;
  completedTasks: number;
  progress: number;
};

class ScenarioService {
  // Get scenario statistics
  getScenarioStats(scenarioId: string): ScenarioStats {
    const { tasks } = useTaskStore.getState();
    
    // Filter tasks for this scenario
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

  // Get scenario by ID
  getScenarioById(id: string): Scenario | undefined {
    const { scenarios } = useScenarioStore.getState();
    return scenarios.find(scenario => scenario.id === id);
  }

  // Get scenario with calculated statistics
  getScenarioWithStats(id: string): (Scenario & ScenarioStats) | undefined {
    const scenario = this.getScenarioById(id);
    if (!scenario) return undefined;
    
    const stats = this.getScenarioStats(id);
    return {
      ...scenario,
      ...stats
    };
  }

  // Get all scenarios with calculated statistics
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

  // Get connected scenarios with stats
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

  // Create new scenario
  createScenario(title: string, description: string, dueDate: string): ServiceResult<Scenario> {
    if (!title.trim()) {
      return { success: false, error: "Title is required" };
    }

    try {
      const { addScenario } = useScenarioStore.getState();
      const { addFolder } = useDataStore.getState();
      
      // Create unique ID for scenario
      const id = crypto.randomUUID();
      
      // Create associated folder
      const folderResult = addFolder({
        id: crypto.randomUUID(),
        name: title,
        parentId: "scenarios" // Use the scenarios root folder
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

  // Update scenario
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

  // Delete scenario
  deleteScenario(id: string): ServiceResult {
    try {
      const { deleteScenario } = useScenarioStore.getState();
      const { deleteFolder } = useDataStore.getState();
      
      // Get scenario before deletion to access its folder
      const scenario = this.getScenarioById(id);
      if (!scenario) {
        return { success: false, error: "Scenario not found" };
      }
      
      // Delete associated folder if exists
      if (scenario.folderId) {
        const folderResult = deleteFolder(scenario.folderId);
        if (!folderResult.success) {
          return { success: false, error: folderResult.error || "Failed to delete folder" };
        }
      }
      
      // Remove scenario from store
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

  // Connect scenarios
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
      
      // Add connection
      const addResult = addConnection(sourceId, targetId);
      if (!addResult) {
        return { success: false, error: "Failed to create connection" };
      }
      
      // Update connection type
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

  // Remove connection between scenarios
  removeScenarioConnection(sourceId: string, targetId: string): ServiceResult {
    try {
      const { removeConnection } = useScenarioStore.getState();
      const sourceScenario = this.getScenarioById(sourceId);
      
      if (!sourceScenario) {
        return { success: false, error: "Source scenario not found" };
      }
      
      // Remove connection
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

// Create and export a singleton instance
const scenarioService = new ScenarioService();
export default scenarioService;