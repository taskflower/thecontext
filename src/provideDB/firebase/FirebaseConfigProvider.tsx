// src/provideDB/firebase/FirebaseConfigProvider.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { AppConfig, NodeConfig, ScenarioConfig, WorkspaceConfig } from '@/core';
import { db } from './config';


interface FirebaseConfigContextValue {
  appInfo: {
    id: string;
    name: string;
    description: string;
    tplDir: string;
  } | null;
  workspaces: WorkspaceConfig[];
  loading: {
    app: boolean;
    workspaces: boolean;
    scenarios: boolean;
    nodes: boolean;
  };
  error: string | null;
  loadScenarios: (workspaceSlug: string) => Promise<void>;
  getScenariosByWorkspace: (workspaceSlug: string) => ScenarioConfig[];
  loadNodes: (scenarioSlug: string) => Promise<void>;
  getNodesByScenario: (scenarioSlug: string) => NodeConfig[];
  getAppConfig: () => AppConfig | null;
}

const initialLoadingState = {
  app: true,
  workspaces: true,
  scenarios: false,
  nodes: false,
};

const FirebaseConfigContext = createContext<FirebaseConfigContextValue>({
  appInfo: null,
  workspaces: [],
  loading: initialLoadingState,
  error: null,
  loadScenarios: async () => {},
  getScenariosByWorkspace: () => [],
  loadNodes: async () => {},
  getNodesByScenario: () => [],
  getAppConfig: () => null,
});

interface FirebaseConfigProviderProps {
  children: ReactNode;
  appId: string;
}

