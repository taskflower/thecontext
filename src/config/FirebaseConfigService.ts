// src/config/FirebaseConfigService.ts
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "../provideDB/firebase/config";
import { AppConfig, WorkspaceConfig, ScenarioConfig, NodeConfig } from "../core/types";

export enum ConfigSource {
  LOCAL = "local",
  FIREBASE = "firebase"
}

export interface ConfigOptions {
  source: ConfigSource;
  appId?: string;
}

/**
 * Serwis do zarządzania konfiguracją aplikacji
 */
export class ConfigService {
  // Cache dla konfiguracji z Firebase
  private firebaseConfigCache: Map<string, { config: AppConfig, timestamp: number }> = new Map();
  // Cache dla lokalnej konfiguracji
  private localConfigCache: { config: AppConfig | null, timestamp: number } = { 
    config: null, 
    timestamp: 0 
  };
  
  // Czas ważności cache w milisekundach (5 minut)
  private cacheTTL = 5 * 60 * 1000;

  /**
   * Pobiera konfigurację z wybranego źródła
   */
  async getConfig(options: ConfigOptions): Promise<AppConfig> {
    console.log(`[ConfigService] Pobieranie konfiguracji - źródło: ${options.source}, appId: ${options.appId || 'brak'}`);
    
    switch (options.source) {
      case ConfigSource.LOCAL:
        return this.getLocalConfig();
      case ConfigSource.FIREBASE:
        if (!options.appId) {
          throw new Error("Identyfikator aplikacji jest wymagany dla Firebase");
        }
        return this.getFirebaseConfig(options.appId);
      default:
        throw new Error(`Nieobsługiwane źródło konfiguracji: ${options.source}`);
    }
  }

  /**
   * Pobiera lokalną konfigurację z importu
   */
  private async getLocalConfig(): Promise<AppConfig> {
    try {
      // Sprawdź cache
      const now = Date.now();
      if (this.localConfigCache.config && (now - this.localConfigCache.timestamp < this.cacheTTL)) {
        console.log("[ConfigService] Użyto lokalnej konfiguracji z cache");
        return this.localConfigCache.config;
      }

      let config;
      // Sprawdzamy, czy mamy predefiniowaną konfigurację z window
      if (window.__APP_CONFIG__) {
        console.log("[ConfigService] Użyto konfiguracji z window.__APP_CONFIG__");
        config = window.__APP_CONFIG__;
      } else {
        // Jeśli nie, importujemy domyślną konfigurację
        console.log("[ConfigService] Ładowanie domyślnej konfiguracji z pliku");
        const { default: importedConfig } = await import("../_configs/marketingApp/config");
        config = importedConfig;
      }

      // Aktualizuj cache
      this.localConfigCache = {
        config,
        timestamp: now
      };
      
      return config;
    } catch (error) {
      console.error("[ConfigService] Błąd ładowania lokalnej konfiguracji:", error);
      throw new Error("Nie można załadować konfiguracji lokalnej");
    }
  }
  
