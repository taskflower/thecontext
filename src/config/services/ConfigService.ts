// src/services/ConfigService.ts
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../provideDB/firebase/config";
import {
  AppConfig,
  WorkspaceConfig,
  ScenarioConfig,
  NodeConfig,
} from "../../core/types";

export enum ConfigSource {
  LOCAL = "local",
  FIREBASE = "firebase",
}

export interface ConfigOptions {
  source: ConfigSource;
  appId?: string;
}

export class ConfigService {
  /**
   * Pobiera konfigurację z wybranego źródła
   */
  async getConfig(options: ConfigOptions): Promise<AppConfig> {
    switch (options.source) {
      case ConfigSource.LOCAL:
        return this.getLocalConfig();
      case ConfigSource.FIREBASE:
        if (!options.appId) {
          throw new Error("Identyfikator aplikacji jest wymagany dla Firebase");
        }
        return this.getFirebaseConfig(options.appId);
      default:
        throw new Error(
          `Nieobsługiwane źródło konfiguracji: ${options.source}`
        );
    }
  }

  /**
   * Pobiera lokalną konfigurację z importu
   */
  private async getLocalConfig(): Promise<AppConfig> {
    try {
      // Sprawdzamy, czy mamy predefiniowaną konfigurację z window
      if (window.__APP_CONFIG__) {
        return window.__APP_CONFIG__;
      }

      // Jeśli nie, importujemy domyślną konfigurację
      const { default: config } = await import(
        "../../_configs/marketingApp/config"
      );
      return config;
    } catch (error) {
      console.error("Błąd ładowania lokalnej konfiguracji:", error);
      throw new Error("Nie można załadować konfiguracji lokalnej");
    }
  }
  
  /**
   * Pobiera konfigurację z Firebase
   */
  private async getFirebaseConfig(appId: string): Promise<AppConfig> {
    try {
      // 1. Pobieramy główny dokument aplikacji
      const appDocRef = doc(db, "app_applications", appId);
      const appDoc = await getDoc(appDocRef);

      if (!appDoc.exists()) {
        throw new Error(`Aplikacja o ID ${appId} nie istnieje`);
      }

      const appData = appDoc.data();

      // 2. Pobieramy wszystkie workspace'y dla tej aplikacji
      const workspacesQuery = query(
        collection(db, "app_workspaces"),
        where("appId", "==", appId)
      );
      const workspacesSnapshot = await getDocs(workspacesQuery);
      const workspaces: WorkspaceConfig[] = [];

      workspacesSnapshot.forEach((doc) => {
        const workspaceData = doc.data() as Omit<WorkspaceConfig, "slug"> & {
          id: string;
        };
        workspaces.push({
          ...workspaceData,
          slug: `workspace-${doc.id}`, // Używamy ID dokumentu jako części sluga
          contextSchema: this.parseJsonIfNeeded(workspaceData.contextSchema),
        });
      });

      // 3. Pobieramy wszystkie scenariusze dla tej aplikacji
      const scenariosQuery = query(
        collection(db, "app_scenarios"),
        where("appId", "==", appId)
      );
      const scenariosSnapshot = await getDocs(scenariosQuery);
      const scenarios: ScenarioConfig[] = [];

      for (const scenarioDoc of scenariosSnapshot.docs) {
        const scenarioData = scenarioDoc.data() as any;

        // 4. Dla każdego scenariusza pobieramy jego nodes
        const nodesQuery = query(
          collection(db, "app_nodes"),
          where("scenarioId", "==", scenarioDoc.id)
        );
        const nodesSnapshot = await getDocs(nodesQuery);
        const nodes: NodeConfig[] = [];

        nodesSnapshot.forEach((nodeDoc) => {
          const nodeData = nodeDoc.data() as any;
          nodes.push({
            slug: `node-${nodeDoc.id}`,
            label: nodeData.label,
            contextSchemaPath: nodeData.contextSchemaPath,
            contextDataPath: nodeData.contextDataPath,
            tplFile: nodeData.tplFile,
            order: nodeData.order,
            attrs: nodeData.attrs
              ? this.parseJsonIfNeeded(nodeData.attrs)
              : undefined,
            saveToDB: nodeData.saveToDB
              ? this.parseJsonIfNeeded(nodeData.saveToDB)
              : undefined,
          });
        });

        // Sortowanie nodes według pola order
        nodes.sort((a, b) => a.order - b.order);

        scenarios.push({
          slug: `scenario-${scenarioDoc.id}`,
          workspaceSlug: scenarioData.workspaceSlug,
          name: scenarioData.name,
          description: scenarioData.description,
          icon: scenarioData.icon,
          systemMessage: scenarioData.systemMessage,
          nodes,
        });
      }

      // 5. Budujemy końcową konfigurację
      const config: AppConfig = {
        name: appData.name,
        description: appData.description,
        tplDir: appData.tplDir || "default",
        workspaces,
        scenarios,
      };

      return config;
    } catch (error) {
      if (error instanceof Error) {
        console.error("Błąd ładowania konfiguracji z Firebase:", error);
        throw new Error(
          `Nie można załadować konfiguracji z Firebase: ${error.message}`
        );
      } else {
        console.error("Unknown error:", error);
        throw new Error("Nieznany błąd");
      }
    }
  }

  /**
   * Pomocnicza funkcja parsująca JSON jeśli wartość jest stringiem
   */
  private parseJsonIfNeeded(value: any): any {
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    }
    return value;
  }
}

// Deklaracja dla globalnej zmiennej konfiguracyjnej
declare global {
  interface Window {
    __APP_CONFIG__?: AppConfig;
  }
}

// Singleton instancja serwisu
export const configService = new ConfigService();
