// src/services/ConfigManagerService.ts
import {
  collection,
  addDoc,
  setDoc,
  getDoc,
  doc,
  deleteDoc,
  updateDoc,
  query,
  where,
  getDocs,
  Firestore,
} from "firebase/firestore";
import { db } from "../provideDB/firebase/config";
import {
  AppConfig,
  WorkspaceConfig,
  ScenarioConfig,
  NodeConfig,
} from "../core/types";

/**
 * Serwis do zarządzania konfiguracją aplikacji w Firebase
 */
export class ConfigManagerService {
  private db: Firestore;

  constructor(firestoreDb?: Firestore) {
    this.db = firestoreDb || db;
  }

  // ===== APLIKACJA =====

  /**
   * Tworzy nową aplikację w Firebase
   */
  async createApplication(appConfig: Partial<AppConfig>): Promise<string> {
    try {
      const appData = {
        name: appConfig.name || "Nowa aplikacja",
        description: appConfig.description || "",
        tplDir: appConfig.tplDir || "default",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const docRef = await addDoc(
        collection(this.db, "app_applications"),
        appData
      );
      console.log("Aplikacja utworzona z ID:", docRef.id);
      return docRef.id;
    } catch (error: any) {
      console.error("Błąd podczas tworzenia aplikacji:", error);
      throw new Error(`Nie udało się utworzyć aplikacji: ${error.message}`);
    }
  }

  /**
   * Aktualizuje istniejącą aplikację
   */
  async updateApplication(
    appId: string,
    appData: Partial<AppConfig>
  ): Promise<void> {
    try {
      const updateData = {
        ...appData,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(doc(this.db, "app_applications", appId), updateData);
      console.log("Aplikacja zaktualizowana:", appId);
    } catch (error: any) {
      console.error("Błąd podczas aktualizacji aplikacji:", error);
      throw new Error(
        `Nie udało się zaktualizować aplikacji: ${error.message}`
      );
    }
  }

  /**
   * Pobiera aplikację według ID
   */
  async getApplication(appId: string): Promise<any> {
    try {
      const appDoc = await getDoc(doc(this.db, "app_applications", appId));

      if (!appDoc.exists()) {
        throw new Error(`Aplikacja o ID ${appId} nie istnieje`);
      }

      return { id: appDoc.id, ...appDoc.data() };
    } catch (error: any) {
      console.error("Błąd podczas pobierania aplikacji:", error);
      throw new Error(`Nie udało się pobrać aplikacji: ${error.message}`);
    }
  }

  /**
   * Usuwa aplikację i wszystkie powiązane dane
   */
  async deleteApplication(appId: string): Promise<void> {
    try {
      // 1. Pobieramy wszystkie workspace'y aplikacji, aby je usunąć
      const workspacesQuery = query(
        collection(this.db, "app_workspaces"),
        where("appId", "==", appId)
      );
      const workspacesSnapshot = await getDocs(workspacesQuery);

      // 2. Pobieramy wszystkie scenariusze aplikacji
      const scenariosQuery = query(
        collection(this.db, "app_scenarios"),
        where("appId", "==", appId)
      );
      const scenariosSnapshot = await getDocs(scenariosQuery);

      // 3. Zbieramy ID scenariuszy do usunięcia
      const scenarioIds = scenariosSnapshot.docs.map((doc) => doc.id);

      // 4. Dla każdego scenariusza usuwamy jego nodes
      for (const scenarioId of scenarioIds) {
        const nodesQuery = query(
          collection(this.db, "app_nodes"),
          where("scenarioId", "==", scenarioId)
        );
        const nodesSnapshot = await getDocs(nodesQuery);

        // Usuwanie nodes
        const deleteNodePromises = nodesSnapshot.docs.map((nodeDoc) =>
          deleteDoc(doc(this.db, "app_nodes", nodeDoc.id))
        );
        await Promise.all(deleteNodePromises);
      }

      // 5. Usuwamy scenariusze
      const deleteScenarioPromises = scenariosSnapshot.docs.map((scenarioDoc) =>
        deleteDoc(doc(this.db, "app_scenarios", scenarioDoc.id))
      );
      await Promise.all(deleteScenarioPromises);

      // 6. Usuwamy workspace'y
      const deleteWorkspacePromises = workspacesSnapshot.docs.map(
        (workspaceDoc) =>
          deleteDoc(doc(this.db, "app_workspaces", workspaceDoc.id))
      );
      await Promise.all(deleteWorkspacePromises);

      // 7. Na końcu usuwamy aplikację
      await deleteDoc(doc(this.db, "app_applications", appId));

      console.log(
        "Aplikacja i wszystkie powiązane dane zostały usunięte:",
        appId
      );
    } catch (error: any) {
      console.error("Błąd podczas usuwania aplikacji:", error);
      throw new Error(`Nie udało się usunąć aplikacji: ${error.message}`);
    }
  }

  // ===== WORKSPACE =====

  /**
   * Tworzy nowy workspace
   */
  async createWorkspace(
    appId: string,
    workspaceConfig: Partial<WorkspaceConfig>
  ): Promise<string> {
    try {
      // Sprawdzamy, czy aplikacja istnieje
      const appDoc = await getDoc(doc(this.db, "app_applications", appId));
      if (!appDoc.exists()) {
        throw new Error(`Aplikacja o ID ${appId} nie istnieje`);
      }

      // Przygotowujemy dane workspace'a
      const workspaceData = {
        appId,
        name: workspaceConfig.name || "Nowy workspace",
        description: workspaceConfig.description || "",
        icon: workspaceConfig.icon || "globe",
        contextSchema: JSON.stringify(
          workspaceConfig.contextSchema || { type: "object", properties: {} }
        ),
        templateSettings: workspaceConfig.templateSettings
          ? JSON.stringify(workspaceConfig.templateSettings)
          : JSON.stringify({ layoutFile: "Simple" }),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const docRef = await addDoc(
        collection(this.db, "app_workspaces"),
        workspaceData
      );
      console.log("Workspace utworzony z ID:", docRef.id);
      return docRef.id;
    } catch (error: any) {
      console.error("Błąd podczas tworzenia workspace:", error);
      throw new Error(`Nie udało się utworzyć workspace: ${error.message}`);
    }
  }

  /**
   * Aktualizuje istniejący workspace
   */
  async updateWorkspace(
    workspaceId: string,
    workspaceData: Partial<WorkspaceConfig>
  ): Promise<void> {
    try {
      // Przygotowujemy dane do aktualizacji
      const updateData: Record<string, any> = {
        updatedAt: new Date().toISOString(),
      };

      // Dodajemy tylko te pola, które zostały przekazane
      if (workspaceData.name !== undefined)
        updateData.name = workspaceData.name;
      if (workspaceData.description !== undefined)
        updateData.description = workspaceData.description;
      if (workspaceData.icon !== undefined)
        updateData.icon = workspaceData.icon;

      if (workspaceData.contextSchema) {
        updateData.contextSchema = JSON.stringify(workspaceData.contextSchema);
      }

      if (workspaceData.templateSettings) {
        updateData.templateSettings = JSON.stringify(
          workspaceData.templateSettings
        );
      }

      await updateDoc(doc(this.db, "app_workspaces", workspaceId), updateData);
      console.log("Workspace zaktualizowany:", workspaceId);
    } catch (error: any) {
      console.error("Błąd podczas aktualizacji workspace:", error);
      throw new Error(
        `Nie udało się zaktualizować workspace: ${error.message}`
      );
    }
  }

  /**
   * Pobiera workspace według ID
   */
  async getWorkspace(workspaceId: string): Promise<any> {
    try {
      const workspaceDoc = await getDoc(
        doc(this.db, "app_workspaces", workspaceId)
      );

      if (!workspaceDoc.exists()) {
        throw new Error(`Workspace o ID ${workspaceId} nie istnieje`);
      }

      const data = workspaceDoc.data();

      // Parsujemy dane JSON
      return {
        id: workspaceDoc.id,
        ...data,
        contextSchema: JSON.parse(data.contextSchema || "{}"),
        templateSettings: data.templateSettings
          ? JSON.parse(data.templateSettings)
          : undefined,
      };
    } catch (error: any) {
      console.error("Błąd podczas pobierania workspace:", error);
      throw new Error(`Nie udało się pobrać workspace: ${error.message}`);
    }
  }

  /**
   * Pobiera wszystkie workspace'y dla aplikacji
   */
  async getWorkspacesByAppId(appId: string): Promise<any[]> {
    try {
      const workspacesQuery = query(
        collection(this.db, "app_workspaces"),
        where("appId", "==", appId)
      );
      const workspacesSnapshot = await getDocs(workspacesQuery);

      return workspacesSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          contextSchema: JSON.parse(data.contextSchema || "{}"),
          templateSettings: data.templateSettings
            ? JSON.parse(data.templateSettings)
            : undefined,
        };
      });
    } catch (error: any) {
      console.error("Błąd podczas pobierania workspace'ów:", error);
      throw new Error(`Nie udało się pobrać workspace'ów: ${error.message}`);
    }
  }

