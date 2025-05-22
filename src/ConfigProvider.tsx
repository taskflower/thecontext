// src/ConfigProvider.tsx
import React, { createContext, useContext, useEffect, useState, lazy } from 'react';
import { useParams } from 'react-router-dom';
import type { AppConfig, WorkspaceConfig, ScenarioConfig } from '@/core/types';

// Glob wszystkich modułów tematów
const moduleMap: Record<string, () => Promise<any>> = {};
const modules = import.meta.glob(
  './themes/*/{components,layouts,widgets}/*.tsx',
  { as: 'module' }
);
for (const path in modules) {
  const importer = modules[path];
  // Ścieżka: ./themes/{tplDir}/{type}/{name}.tsx
  const match = path.match(/\.\/themes\/(.*?)\/(components|layouts|widgets)\/(.*?)\.tsx$/);
  if (!match) continue;
  const [, tplDir, type, name] = match;
  moduleMap[`${type}:${tplDir}/${name}`] = importer;
}

// Cache dla Lazy komponentów
const componentCache = new Map<string, React.LazyExoticComponent<any>>();

const NotFound = ({ type, name, tplDir }: any) => (
  <div className="fallback text-xs p-4 text-gray-600">
    <span className="font-semibold">Nie znaleziono:</span> {type} {name} w {tplDir}
  </div>
);

const loadModule = (
  type: 'components' | 'layouts' | 'widgets',
  tplDir: string,
  name: string
) => {
  const key = `${type}:${tplDir}/${name}`;
  if (componentCache.has(key)) return componentCache.get(key)!;

  const importer = moduleMap[key] || moduleMap[`${type}:default/${name}`];
  const fallback = () =>
    Promise.resolve({ default: (props: any) => <NotFound type={type} name={name} tplDir={tplDir} {...props} /> });

  const Comp = lazy(importer ?? fallback);
  componentCache.set(key, Comp);
  return Comp;
};

export const preload = {
  component: (tplDir: string, name: string) => loadModule('components', tplDir, name),
  layout: (tplDir: string, name: string) => loadModule('layouts', tplDir, name),
  widget: (tplDir: string, name: string) => loadModule('widgets', tplDir, name),
};

// Kontekst konfiguracji
const ConfigContext = createContext<{
  config: AppConfig | null;
  workspace: WorkspaceConfig | null;
  scenario: ScenarioConfig | null;
  configId: string | null;
  loading: boolean;
  error: string | null;
  preload: typeof preload;
}>({ 
  config: null, 
  workspace: null, 
  scenario: null, 
  configId: null, 
  loading: false, 
  error: null, 
  preload 
});

export const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const { configId, workspaceSlug, scenarioSlug } = useParams<{ 
    configId: string; 
    workspaceSlug: string; 
    scenarioSlug: string; 
  }>();

  // Debug: sprawdź aktualne location
  const location = window.location;
  console.log('🌐 Current location:', {
    href: location.href,
    pathname: location.pathname,
    hash: location.hash,
    search: location.search
  });

  const [state, setState] = useState<{
    config: AppConfig | null;
    workspace: WorkspaceConfig | null;
    scenario: ScenarioConfig | null;
    configId: string | null;
    loading: boolean;
    error: string | null;
  }>({
    config: null,
    workspace: null,
    scenario: null,
    configId: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    const loadConfig = async () => {
      console.log('🔄 ConfigProvider: Loading config...', { configId, workspaceSlug, scenarioSlug });
      
      if (!configId) {
        console.log('❌ ConfigProvider: No configId provided');
        return;
      }

      setState(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        // Zawsze ładuj app config
        console.log(`📁 Loading app config: ../src/configs/${configId}/app.json`);
        const app: AppConfig = (await import(`../src/configs/${configId}/app.json`)).default;
        console.log('✅ App config loaded:', app);
        
        let workspace: WorkspaceConfig | null = null;
        let scenario: ScenarioConfig | null = null;
        let scenarios: any[] = [];

        // Jeśli mamy workspaceSlug, ładuj workspace
        if (workspaceSlug) {
          console.log(`📁 Loading workspace: ../src/configs/${configId}/workspaces/${workspaceSlug}.json`);
          workspace = {
            ...(await import(`../src/configs/${configId}/workspaces/${workspaceSlug}.json`)).default,
            slug: workspaceSlug,
          };
          console.log('✅ Workspace loaded:', workspace);

          // Jeśli mamy scenarioSlug, ładuj scenariusz
          if (scenarioSlug) {
            console.log(`📁 Loading scenario: ../src/configs/${configId}/scenarios/${workspaceSlug}/${scenarioSlug}.json`);
            scenario = {
              ...(await import(`../src/configs/${configId}/scenarios/${workspaceSlug}/${scenarioSlug}.json`)).default,
              slug: scenarioSlug,
            };
            console.log('✅ Scenario loaded:', scenario);
          }
        }

        console.log('✅ ConfigProvider: All configs loaded successfully');
        const finalConfig = { 
          ...app, 
          workspaces: workspace ? [workspace] : [],
          scenarios: scenarios || []
        };
        console.log('📦 Final config structure:', {
          app,
          workspace,
          finalConfig,
          workspacesArray: finalConfig.workspaces
        });
        
        setState({
          config: finalConfig,
          workspace,
          scenario,
          configId: configId,
          loading: false,
          error: null,
        });
      } catch (err: any) {
        console.error('❌ ConfigProvider: Error loading config:', err);
        console.error('❌ Error details:', { 
          message: err.message, 
          stack: err.stack,
          configId, 
          workspaceSlug, 
          scenarioSlug 
        });
        setState({ 
          config: null, 
          workspace: null, 
          scenario: null, 
          configId: configId, 
          loading: false, 
          error: err.message 
        });
      }
    };

    loadConfig();
  }, [configId, workspaceSlug, scenarioSlug]);

  return <ConfigContext.Provider value={{ ...state, preload }}>{children}</ConfigContext.Provider>;
};

export const useConfig = () => useContext(ConfigContext);