export const FirebaseConfigProvider: React.FC<FirebaseConfigProviderProps> = ({ children, appId }) => {
  const [appInfo, setAppInfo] = useState<FirebaseConfigContextValue['appInfo']>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceConfig[]>([]);
  const [scenarios, setScenarios] = useState<ScenarioConfig[]>([]);
  const [nodes, setNodes] = useState<NodeConfig[]>([]);
  const [loading, setLoading] = useState<FirebaseConfigContextValue['loading']>(initialLoadingState);
  const [error, setError] = useState<string | null>(null);
  const [loadedWorkspaces, setLoadedWorkspaces] = useState<Set<string>>(new Set());
  const [loadedScenarios, setLoadedScenarios] = useState<Set<string>>(new Set());

  // Ładowanie podstawowych informacji o aplikacji i workspaces
  useEffect(() => {
    const loadAppAndWorkspaces = async () => {
      if (!appId) return;

      setLoading(prev => ({ ...prev, app: true, workspaces: true }));
      setError(null);

      try {
        // 1. Ładowanie danych aplikacji
        const appDoc = await getDoc(doc(db, 'app_applications', appId));
        
        if (!appDoc.exists()) {
          throw new Error(`Aplikacja o ID ${appId} nie istnieje`);
        }
        
        const appData = appDoc.data();
        setAppInfo({
          id: appId,
          name: appData.name,
          description: appData.description || '',
          tplDir: appData.tplDir || 'default',
        });
        
        setLoading(prev => ({ ...prev, app: false }));

        // 2. Ładowanie workspace'ów
        const workspacesQuery = query(
          collection(db, 'app_workspaces'),
          where('appId', '==', appId)
        );
        const workspacesSnapshot = await getDocs(workspacesQuery);
        const loadedWorkspaces: WorkspaceConfig[] = workspacesSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            slug: doc.id,
            name: data.name,
            description: data.description || '',
            icon: data.icon || '',
            contextSchema: JSON.parse(data.contextSchema || '{}'),
            templateSettings: data.templateSettings ? JSON.parse(data.templateSettings) : {},
          };
        });
        
        setWorkspaces(loadedWorkspaces);
        setLoading(prev => ({ ...prev, workspaces: false }));
      } catch (err: any) {
        console.error('Błąd ładowania danych aplikacji z Firebase:', err);
        setError(err.message || 'Nie udało się załadować danych aplikacji');
        setLoading({ app: false, workspaces: false, scenarios: false, nodes: false });
      }
    };

    loadAppAndWorkspaces();
  }, [appId]);

  // Funkcja ładująca scenariusze dla wybranego workspace'a
  const loadScenarios = async (workspaceSlug: string): Promise<void> => {
    if (loadedWorkspaces.has(workspaceSlug)) {
      return; // Scenariusze już załadowane dla tego workspace'a
    }

    setLoading(prev => ({ ...prev, scenarios: true }));
    
    try {
      const scenariosQuery = query(
        collection(db, 'app_scenarios'),
        where('appId', '==', appId),
        where('workspaceSlug', '==', workspaceSlug)
      );
      
      const scenariosSnapshot = await getDocs(scenariosQuery);
      const newScenarios: ScenarioConfig[] = scenariosSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          slug: doc.id,
          workspaceSlug: data.workspaceSlug,
          name: data.name,
          description: data.description || '',
          icon: data.icon || '',
          systemMessage: data.systemMessage || '',
          nodes: [], // Początkowo puste, węzły będą ładowane oddzielnie
        };
      });
      
      setScenarios(prev => [...prev, ...newScenarios]);
      setLoadedWorkspaces(prev => new Set(prev).add(workspaceSlug));
    } catch (err: any) {
      console.error(`Błąd ładowania scenariuszy dla workspace'a ${workspaceSlug}:`, err);
      setError(`Nie udało się załadować scenariuszy dla workspace'a: ${err.message}`);
    } finally {
      setLoading(prev => ({ ...prev, scenarios: false }));
    }
  };

  // Funkcja ładująca węzły dla wybranego scenariusza
  const loadNodes = async (scenarioSlug: string): Promise<void> => {
    if (loadedScenarios.has(scenarioSlug)) {
      return; // Węzły już załadowane dla tego scenariusza
    }

    setLoading(prev => ({ ...prev, nodes: true }));
    
    try {
      const nodesQuery = query(
        collection(db, 'app_nodes'),
        where('appId', '==', appId),
        where('scenarioId', '==', scenarioSlug)
      );
      
      const nodesSnapshot = await getDocs(nodesQuery);
      const newNodes: NodeConfig[] = nodesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          slug: doc.id,
          scenarioId: scenarioSlug,
          label: data.label,
          tplFile: data.tplFile,
          order: data.order,
          contextSchemaPath: data.contextSchemaPath,
          contextDataPath: data.contextDataPath,
          attrs: data.attrs ? JSON.parse(data.attrs) : null,
          saveToDB: data.saveToDB ? JSON.parse(data.saveToDB) : null,
        };
      });
      
      setNodes(prev => [...prev, ...newNodes]);
      setLoadedScenarios(prev => new Set(prev).add(scenarioSlug));
    } catch (err: any) {
      console.error(`Błąd ładowania węzłów dla scenariusza ${scenarioSlug}:`, err);
      setError(`Nie udało się załadować węzłów dla scenariusza: ${err.message}`);
    } finally {
      setLoading(prev => ({ ...prev, nodes: false }));
    }
  };

  // Funkcja zwracająca scenariusze dla danego workspace'a
  const getScenariosByWorkspace = (workspaceSlug: string): ScenarioConfig[] => {
    return scenarios.filter(scenario => scenario.workspaceSlug === workspaceSlug);
  };

  // Funkcja zwracająca węzły dla danego scenariusza
  const getNodesByScenario = (scenarioSlug: string): NodeConfig[] => {
    return nodes.filter(node => node.scenarioId === scenarioSlug);
  };

  // Funkcja budująca pełny obiekt AppConfig na podstawie załadowanych danych
  const getAppConfig = (): AppConfig | null => {
    if (!appInfo) return null;

    // Tworzymy kopie scenariuszy z przypisanymi węzłami
    const scenariosWithNodes = scenarios.map(scenario => ({
      ...scenario,
      nodes: getNodesByScenario(scenario.slug)
    }));

    return {
      name: appInfo.name,
      description: appInfo.description,
      tplDir: appInfo.tplDir,
      workspaces,
      scenarios: scenariosWithNodes,
    };
  };

  return (
    <FirebaseConfigContext.Provider 
      value={{ 
        appInfo, 
        workspaces, 
        loading, 
        error, 
        loadScenarios, 
        getScenariosByWorkspace,
        loadNodes,
        getNodesByScenario,
        getAppConfig
      }}
    >
      {children}
    </FirebaseConfigContext.Provider>
  );
};

export const useFirebaseConfig = () => useContext(FirebaseConfigContext);