  /**
   * Usuwa workspace i powiązane dane
   */
  async deleteWorkspace(workspaceId: string): Promise<void> {
    try {
      // 1. Pobieramy workspace, aby sprawdzić czy istnieje
      const workspaceDoc = await getDoc(
        doc(this.db, "app_workspaces", workspaceId)
      );

      if (!workspaceDoc.exists()) {
        throw new Error(`Workspace o ID ${workspaceId} nie istnieje`);
      }

      // 2. Pobieramy wszystkie scenariusze workspace'a
      const scenariosQuery = query(
        collection(this.db, "app_scenarios"),
        where("workspaceSlug", "==", `workspace-${workspaceId}`)
      );
      const scenariosSnapshot = await getDocs(scenariosQuery);

      // 3. Zbieramy ID scenariuszy do usunięcia
      const scenarioIds = scenariosSnapshot.docs.map((doc) => doc.id);

      // 4. Dla każdego scenariusza usuwamy jego nodes
      for (const scenarioId of scenarioIds) {
        const nodesQuery = query(
          collection(this.db, "app_nodes"),
          where("scenarioId", "==", scenarioId)
        );
        const nodesSnapshot = await getDocs(nodesQuery);

        // Usuwanie nodes
        const deleteNodePromises = nodesSnapshot.docs.map((nodeDoc) =>
          deleteDoc(doc(this.db, "app_nodes", nodeDoc.id))
        );
        await Promise.all(deleteNodePromises);
      }

      // 5. Usuwamy scenariusze
      const deleteScenarioPromises = scenariosSnapshot.docs.map((scenarioDoc) =>
        deleteDoc(doc(this.db, "app_scenarios", scenarioDoc.id))
      );
      await Promise.all(deleteScenarioPromises);

      // 6. Usuwamy workspace
      await deleteDoc(doc(this.db, "app_workspaces", workspaceId));

      console.log(
        "Workspace i wszystkie powiązane dane zostały usunięte:",
        workspaceId
      );
    } catch (error: any) {
      console.error("Błąd podczas usuwania workspace:", error);
      throw new Error(`Nie udało się usunąć workspace: ${error.message}`);
    }
  }

