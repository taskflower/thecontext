// src/preload.ts
import { lazy } from "react";
import create from "zustand";

// Component cache store
interface CacheState {
  components: Record<string, React.LazyExoticComponent<React.ComponentType<any>>>;
  add: (key: string, comp: React.LazyExoticComponent<React.ComponentType<any>>) => void;
  getOrCreate: (key: string, loader: () => Promise<{ default: React.ComponentType<any> }>) => React.LazyExoticComponent<React.ComponentType<any>>;
}

const useComponentCache = create<CacheState>((set, get) => ({
  components: {},
  add: (key, comp) => set((state) => ({ 
    components: { ...state.components, [key]: comp } 
  })),
  getOrCreate: (key, loader) => {
    const { components, add } = get();
    if (components[key]) return components[key];
    const comp = lazy(loader);
    add(key, comp);
    return comp;
  }
}));

// Module loaders
type ModuleLoader = () => Promise<{ default: React.ComponentType<any> }>;
const componentModules = import.meta.glob("./themes/*/components/*.tsx") as Record<string, ModuleLoader>;
const layoutModules = import.meta.glob("./themes/*/layouts/*.tsx") as Record<string, ModuleLoader>;
const widgetModules = import.meta.glob("./themes/*/widgets/*.tsx") as Record<string, ModuleLoader>;

// Unified module resolver
const resolveModule = (
  modules: Record<string, ModuleLoader>,
  tplDir: string,
  subDir: string,
  file: string
): ModuleLoader => {
  const paths = [
    `./themes/${tplDir}/${subDir}/${file}.tsx`,
    `./themes/default/${subDir}/${file}.tsx`,
  ];
  
  for (const path of paths) {
    if (modules[path]) {
      return modules[path];
    }
  }

  throw new Error(`Module not found: ${file} in ${subDir} for tplDir=${tplDir}`);
};

// Simplified loaders
export const preloadComponent = (tplDir: string, componentName: string) => {
  const key = `component:${tplDir}/${componentName}`;
  return useComponentCache.getState().getOrCreate(key, () => 
    resolveModule(componentModules, tplDir, "components", componentName)()
  );
};

export const preloadLayout = (tplDir: string, layoutFile: string) => {
  const key = `layout:${tplDir}/${layoutFile}`;
  return useComponentCache.getState().getOrCreate(key, () => 
    resolveModule(layoutModules, tplDir, "layouts", layoutFile)()
  );
};

export const preloadWidget = (tplDir: string, widgetFile: string) => {
  const key = `widget:${tplDir}/${widgetFile}`;
  return useComponentCache.getState().getOrCreate(key, () => 
    resolveModule(widgetModules, tplDir, "widgets", widgetFile)()
  );
};