  /**
   * Pobiera konfigurację z Firebase
   */
  private async getFirebaseConfig(appId: string): Promise<AppConfig> {
    try {
      // Sprawdź cache
      const now = Date.now();
      const cachedConfig = this.firebaseConfigCache.get(appId);
      if (cachedConfig && (now - cachedConfig.timestamp < this.cacheTTL)) {
        console.log(`[ConfigService] Użyto konfiguracji z cache dla appId: ${appId}`);
        return cachedConfig.config;
      }

      console.log(`[ConfigService] Pobieranie konfiguracji z Firebase dla appId: ${appId}`);
      
      // 1. Pobieramy główny dokument aplikacji
      const appDocRef = doc(db, "app_applications", appId);
      const appDoc = await getDoc(appDocRef);

      if (!appDoc.exists()) {
        throw new Error(`Aplikacja o ID ${appId} nie istnieje`);
      }

      const appData = appDoc.data();
      console.log(`[ConfigService] Pobrano dane aplikacji: ${appData.name}`);

      // 2. Pobieramy wszystkie workspace'y dla tej aplikacji
      const workspacesQuery = query(
        collection(db, "app_workspaces"),
        where("appId", "==", appId)
      );
      const workspacesSnapshot = await getDocs(workspacesQuery);
      const workspaces: WorkspaceConfig[] = [];

      // Mapa przechowująca ID workspace'ów
      const workspaceIds = new Map<string, string>();

      workspacesSnapshot.forEach((workspaceDoc) => {
        const workspaceData = workspaceDoc.data() as any;
        const workspaceId = workspaceDoc.id;
        const workspaceSlug = `workspace-${workspaceId}`;
        
        // Zapisz ID workspace'a do mapy 
        workspaceIds.set(workspaceId, workspaceSlug);
        
        // Zapisujemy workspace z odpowiednim formatem
        workspaces.push({
          slug: workspaceSlug,
          name: workspaceData.name,
          description: workspaceData.description,
          icon: workspaceData.icon,
          contextSchema: this.parseJsonIfNeeded(workspaceData.contextSchema),
          templateSettings: this.parseJsonIfNeeded(workspaceData.templateSettings)
        });
      });

      console.log(`[ConfigService] Pobrano ${workspaces.length} workspace'ów: `, 
        workspaces.map(w => w.slug).join(', '));

      // 3. Pobieramy wszystkie scenariusze dla tej aplikacji
      const scenariosQuery = query(
        collection(db, "app_scenarios"),
        where("appId", "==", appId)
      );
      const scenariosSnapshot = await getDocs(scenariosQuery);
      const scenarios: ScenarioConfig[] = [];

      for (const scenarioDoc of scenariosSnapshot.docs) {
        const scenarioData = scenarioDoc.data() as any;
        const scenarioId = scenarioDoc.id;
        
        // Wyciągamy ID workspace'a z workspaceSlug
        let workspaceSlug = scenarioData.workspaceSlug;
        
        // Jeśli workspaceSlug nie jest w formacie "workspace-{id}", to znajdujemy właściwy slug
        if (!workspaceSlug.startsWith('workspace-')) {
          // Pobieramy ID workspace'a z zapytania
          const wQuery = query(
            collection(db, "app_workspaces"),
            where("slug", "==", workspaceSlug)
          );
          const wSnapshot = await getDocs(wQuery);
          if (!wSnapshot.empty) {
            workspaceSlug = `workspace-${wSnapshot.docs[0].id}`;
          }
        }
        
        // 4. Dla każdego scenariusza pobieramy jego nodes
        const nodesQuery = query(
          collection(db, "app_nodes"),
          where("scenarioId", "==", scenarioId)
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
            order: nodeData.order || 0,
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
          slug: `scenario-${scenarioId}`,
          workspaceSlug: workspaceSlug,  // Używamy właściwego sluga workspace'a
          name: scenarioData.name,
          description: scenarioData.description,
          icon: scenarioData.icon,
          systemMessage: scenarioData.systemMessage,
          nodes,
        });
      }

      console.log(`[ConfigService] Pobrano ${scenarios.length} scenariuszy`);

      // 5. Budujemy końcową konfigurację
      const config: AppConfig = {
        name: appData.name,
        description: appData.description,
        tplDir: appData.tplDir || "default",
        workspaces,
        scenarios,
      };

      // Zapisz do cache
      this.firebaseConfigCache.set(appId, {
        config,
        timestamp: now
      });

      console.log(`[ConfigService] Konfiguracja z Firebase załadowana pomyślnie: ${config.name}`);
      console.log(`[ConfigService] Workspaces: ${config.workspaces.map(w => w.slug).join(', ')}`);
      console.log(`[ConfigService] Scenarios: ${config.scenarios.map(s => s.slug).join(', ')}`);
      
      return config;
    } catch (error) {
      if (error instanceof Error) {
        console.error("[ConfigService] Błąd ładowania konfiguracji z Firebase:", error);
        throw new Error(
          `Nie można załadować konfiguracji z Firebase: ${error.message}`
        );
      } else {
        console.error("[ConfigService] Unknown error:", error);
        throw new Error("Nieznany błąd");
      }
    }
  }

  /**
   * Czyści cache konfiguracji
   */
  clearCache(appId?: string) {
    if (appId) {
      this.firebaseConfigCache.delete(appId);
    } else {
      this.firebaseConfigCache.clear();
      this.localConfigCache = { config: null, timestamp: 0 };
    }
    console.log(`[ConfigService] Cache wyczyszczony${appId ? ` dla appId: ${appId}` : ''}`);
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