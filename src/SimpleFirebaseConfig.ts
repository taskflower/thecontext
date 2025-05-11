// src/config/SimpleFirebaseConfig.ts
import { AppConfig } from './core/types';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from './provideDB/firebase/config';

/**
 * Loader konfiguracji: najpierw local, potem Firebase
 */
export class SimpleConfigLoader {
  async loadLocalConfig(): Promise<AppConfig> {
    const { default: config } = await import('./_configs/marketingApp/config');
    // Dodajemy źródło konfiguracji
    (config as any)._source = { type: 'local' };
    return config;
  }

  async loadFirebaseConfigWithId(appId: string): Promise<AppConfig> {
    // 1. Pobierz aplikację
    const appDoc = await getDoc(doc(db, 'app_applications', appId));
    if (!appDoc.exists()) throw new Error(`Nie znaleziono aplikacji o ID: ${appId}`);
    const appData = appDoc.data();

    // 2. Pobierz workspaces
    const wsSnap = await getDocs(
      query(collection(db, 'app_workspaces'), where('appId', '==', appId))
    );

    // 3. Pobierz scenariusze
    const scSnap = await getDocs(
      query(collection(db, 'app_scenarios'), where('appId', '==', appId))
    );

    // 4. Pobierz nodes
    const nodesMap = new Map<string, any[]>();
    await Promise.all(
      scSnap.docs.map(async d => {
        const nodesSnap = await getDocs(
          query(collection(db, 'app_nodes'), where('scenarioId', '==', d.id))
        );
        const nodes = nodesSnap.docs
          .map(nd => ({ slug: nd.data().slug, ...nd.data(), order: nd.data().order || 0 }))
          .sort((a, b) => a.order - b.order);
        nodesMap.set(d.id, nodes);
      })
    );

    // 5. Buduj AppConfig
    const workspaces = wsSnap.docs.map(d => ({ slug: d.data().slug, ...d.data() }));
    const scenarios = scSnap.docs.map(d => ({ slug: d.data().slug, ...d.data(), nodes: nodesMap.get(d.id) || [] }));

    const config: AppConfig = {
      name: appData.name,
      description: appData.description,
      tplDir: appData.tplDir || 'default',
      workspaces,
      scenarios,
    };
    // Dodajemy źródło konfiguracji
    (config as any)._source = { type: 'firebase', appId };
    return config;
  }
}

export const simpleConfigLoader = new SimpleConfigLoader();
