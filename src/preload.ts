// src/preloadComponent.ts
import { lazy } from "react";

export const preloadComponent = (tplDir: string, componentName: string) => {
  console.log(
    `[FlowApp] Ładowanie komponentu: ${tplDir}/${componentName} - TYLKO RAZ`
  );
  return lazy(() =>
    import(`./themes/${tplDir}/components/${componentName}`).catch(
      () => import(`./themes/default/components/${componentName}`)
    )
  );
};

export const preloadLayout = (tplDir: string, layoutFile: string) => {
  console.log(
    `[FlowApp] Ładowanie layoutu: ${tplDir}/${layoutFile} - TYLKO RAZ`
  );
  return lazy(() =>
    import(`./themes/${tplDir}/layouts/${layoutFile}`).catch(
      () => import("./themes/default/layouts/Simple")
    )
  );
};
