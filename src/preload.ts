// src/preload.ts
import { lazy } from "react";

export const preloadComponent = (tplDir: string, componentName: string) => {
  return lazy(() =>
    import(`./themes/${tplDir}/components/${componentName}`).catch(
      () => import(`./themes/default/components/${componentName}`)
    )
  );
};

export const preloadLayout = (tplDir: string, layoutFile: string) => {
  return lazy(() =>
    import(`./themes/${tplDir}/layouts/${layoutFile}`).catch(
      () => import("./themes/default/layouts/Simple")
    )
  );
};

export const preloadWidget = (tplDir: string, widgetFile: string) => {
  console.log(`[FlowApp] Ładowanie widgetu: ${widgetFile} (WYKONUJE SIĘ TYLKO RAZ)`);
  return lazy(() =>
    import(`./themes/${tplDir}/widgets/${widgetFile}`).catch(
      () => import(`./themes/default/widgets/ErrorWidget`)
    )
  );
};