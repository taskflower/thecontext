// src/SimpleFirebaseConfig.ts
import { AppConfig } from './core/types';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from './provideDB/firebase/config';

function parseIfString<T>(value: T | string): T {
  return typeof value === 'string' ? JSON.parse(value) : (value as T);
}

export class ConfigLoader {
  // Lista identyfikatorów lokalnych konfiguracji
  private localConfigIds = ['marketing'];

  // Sprawdź czy configId odpowiada lokalnej konfiguracji
  isLocalConfig(configId: string): boolean {
    return this.localConfigIds.includes(configId);
  }

  // Pobierz listę dostępnych lokalnych konfiguracji
  getAvailableLocalConfigs(): string[] {
    return [...this.localConfigIds];
  }

  // Załaduj konfigurację (lokalną lub z Firebase)
  async loadConfig(configId: string): Promise<AppConfig> {
    if (this.isLocalConfig(configId)) {
      return this.loadLocalConfig(configId);
    } else {
      return this.loadFirebaseConfig(configId);
    }
  }

  // Załaduj domyślną konfigurację (pierwszą lokalną)
  async loadDefaultConfig(): Promise<AppConfig> {
    return this.loadLocalConfig('marketing');
  }

  private async loadLocalConfig(configId: string): Promise<AppConfig> {
    if (!this.isLocalConfig(configId)) {
      throw new Error(`Nie znaleziono lokalnej konfiguracji: ${configId}`);
    }
    
    try {
      // Używamy oryginalnej ścieżki, która działa w projekcie
      const { default: config } = await import(`./_configs/${configId}App/config`);
      (config as any)._source = { type: 'local', configId };
      return config;
    } catch (error) {
      console.error(`Błąd ładowania lokalnej konfiguracji ${configId}:`, error);
      throw new Error(`Nie można załadować konfiguracji ${configId}`);
    }
  }

  private async loadFirebaseConfig(appId: string): Promise<AppConfig> {
    try {
      console.log(`Ładowanie konfiguracji Firebase dla appId: ${appId}`);
      
      // 1. Aplikacja
      const appDoc = await getDoc(doc(db, 'app_applications', appId));
      if (!appDoc.exists()) {
        throw new Error(`Nie znaleziono aplikacji o ID: ${appId}`);
      }
      const appData = appDoc.data() as any;
      console.log(`Znaleziono aplikację: ${appData.name}`);

      // 2. Workspaces
      const wsSnap = await getDocs(
        query(collection(db, 'app_workspaces'), where('appId', '==', appId))
      );
      
      if (wsSnap.empty) {
        console.warn(`Nie znaleziono workspace'ów dla appId: ${appId}`);
      }
      
      const workspaces = wsSnap.docs.map(d => {
        const data = d.data() as any;
        return {
          slug: data.slug || d.id,
          name: data.name,
          description: data.description,
          icon: data.icon,
          // parsujemy zstringowane JSON-y:
          contextSchema: parseIfString(data.contextSchema),
          templateSettings: parseIfString(data.templateSettings),
        };
      });
      
      console.log(`Załadowano ${workspaces.length} workspace'ów`);

      // 3. Scenarios - pobieramy wszystkie, potem filtrujemy
      const scSnap = await getDocs(
        query(collection(db, 'app_scenarios'), where('appId', '==', appId))
      );
      
      if (scSnap.empty) {
        console.warn(`Nie znaleziono scenariuszy dla appId: ${appId}`);
      }
      
      console.log(`Znaleziono ${scSnap.size} scenariuszy`);

      // 4. Nodes - pobieramy w pełni asynchronicznie
      const nodesMap = new Map();
      
      // Użyjmy Promise.all aby poczekać na zakończenie wszystkich zapytań
      await Promise.all(
        scSnap.docs.map(async scenarioDoc => {
          const scenarioId = scenarioDoc.id;
          console.log(`Pobieranie węzłów dla scenariusza: ${scenarioId}`);
          
          try {
            const nodesSnap = await getDocs(
              query(collection(db, 'app_nodes'), where('scenarioId', '==', scenarioId))
            );
            
            console.log(`Znaleziono ${nodesSnap.size} węzłów dla scenariusza ${scenarioId}`);
            
            if (nodesSnap.empty) {
              console.warn(`Nie znaleziono węzłów dla scenariusza: ${scenarioId}`);
              nodesMap.set(scenarioId, []);
              return;
            }
            
            const nodes = nodesSnap.docs
              .map(nd => {
                const ndat = nd.data() as any;
                return {
                  slug: ndat.slug || nd.id,
                  label: ndat.label,
                  tplFile: ndat.tplFile,
                  order: ndat.order || 0,
                  contextSchemaPath: ndat.contextSchemaPath,
                  contextDataPath: ndat.contextDataPath,
                  attrs: ndat.attrs ? parseIfString(ndat.attrs) : undefined,
                  saveToDB: ndat.saveToDB ? parseIfString(ndat.saveToDB) : undefined,
                };
              })
              .sort((a, b) => a.order - b.order);
            
            nodesMap.set(scenarioId, nodes);
          } catch (error) {
            console.error(`Błąd przy pobieraniu węzłów dla scenariusza ${scenarioId}:`, error);
            nodesMap.set(scenarioId, []);
          }
        })
      );

      // Teraz możemy bezpiecznie utworzyć obiekty scenariuszy
      const scenarios = scSnap.docs.map(d => {
        const data = d.data() as any;
        const nodes = nodesMap.get(d.id) || [];
        
        console.log(`Scenariusz ${d.id} (${data.name}): ${nodes.length} węzłów`);
        
        return {
          slug: data.slug || d.id,
          workspaceSlug: data.workspaceSlug || workspaces[0]?.slug,
          name: data.name,
          description: data.description,
          icon: data.icon,
          systemMessage: data.systemMessage,
          nodes: nodes,
        };
      });

      const config = {
        name: appData.name,
        description: appData.description,
        tplDir: appData.tplDir || 'default',
        workspaces,
        scenarios,
      };
      
      console.log(`Konfiguracja załadowana: ${config.name}`);
      console.log(`Scenariusze: ${config.scenarios.length}`);
      
      (config as any)._source = { type: 'firebase', configId: appId };
      return config;
    } catch (error) {
      console.error('Błąd przy ładowaniu konfiguracji z Firebase:', error);
      throw error;
    }
  }
}

export const configLoader = new ConfigLoader();