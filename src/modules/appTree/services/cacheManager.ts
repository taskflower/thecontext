// src/modules/appTree/services/cacheManager.ts
import { configDB } from "@/provideDB/indexedDB/config";

interface AppConfig {
  name: string;
  tplDir: string;
  defaultWorkspace: string;
  defaultScenario: string;
  workspaces?: string[];
}

interface NodeInfo {
  slug: string;
  label: string;
  order: number;
  tplFile: string;
}

interface ScenarioInfo {
  slug: string;
  name: string;
  nodes: NodeInfo[];
}

interface WorkspaceInfo {
  slug: string;
  name: string;
  scenarios: ScenarioInfo[];
}

export class CacheManager {
  private configName: string;

  constructor(configName: string) {
    this.configName = configName;
  }

  async syncCacheWithConfig(appConfig: AppConfig): Promise<void> {
    try {
      // 1. Sync workspaces (using appConfig parameter)
      await this.syncWorkspaces(appConfig);
      
      // 2. Sync scenarios
      await this.syncScenarios();
      
      console.log(`✅ Cache synced for ${this.configName}`);
    } catch (error) {
      console.error("Cache sync error:", error);
      throw error;
    }
  }

  private async syncWorkspaces(_appConfig: AppConfig): Promise<void> {
    const workspaceModules = import.meta.glob<{ name?: string }>(
      "/src/_configs/*/workspaces/*.json",
      { eager: true, as: "json" }
    );

    const workspaceEntries = Object.entries(workspaceModules).filter(
      ([filePath]) => filePath.startsWith(`/src/_configs/${this.configName}/workspaces/`)
    );

    for (const [filePath, module] of workspaceEntries) {
      const match = filePath.match(/\/workspaces\/([^/]+)\.json$/);
      if (!match) continue;

      const slug = match[1];
      const cacheKey = `${this.configName}:/src/_configs/${this.configName}/workspaces/${slug}.json`;
      
      const existing = await configDB.records.get(cacheKey);
      if (!existing) {
        await configDB.records.put({
          id: cacheKey,
          data: {
            slug,
            name: module.name || slug,
            templateSettings: { layoutFile: "Simple", widgets: [] },
            contextSchema: {}
          },
          updatedAt: new Date(),
        });
      }
    }
  }

  private async syncScenarios(): Promise<void> {
    const scenarioModules = import.meta.glob<{
      slug?: string;
      name?: string;
      nodes?: NodeInfo[];
    }>("/src/_configs/*/scenarios/*/*.json", { eager: true, as: "json" });

    const scenarioEntries = Object.entries(scenarioModules).filter(
      ([filePath]) => filePath.startsWith(`/src/_configs/${this.configName}/scenarios/`)
    );

    for (const [filePath, module] of scenarioEntries) {
      const match = filePath.match(/\/scenarios\/([^/]+)\/([^/]+)\.json$/);
      if (!match) continue;

      const [, workspaceSlug, scenarioSlug] = match;
      const cacheKey = `${this.configName}:/src/_configs/${this.configName}/scenarios/${workspaceSlug}/${scenarioSlug}.json`;
      
      const existing = await configDB.records.get(cacheKey);
      if (!existing) {
        await configDB.records.put({
          id: cacheKey,
          data: {
            slug: scenarioSlug,
            name: module.name || scenarioSlug,
            nodes: module.nodes || []
          },
          updatedAt: new Date(),
        });
      }
    }
  }

  async loadWorkspacesFromCache(): Promise<WorkspaceInfo[]> {
    const allRecords = await configDB.records.toArray();
    const configRecords = allRecords.filter(record => 
      record.id.startsWith(`${this.configName}:`)
    );

    const workspaces: Record<string, WorkspaceInfo> = {};

    // Load workspaces
    const workspaceRecords = configRecords.filter(record =>
      record.id.includes('/workspaces/')
    );

    workspaceRecords.forEach(record => {
      const match = record.id.match(/\/workspaces\/([^/]+)\.json$/);
      if (match) {
        const slug = match[1];
        workspaces[slug] = {
          slug,
          name: record.data.name || slug,
          scenarios: []
        };
      }
    });

    // Load scenarios
    const scenarioRecords = configRecords.filter(record =>
      record.id.includes('/scenarios/')
    );

    scenarioRecords.forEach(record => {
      const match = record.id.match(/\/scenarios\/([^/]+)\/([^/]+)\.json$/);
      if (match) {
        const [, workspaceSlug, scenarioSlug] = match;
        
        if (!workspaces[workspaceSlug]) {
          workspaces[workspaceSlug] = {
            slug: workspaceSlug,
            name: workspaceSlug,
            scenarios: []
          };
        }

        workspaces[workspaceSlug].scenarios.push({
          slug: scenarioSlug,
          name: record.data.name || scenarioSlug,
          nodes: record.data.nodes || []
        });
      }
    });

    return Object.values(workspaces);
  }
}