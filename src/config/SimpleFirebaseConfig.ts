// src/config/SimpleFirebaseConfig.ts
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../provideDB/firebase/config";
import { AppConfig } from "../core/types";

/**
 * Absolutnie prosty loader konfiguracji z Firebase lub lokalnego pliku
 */
export class SimpleConfigLoader {
  /**
   * Ładuje konfigurację z Firebase lub lokalnie
   */
  async loadConfig(firebaseAppId?: string): Promise<AppConfig> {
    // Jeśli nie podano ID, ładuj lokalną konfigurację
    if (!firebaseAppId) {
      console.log("Ładowanie lokalnej konfiguracji");
      return this.loadLocalConfig();
    }
    
    // W przeciwnym razie ładuj z Firebase
    console.log(`Ładowanie konfiguracji z Firebase: ${firebaseAppId}`);
    try {
      const config = await this.loadFirebaseConfig(firebaseAppId);
      console.log("Pomyślnie załadowano konfigurację z Firebase");
      return config;
    } catch (error) {
      console.error("Błąd ładowania konfiguracji z Firebase:", error);
      console.log("Próba załadowania lokalnej konfiguracji jako zapasowej");
      return this.loadLocalConfig();
    }
  }

  /**
   * Ładuje lokalną konfigurację
   */
  private async loadLocalConfig(): Promise<AppConfig> {
    try {
      if (window.__APP_CONFIG__) {
        return window.__APP_CONFIG__;
      }
      const { default: config } = await import("../_configs/marketingApp/config");
      return config;
    } catch (error) {
      console.error("Nie można załadować lokalnej konfiguracji:", error);
      throw new Error("Błąd ładowania lokalnej konfiguracji");
    }
  }

  /**
   * Pobiera kompletną konfigurację z Firebase
   */
  private async loadFirebaseConfig(appId: string): Promise<AppConfig> {
    // 1. Pobierz podstawowe dane aplikacji
    const appDoc = await getDoc(doc(db, "app_applications", appId));
    if (!appDoc.exists()) {
      throw new Error(`Nie znaleziono aplikacji o ID: ${appId}`);
    }
    
    const appData = appDoc.data();
    
    // 2. Pobierz wszystkie workspaces
    const workspacesSnapshot = await getDocs(
      query(collection(db, "app_workspaces"), where("appId", "==", appId))
    );
    
    // 3. Pobierz wszystkie scenariusze
    const scenariosSnapshot = await getDocs(
      query(collection(db, "app_scenarios"), where("appId", "==", appId))
    );
    
    // 4. Pobierz wszystkie nodes
    const scenarioIds = scenariosSnapshot.docs.map(doc => doc.id);
    
    // Mapa przechowująca nodes dla każdego scenariusza
    const scenarioNodes = new Map();
    
    // Pobierz nodes tylko jeśli są jakieś scenariusze
    if (scenarioIds.length > 0) {
      // Dla każdego scenariusza pobierz jego nodes
      for (const scenarioId of scenarioIds) {
        const nodesSnapshot = await getDocs(
          query(collection(db, "app_nodes"), where("scenarioId", "==", scenarioId))
        );
        
        // Sortowanie nodes według pola order
        const nodes = nodesSnapshot.docs
          .map(doc => ({
            slug: `node-${doc.id}`,
            ...this.parseJsonFields(doc.data()),
            order: doc.data().order || 0
          }))
          .sort((a, b) => a.order - b.order);
        
        scenarioNodes.set(scenarioId, nodes);
      }
    }
    
    // 5. Zbuduj finalną konfigurację
    const config: AppConfig = {
      name: appData.name,
      description: appData.description,
      tplDir: appData.tplDir || "default",
      
      // Mapowanie workspace'ów
      workspaces: workspacesSnapshot.docs.map(doc => ({
        slug: `workspace-${doc.id}`,
        ...this.parseJsonFields(doc.data())
      })),
      
      // Mapowanie scenariuszy wraz z ich nodes
      scenarios: scenariosSnapshot.docs.map(doc => ({
        slug: `scenario-${doc.id}`,
        ...this.parseJsonFields(doc.data()),
        nodes: scenarioNodes.get(doc.id) || []
      }))
    };
    
    return config;
  }
  
  /**
   * Parsuje pola JSON w obiekcie dokumentu
   */
  private parseJsonFields(data: any): any {
    const result = { ...data };
    
    // Parsuj znane pola JSON
    const jsonFields = ['attrs', 'saveToDB', 'contextSchema', 'templateSettings'];
    
    for (const field of jsonFields) {
      if (typeof result[field] === 'string') {
        try {
          result[field] = JSON.parse(result[field]);
        } catch (e) {
          // Ignoruj błędy parsowania
        }
      }
    }
    
    return result;
  }
}

// Deklaracja dla globalnej zmiennej konfiguracyjnej
declare global {
  interface Window {
    __APP_CONFIG__?: AppConfig;
  }
}

// Eksportuj singleton
export const simpleConfigLoader = new SimpleConfigLoader();