  // ===== SCENARIUSZ =====

  /**
   * Tworzy nowy scenariusz
   */
  async createScenario(
    appId: string,
    workspaceId: string,
    scenarioConfig: Partial<ScenarioConfig>
  ): Promise<string> {
    try {
      // Sprawdzamy, czy aplikacja istnieje
      const appDoc = await getDoc(doc(this.db, "app_applications", appId));
      if (!appDoc.exists()) {
        throw new Error(`Aplikacja o ID ${appId} nie istnieje`);
      }

      // Sprawdzamy, czy workspace istnieje
      const workspaceDoc = await getDoc(
        doc(this.db, "app_workspaces", workspaceId)
      );
      if (!workspaceDoc.exists()) {
        throw new Error(`Workspace o ID ${workspaceId} nie istnieje`);
      }

      // Przygotowujemy dane scenariusza
      const scenarioData = {
        appId,
        workspaceSlug: `workspace-${workspaceId}`,
        name: scenarioConfig.name || "Nowy scenariusz",
        description: scenarioConfig.description || "",
        icon: scenarioConfig.icon || "search",
        systemMessage: scenarioConfig.systemMessage || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const docRef = await addDoc(
        collection(this.db, "app_scenarios"),
        scenarioData
      );
      const scenarioId = docRef.id;
      console.log("Scenariusz utworzony z ID:", scenarioId);

      // Jeśli mamy nodes do dodania, dodajemy je
      if (scenarioConfig.nodes && scenarioConfig.nodes.length > 0) {
        for (const node of scenarioConfig.nodes) {
          await this.createNode(scenarioId, node);
        }
      }

      return scenarioId;
    } catch (error: any) {
      console.error("Błąd podczas tworzenia scenariusza:", error);
      throw new Error(`Nie udało się utworzyć scenariusza: ${error.message}`);
    }
  }

  /**
   * Aktualizuje istniejący scenariusz
   */
  async updateScenario(
    scenarioId: string,
    scenarioData: Partial<ScenarioConfig>
  ): Promise<void> {
    try {
      // Przygotowujemy dane do aktualizacji
      const updateData: Record<string, any> = {
        updatedAt: new Date().toISOString(),
      };

      // Dodajemy tylko te pola, które zostały przekazane
      if (scenarioData.name !== undefined) updateData.name = scenarioData.name;
      if (scenarioData.description !== undefined)
        updateData.description = scenarioData.description;
      if (scenarioData.icon !== undefined) updateData.icon = scenarioData.icon;
      if (scenarioData.systemMessage !== undefined)
        updateData.systemMessage = scenarioData.systemMessage;
      if (scenarioData.workspaceSlug !== undefined)
        updateData.workspaceSlug = scenarioData.workspaceSlug;

      await updateDoc(doc(this.db, "app_scenarios", scenarioId), updateData);
      console.log("Scenariusz zaktualizowany:", scenarioId);
    } catch (error: any) {
      console.error("Błąd podczas aktualizacji scenariusza:", error);
      throw new Error(
        `Nie udało się zaktualizować scenariusza: ${error.message}`
      );
    }
  }

  /**
   * Pobiera scenariusz według ID
   */
  async getScenario(
    scenarioId: string,
    includeNodes: boolean = true
  ): Promise<any> {
    try {
      const scenarioDoc = await getDoc(
        doc(this.db, "app_scenarios", scenarioId)
      );

      if (!scenarioDoc.exists()) {
        throw new Error(`Scenariusz o ID ${scenarioId} nie istnieje`);
      }

      const scenarioData: any = { id: scenarioDoc.id, ...scenarioDoc.data() };

      // Jeśli potrzebujemy nodes
      if (includeNodes) {
        const nodesQuery = query(
          collection(this.db, "app_nodes"),
          where("scenarioId", "==", scenarioId)
        );
        const nodesSnapshot = await getDocs(nodesQuery);

        const nodes = nodesSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            slug: `node-${doc.id}`,
            ...data,
            attrs: data.attrs ? JSON.parse(data.attrs) : undefined,
            saveToDB: data.saveToDB ? JSON.parse(data.saveToDB) : undefined,
          };
        });

        // Sortujemy nodes według order
        nodes.sort((a: any, b: any) => a.order - b.order);

        scenarioData.nodes = nodes;
      }

