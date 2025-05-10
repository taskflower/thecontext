// src/hooks/useConfigManager.ts
import { useState } from "react";
import { ConfigManagerService } from "../services/ConfigManagerService";
import { AppConfig, NodeConfig, ScenarioConfig, WorkspaceConfig } from "@/core";

const configManagerService = new ConfigManagerService();

export const useConfigManager = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // === APLIKACJA ===

  const createApplication = async (appConfig: Partial<AppConfig>) => {
    try {
      setLoading(true);
      setError(null);
      const appId = await configManagerService.createApplication(appConfig);
      return appId;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateApplication = async (
    appId: string,
    appData: Partial<AppConfig>
  ) => {
    try {
      setLoading(true);
      setError(null);
      await configManagerService.updateApplication(appId, appData);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getApplication = async (appId: string) => {
    try {
      setLoading(true);
      setError(null);
      const app = await configManagerService.getApplication(appId);
      return app;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteApplication = async (appId: string) => {
    try {
      setLoading(true);
      setError(null);
      await configManagerService.deleteApplication(appId);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // === WORKSPACE ===

  const createWorkspace = async (
    appId: string,
    workspaceConfig: Partial<WorkspaceConfig>
  ) => {
    try {
      setLoading(true);
      setError(null);
      const workspaceId = await configManagerService.createWorkspace(
        appId,
        workspaceConfig
      );
      return workspaceId;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateWorkspace = async (
    workspaceId: string,
    workspaceData: Partial<WorkspaceConfig>
  ) => {
    try {
      setLoading(true);
      setError(null);
      await configManagerService.updateWorkspace(workspaceId, workspaceData);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getWorkspace = async (workspaceId: string) => {
    try {
      setLoading(true);
      setError(null);
      const workspace = await configManagerService.getWorkspace(workspaceId);
      return workspace;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getWorkspacesByAppId = async (appId: string) => {
    try {
      setLoading(true);
      setError(null);
      const workspaces = await configManagerService.getWorkspacesByAppId(appId);
      return workspaces;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const deleteWorkspace = async (workspaceId: string) => {
    try {
      setLoading(true);
      setError(null);
      await configManagerService.deleteWorkspace(workspaceId);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // === SCENARIUSZ ===

  const createScenario = async (
    appId: string,
    workspaceId: string,
    scenarioConfig: Partial<ScenarioConfig>
  ) => {
    try {
      setLoading(true);
      setError(null);
      const scenarioId = await configManagerService.createScenario(
        appId,
        workspaceId,
        scenarioConfig
      );
      return scenarioId;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateScenario = async (
    scenarioId: string,
    scenarioData: Partial<ScenarioConfig>
  ) => {
    try {
      setLoading(true);
      setError(null);
      await configManagerService.updateScenario(scenarioId, scenarioData);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getScenario = async (
    scenarioId: string,
    includeNodes: boolean = true
  ) => {
    try {
      setLoading(true);
      setError(null);
      const scenario = await configManagerService.getScenario(
        scenarioId,
        includeNodes
      );
      return scenario;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getScenariosByWorkspaceId = async (workspaceId: string) => {
    try {
      setLoading(true);
      setError(null);
      const scenarios = await configManagerService.getScenariosByWorkspaceId(
        workspaceId
      );
      return scenarios;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const deleteScenario = async (scenarioId: string) => {
    try {
      setLoading(true);
      setError(null);
      await configManagerService.deleteScenario(scenarioId);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // === NODE ===

  const createNode = async (
    scenarioId: string,
    nodeConfig: Partial<NodeConfig>
  ) => {
    try {
      setLoading(true);
      setError(null);
      const nodeId = await configManagerService.createNode(
        scenarioId,
        nodeConfig
      );
      return nodeId;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateNode = async (nodeId: string, nodeData: Partial<NodeConfig>) => {
    try {
      setLoading(true);
      setError(null);
      await configManagerService.updateNode(nodeId, nodeData);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getNode = async (nodeId: string) => {
    try {
      setLoading(true);
      setError(null);
      const node = await configManagerService.getNode(nodeId);
      return node;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getNodesByScenarioId = async (scenarioId: string) => {
    try {
      setLoading(true);
      setError(null);
      const nodes = await configManagerService.getNodesByScenarioId(scenarioId);
      return nodes;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const deleteNode = async (nodeId: string) => {
    try {
      setLoading(true);
      setError(null);
      await configManagerService.deleteNode(nodeId);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // === IMPORT/EXPORT ===

  const exportConfig = async (appId: string) => {
    try {
      setLoading(true);
      setError(null);
      const config = await configManagerService.exportConfig(appId);
      return config;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const importConfig = async (config: AppConfig) => {
    try {
      setLoading(true);
      setError(null);
      const appId = await configManagerService.importConfig(config);
      return appId;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (appId: string, config: AppConfig) => {
    try {
      setLoading(true);
      setError(null);
      await configManagerService.updateConfig(appId, config);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    // Stan
    loading,
    error,

    // Metody aplikacji
    createApplication,
    updateApplication,
    getApplication,
    deleteApplication,

    // Metody workspace
    createWorkspace,
    updateWorkspace,
    getWorkspace,
    getWorkspacesByAppId,
    deleteWorkspace,

    // Metody scenariusza
    createScenario,
    updateScenario,
    getScenario,
    getScenariosByWorkspaceId,
    deleteScenario,

    // Metody node
    createNode,
    updateNode,
    getNode,
    getNodesByScenarioId,
    deleteNode,

    // Metody importu/eksportu
    exportConfig,
    importConfig,
    updateConfig,
  };
};
