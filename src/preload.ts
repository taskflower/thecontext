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
const componentModules = import.meta.glob(
  "./themes/*/components/*.tsx"
) as Record<string, () => Promise<{ default: React.ComponentType<any> }>>;

const layoutModules = import.meta.glob(
  "./themes/*/layouts/*.tsx"
) as Record<string, () => Promise<{ default: React.ComponentType<any> }>>;

// UWAGA: Dodajemy obsługę widgetów zarówno z katalogu widgets jak i components
const widgetModules = {
  ...import.meta.glob("./themes/*/widgets/*.tsx"),
  // Dodajemy też komponenty jako możliwe widgety (wiele aplikacji używa komponentów jako widgetów)
  ...import.meta.glob("./themes/*/components/*.tsx")
} as Record<string, () => Promise<{ default: React.ComponentType<any> }>>;

function getOrLoad(
  key: string,
  loader: () => Promise<{ default: React.ComponentType<any> }>
) {
  const state = useComponentCache.getState();
  if (state.components[key]) return state.components[key];
  const comp = lazy(loader);
  state.add(key, comp);
  return comp;
}

function resolveModule(
  modules: Record<string, () => Promise<{ default: React.ComponentType<any> }>>,
  tplDir: string,
  subDir: string,
  file: string
) {
  // Próbujemy najpierw w podanym katalogu
  const path = `./themes/${tplDir}/${subDir}/${file}.tsx`;
  if (modules[path]) return modules[path];
  
  // Jeśli nie znaleziono i to jest widget, próbujemy w components
  if (subDir === "widgets") {
    const componentPath = `./themes/${tplDir}/components/${file}.tsx`;
    if (modules[componentPath]) return modules[componentPath];
  }
  
  // Próbujemy w default theme
  const fallback = `./themes/default/${subDir}/${file}.tsx`;
  if (modules[fallback]) return modules[fallback];
  
  // Jeśli to widget i nie znaleziono w default/widgets, próbujemy default/components
  if (subDir === "widgets") {
    const defaultComponentPath = `./themes/default/components/${file}.tsx`;
    if (modules[defaultComponentPath]) return modules[defaultComponentPath];
  }
  
  // Logujemy błąd z więcej informacji
  console.error(`Nie znaleziono modułu: ${file} w katalogu ${subDir} dla szablonu ${tplDir}`);
  console.error(`Sprawdzone ścieżki:`, 
    path, 
    subDir === "widgets" ? `./themes/${tplDir}/components/${file}.tsx` : null,
    fallback,
    subDir === "widgets" ? `./themes/default/components/${file}.tsx` : null
  );
  
  throw new Error(`Module not found: ${path}`);
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
  const loader = () => resolveModule(widgetModules, tplDir, "widgets", widgetFile)();
  // log tylko przy pierwszym razie
  if (!useComponentCache.getState().components[key]) {
    console.log(`[FlowApp] Ładowanie widgetu: ${widgetFile}`);
  }
  return getOrLoad(key, loader);
};