      return scenarioData;
    } catch (error: any) {
      console.error("Błąd podczas pobierania scenariusza:", error);
      throw new Error(`Nie udało się pobrać scenariusza: ${error.message}`);
    }
  }

  /**
   * Pobiera wszystkie scenariusze dla workspace'a
   */
  async getScenariosByWorkspaceId(workspaceId: string): Promise<any[]> {
    try {
      const workspaceSlug = `workspace-${workspaceId}`;
      const scenariosQuery = query(
        collection(this.db, "app_scenarios"),
        where("workspaceSlug", "==", workspaceSlug)
      );
      const scenariosSnapshot = await getDocs(scenariosQuery);

      return scenariosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error: any) {
      console.error("Błąd podczas pobierania scenariuszy:", error);
      throw new Error(`Nie udało się pobrać scenariuszy: ${error.message}`);
    }
  }

  /**
   * Usuwa scenariusz i jego nodes
   */
  async deleteScenario(scenarioId: string): Promise<void> {
    try {
      // 1. Pobieramy scenariusz, aby sprawdzić czy istnieje
      const scenarioDoc = await getDoc(
        doc(this.db, "app_scenarios", scenarioId)
      );

      if (!scenarioDoc.exists()) {
        throw new Error(`Scenariusz o ID ${scenarioId} nie istnieje`);
      }

      // 2. Pobieramy wszystkie nodes scenariusza
      const nodesQuery = query(
        collection(this.db, "app_nodes"),
        where("scenarioId", "==", scenarioId)
      );
      const nodesSnapshot = await getDocs(nodesQuery);

      // 3. Usuwamy nodes
      const deleteNodePromises = nodesSnapshot.docs.map((nodeDoc) =>
        deleteDoc(doc(this.db, "app_nodes", nodeDoc.id))
      );
      await Promise.all(deleteNodePromises);

      // 4. Usuwamy scenariusz
      await deleteDoc(doc(this.db, "app_scenarios", scenarioId));

      console.log(
        "Scenariusz i wszystkie jego nodes zostały usunięte:",
        scenarioId
      );
    } catch (error: any) {
      console.error("Błąd podczas usuwania scenariusza:", error);
      throw new Error(`Nie udało się usunąć scenariusza: ${error.message}`);
    }
  }

  // ===== NODE =====

  /**
   * Tworzy nowy node
   */
  async createNode(
    scenarioId: string,
    nodeConfig: Partial<NodeConfig>
  ): Promise<string> {
    try {
      // Sprawdzamy, czy scenariusz istnieje
      const scenarioDoc = await getDoc(
        doc(this.db, "app_scenarios", scenarioId)
      );
      if (!scenarioDoc.exists()) {
        throw new Error(`Scenariusz o ID ${scenarioId} nie istnieje`);
      }

      // Przygotowujemy dane node'a
      const nodeData = {
        scenarioId,
        label: nodeConfig.label || "Nowy krok",
        contextSchemaPath: nodeConfig.contextSchemaPath || "",
        contextDataPath: nodeConfig.contextDataPath || "",
        tplFile: nodeConfig.tplFile || "FormStep",
        order: nodeConfig.order !== undefined ? nodeConfig.order : 0,
        attrs: nodeConfig.attrs ? JSON.stringify(nodeConfig.attrs) : null,
        saveToDB: nodeConfig.saveToDB
          ? JSON.stringify(nodeConfig.saveToDB)
          : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(this.db, "app_nodes"), nodeData);
      console.log("Node utworzony z ID:", docRef.id);
      return docRef.id;
    } catch (error: any) {
      console.error("Błąd podczas tworzenia node:", error);
      throw new Error(`Nie udało się utworzyć node: ${error.message}`);
    }
  }

  /**
   * Aktualizuje istniejący node
   */
  async updateNode(
    nodeId: string,
    nodeData: Partial<NodeConfig>
  ): Promise<void> {
    try {
      // Przygotowujemy dane do aktualizacji
      const updateData: Record<string, any> = {
        updatedAt: new Date().toISOString(),
      };

      // Dodajemy tylko te pola, które zostały przekazane
      if (nodeData.label !== undefined) updateData.label = nodeData.label;
      if (nodeData.contextSchemaPath !== undefined)
        updateData.contextSchemaPath = nodeData.contextSchemaPath;
      if (nodeData.contextDataPath !== undefined)
        updateData.contextDataPath = nodeData.contextDataPath;
      if (nodeData.tplFile !== undefined) updateData.tplFile = nodeData.tplFile;
      if (nodeData.order !== undefined) updateData.order = nodeData.order;

      if (nodeData.attrs !== undefined) {
        updateData.attrs = JSON.stringify(nodeData.attrs);
      }

      if (nodeData.saveToDB !== undefined) {
        updateData.saveToDB = JSON.stringify(nodeData.saveToDB);
      }

      await updateDoc(doc(this.db, "app_nodes", nodeId), updateData);
      console.log("Node zaktualizowany:", nodeId);
    } catch (error: any) {
      console.error("Błąd podczas aktualizacji node:", error);
      throw new Error(`Nie udało się zaktualizować node: ${error.message}`);
    }
  }

  /**
   * Pobiera node według ID
   */
  async getNode(nodeId: string): Promise<any> {
    try {
      const nodeDoc = await getDoc(doc(this.db, "app_nodes", nodeId));

      if (!nodeDoc.exists()) {
        throw new Error(`Node o ID ${nodeId} nie istnieje`);
      }

      const data = nodeDoc.data();

      return {
        id: nodeDoc.id,
        slug: `node-${nodeDoc.id}`,
        ...data,
        attrs: data.attrs ? JSON.parse(data.attrs) : undefined,
        saveToDB: data.saveToDB ? JSON.parse(data.saveToDB) : undefined,
      };
    } catch (error: any) {
      console.error("Błąd podczas pobierania node:", error);
      throw new Error(`Nie udało się pobrać node: ${error.message}`);
    }
  }

  /**
   * Pobiera wszystkie nodes dla scenariusza
   */
  async getNodesByScenarioId(scenarioId: string): Promise<any[]> {
    try {
      const nodesQuery = query(
        collection(this.db, "app_nodes"),
        where("scenarioId", "==", scenarioId)
      );
      const nodesSnapshot = await getDocs(nodesQuery);

      const nodes = nodesSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          slug: `node-${doc.id}`,
          ...data,
          attrs: data.attrs ? JSON.parse(data.attrs) : undefined,
          saveToDB: data.saveToDB ? JSON.parse(data.saveToDB) : undefined,
        };
      });

      // Sortujemy nodes według order
      return nodes.sort((a: any, b: any) => a.order - b.order);
    } catch (error: any) {
      console.error("Błąd podczas pobierania nodes:", error);
      throw new Error(`Nie udało się pobrać nodes: ${error.message}`);
    }
  }

  /**
   * Usuwa node
   */
  async deleteNode(nodeId: string): Promise<void> {
    try {
      await deleteDoc(doc(this.db, "app_nodes", nodeId));
      console.log("Node został usunięty:", nodeId);
    } catch (error: any) {
      console.error("Błąd podczas usuwania node:", error);
      throw new Error(`Nie udało się usunąć node: ${error.message}`);
    }
  }

  // ===== EXPORT/IMPORT =====

  /**
   * Eksportuje pełną konfigurację aplikacji do formatu zgodnego z AppConfig
   */
  async exportConfig(appId: string): Promise<AppConfig> {
    try {
      // 1. Pobieramy aplikację
      const app = await this.getApplication(appId);

      // 2. Pobieramy wszystkie workspace'y aplikacji
      const workspaces = await this.getWorkspacesByAppId(appId);

      // 3. Inicjalizujemy tablicę scenariuszy
      const scenarios: ScenarioConfig[] = [];

      // 4. Dla każdego workspace'a pobieramy scenariusze
      for (const workspace of workspaces) {
        const workspaceScenarios = await this.getScenariosByWorkspaceId(
          workspace.id
        );

        // 5. Dla każdego scenariusza pobieramy nodes
        for (const scenario of workspaceScenarios) {
          const scenarioWithNodes = await this.getScenario(scenario.id, true);
          scenarios.push(scenarioWithNodes);
        }
      }

      // 6. Tworzymy obiekt AppConfig
      const config: AppConfig = {
        name: app.name,
        description: app.description,
        tplDir: app.tplDir || "default",
        workspaces: workspaces.map((w) => ({
          slug: `workspace-${w.id}`,
          name: w.name,
          description: w.description,
          icon: w.icon,
          templateSettings: w.templateSettings,
          contextSchema: w.contextSchema,
        })),
        scenarios: scenarios.map((s: any) => ({
          slug: `scenario-${s.id}`,
          workspaceSlug: s.workspaceSlug,
          name: s.name,
          description: s.description,
          icon: s.icon,
          systemMessage: s.systemMessage,
          nodes: s.nodes.map((n: any) => ({
            slug: n.slug,
            label: n.label,
            contextSchemaPath: n.contextSchemaPath,
            contextDataPath: n.contextDataPath,
            tplFile: n.tplFile,
            order: n.order,
            attrs: n.attrs,
            saveToDB: n.saveToDB,
          })),
        })),
      };

      return config;
    } catch (error: any) {
      console.error("Błąd podczas eksportu konfiguracji:", error);
      throw new Error(
        `Nie udało się wyeksportować konfiguracji: ${error.message}`
      );
    }
  }

  /**
   * Importuje konfigurację do Firebase
   */
  async importConfig(config: AppConfig): Promise<string> {
    try {
      // 1. Tworzymy aplikację
      const appId = await this.createApplication({
        name: config.name,
        description: config.description,
        tplDir: config.tplDir,
      });

      // 2. Tworzymy workspaces
      const workspaceMap = new Map<string, string>(); // Mapa: oryginalny slug -> nowe ID

      for (const workspace of config.workspaces) {
        const workspaceId = await this.createWorkspace(appId, {
          name: workspace.name,
          description: workspace.description,
          icon: workspace.icon,
          templateSettings: workspace.templateSettings,
          contextSchema: workspace.contextSchema,
        });

        // Zapisujemy mapowanie slugów
        workspaceMap.set(workspace.slug, workspaceId);
      }

      // 3. Tworzymy scenariusze
      const scenarioMap = new Map<string, string>(); // Mapa: oryginalny slug -> nowe ID

      for (const scenario of config.scenarios) {
        // Znajdujemy ID workspace'a na podstawie oryginalnego sluga
        const originalWorkspaceSlug = scenario.workspaceSlug;
        const workspaceId = workspaceMap.get(originalWorkspaceSlug);

        if (!workspaceId) {
          console.warn(
            `Nie znaleziono workspace'a dla sluga ${originalWorkspaceSlug}, pomijam scenariusz ${scenario.name}`
          );
          continue;
        }

        // Tworzymy scenariusz bez nodes
        const scenarioId = await this.createScenario(appId, workspaceId, {
          name: scenario.name,
          description: scenario.description,
          icon: scenario.icon,
          systemMessage: scenario.systemMessage,
        });

        // Zapisujemy mapowanie slugów
        scenarioMap.set(scenario.slug, scenarioId);

        // 4. Dla każdego scenariusza tworzymy nodes
        if (scenario.nodes && scenario.nodes.length > 0) {
          for (const node of scenario.nodes) {
            await this.createNode(scenarioId, {
              label: node.label,
              contextSchemaPath: node.contextSchemaPath,
              contextDataPath: node.contextDataPath,
              tplFile: node.tplFile,
              order: node.order,
              attrs: node.attrs,
              saveToDB: node.saveToDB,
            });
          }
        }
      }

      console.log(
        "Konfiguracja została zaimportowana pomyślnie. ID aplikacji:",
        appId
      );
      return appId;
    } catch (error: any) {
      console.error("Błąd podczas importu konfiguracji:", error);
      throw new Error(
        `Nie udało się zaimportować konfiguracji: ${error.message}`
      );
    }
  }

  /**
   * Aktualizuje istniejącą konfigurację
   */
  async updateConfig(appId: string, config: AppConfig): Promise<void> {
    try {
      // Pobieramy aktualną konfigurację, aby porównać zmiany
      const currentConfig = await this.exportConfig(appId);

      // 1. Aktualizujemy dane aplikacji
      await this.updateApplication(appId, {
        name: config.name,
        description: config.description,
        tplDir: config.tplDir,
      });

      // 2. Aktualizujemy workspaces
      // Mapowanie: slug -> ID
      const currentWorkspaces = new Map<string, string>();
      for (const workspace of currentConfig.workspaces) {
        // Wyciągamy ID z sluga (format: workspace-ID)
        const idMatch = workspace.slug.match(/workspace-(.+)$/);
        if (idMatch && idMatch[1]) {
          currentWorkspaces.set(workspace.slug, idMatch[1]);
        }
      }

      // Aktualizujemy/dodajemy workspaces
      for (const workspace of config.workspaces) {
        const workspaceId = currentWorkspaces.get(workspace.slug);

        if (workspaceId) {
          // Workspace istnieje, aktualizujemy go
          await this.updateWorkspace(workspaceId, workspace);
        } else {
          // Workspace nie istnieje, tworzymy nowy
          const newWorkspaceId = await this.createWorkspace(appId, workspace);
          currentWorkspaces.set(workspace.slug, newWorkspaceId);
        }
      }

      // 3. Aktualizujemy scenariusze
      // Mapowanie: slug -> ID
      const currentScenarios = new Map<string, string>();
      for (const scenario of currentConfig.scenarios) {
        // Wyciągamy ID z sluga (format: scenario-ID)
        const idMatch = scenario.slug.match(/scenario-(.+)$/);
        if (idMatch && idMatch[1]) {
          currentScenarios.set(scenario.slug, idMatch[1]);
        }
      }

      // Aktualizujemy/dodajemy scenariusze
      for (const scenario of config.scenarios) {
        const scenarioId = currentScenarios.get(scenario.slug);

        // Znajdujemy ID workspace'a
        const workspaceSlug = scenario.workspaceSlug;
        const workspaceId = currentWorkspaces.get(workspaceSlug);

        if (!workspaceId) {
          console.warn(
            `Nie znaleziono workspace'a dla sluga ${workspaceSlug}, pomijam scenariusz ${scenario.name}`
          );
          continue;
        }

        if (scenarioId) {
          // Scenariusz istnieje, aktualizujemy go
          await this.updateScenario(scenarioId, {
            name: scenario.name,
            description: scenario.description,
            icon: scenario.icon,
            systemMessage: scenario.systemMessage,
            workspaceSlug: scenario.workspaceSlug,
          });

          // Pobieramy aktualne nodes
          const currentNodes = await this.getNodesByScenarioId(scenarioId);
          const currentNodeIds = new Map<string, string>();

          for (const node of currentNodes) {
            const slugMatch = node.slug.match(/node-(.+)$/);
            if (slugMatch && slugMatch[1]) {
              currentNodeIds.set(node.slug, slugMatch[1]);
            }
          }

          // Aktualizujemy/dodajemy nodes
          for (const node of scenario.nodes) {
            const nodeId = currentNodeIds.get(node.slug);

            if (nodeId) {
              // Node istnieje, aktualizujemy go
              await this.updateNode(nodeId, node);
            } else {
              // Node nie istnieje, tworzymy nowy
              await this.createNode(scenarioId, node);
            }
          }
        } else {
          // Scenariusz nie istnieje, tworzymy nowy
          await this.createScenario(appId, workspaceId, scenario);
        }
      }

      console.log(
        "Konfiguracja została zaktualizowana pomyślnie. ID aplikacji:",
        appId
      );
    } catch (error: any) {
      console.error("Błąd podczas aktualizacji konfiguracji:", error);
      throw new Error(
        `Nie udało się zaktualizować konfiguracji: ${error.message}`
      );
    }
  }
}
