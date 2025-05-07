// src/preloadLayout.ts
import { lazy } from 'react';

export const preloadLayout = (tplDir: string, layoutFile: string) => {
  console.log(`[FlowApp] Ładowanie layoutu: ${tplDir}/${layoutFile} - TYLKO RAZ`);
  return lazy(() =>
    import(`./themes/${tplDir}/layouts/${layoutFile}`)
      .catch(() => import('./themes/default/layouts/Simple'))
  );
};