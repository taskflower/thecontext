// src/preload.ts
import { lazy } from "react";
import create from "zustand";

// Prosty cache dla wszystkich lazy-komponentów (czyszczony przy odświeżeniu)
interface CacheState {
  components: Record<string, React.LazyExoticComponent<React.ComponentType<any>>>;
  add: (key: string, comp: React.LazyExoticComponent<React.ComponentType<any>>) => void;
}

const useComponentCache = create<CacheState>((set) => ({
  components: {},
  add: (key, comp) =>
    set((state) => ({ components: { ...state.components, [key]: comp } })),
}));

function getOrLoad(
  key: string,
  loader: () => Promise<{ default: React.ComponentType<any> }>
) {
  const state = useComponentCache.getState();
  if (state.components[key]) {
    return state.components[key];
  }
  const comp = lazy(loader);
  state.add(key, comp);
  return comp;
}

export const preloadComponent = (tplDir: string, componentName: string) => {
  const key = `component:${tplDir}/${componentName}`;
  return getOrLoad(key, () =>
    import(`./themes/${tplDir}/components/${componentName}`).catch(() =>
      import(`./themes/default/components/${componentName}`)
    )
  );
};

export const preloadLayout = (tplDir: string, layoutFile: string) => {
  const key = `layout:${tplDir}/${layoutFile}`;
  return getOrLoad(key, () =>
    import(`./themes/${tplDir}/layouts/${layoutFile}`).catch(() =>
      import(`./themes/default/layouts/Simple`)
    )
  );
};

export const preloadWidget = (tplDir: string, widgetFile: string) => {
  const key = `widget:${tplDir}/${widgetFile}`;
  // logujemy tylko przy pierwszym razie
  if (!useComponentCache.getState().components[key]) {
    console.log(`[FlowApp] Ładowanie widgetu: ${widgetFile}`);
  }
  return getOrLoad(key, () =>
    import(`./themes/${tplDir}/widgets/${widgetFile}`).catch(() =>
      import(`./themes/default/widgets/ErrorWidget`)
    )
  );
};
