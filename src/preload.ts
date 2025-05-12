// src/preload.ts
import { lazy } from "react";
import create from "zustand";

// Prosty cache dla wszystkich lazy-komponentów (czyszczony przy odświeżeniu strony)
interface CacheState {
  components: Record<string, React.LazyExoticComponent<React.ComponentType<any>>>;
  add: (key: string, comp: React.LazyExoticComponent<React.ComponentType<any>>) => void;
}

const useComponentCache = create<CacheState>((set) => ({
  components: {},
  add: (key, comp) => set((state) => ({ components: { ...state.components, [key]: comp } })),
}));

// Glob pattern dla reactowych komponentów w themes
type ModuleLoader = () => Promise<{ default: React.ComponentType<any> }>;
const componentModules = import.meta.glob(
  "./themes/*/components/*.tsx"
) as Record<string, ModuleLoader>;
const layoutModules = import.meta.glob(
  "./themes/*/layouts/*.tsx"
) as Record<string, ModuleLoader>;
const widgetModules = import.meta.glob(
  "./themes/*/widgets/*.tsx"
) as Record<string, ModuleLoader>;

function getOrLoad(
  key: string,
  loader: ModuleLoader
) {
  const state = useComponentCache.getState();
  if (state.components[key]) return state.components[key];
  const comp = lazy(loader);
  state.add(key, comp);
  return comp;
}

function resolveModule(
  modules: Record<string, ModuleLoader>,
  tplDir: string,
  subDir: string,
  file: string
) {
  // Sprawdzamy tylko katalog widgets: wskazany motyw, a jeśli nie, to domyślny
  const potentialPaths = [
    `./themes/${tplDir}/${subDir}/${file}.tsx`,
    `./themes/default/${subDir}/${file}.tsx`,
  ].filter((path, index, arr) => arr.indexOf(path) === index);

  for (const path of potentialPaths) {
    if (modules[path]) {
      return modules[path];
    }
  }

  // Debug: log tplDir i ścieżki
  console.error(`[FlowApp] resolveModule failed for tplDir=${tplDir}, subDir=${subDir}, file=${file}`);
  console.error(`[FlowApp] Sprawdzone ścieżki:`, potentialPaths);
  throw new Error(`Module not found: ${file} in ${subDir} for tplDir=${tplDir}`);
}

export const preloadComponent = (tplDir: string, componentName: string) => {
  const key = `component:${tplDir}/${componentName}`;
  const loader = () => resolveModule(componentModules, tplDir, "components", componentName)();
  return getOrLoad(key, loader);
};

export const preloadLayout = (tplDir: string, layoutFile: string) => {
  const key = `layout:${tplDir}/${layoutFile}`;
  const loader = () => resolveModule(layoutModules, tplDir, "layouts", layoutFile)();
  return getOrLoad(key, loader);
};

export const preloadWidget = (tplDir: string, widgetFile: string) => {
  const key = `widget:${tplDir}/${widgetFile}`;
  return getOrLoad(key, () =>
    // najpierw próba załadowania z katalogu tplDir, 
    // jeśli nie ma – fallback do default
    resolveModule(widgetModules, tplDir, "widgets", widgetFile)()
  );
};