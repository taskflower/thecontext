// src/components/WidgetLoader.tsx
import React, { useMemo } from 'react';
import { Suspense } from 'react';

const WidgetLoader: React.FC<{ tplDir: string; widget: any }> = React.memo(({ tplDir, widget }) => {
  const WidgetComponent = useMemo(() => {
    console.log(`[FlowApp] Ładowanie widgetu: ${widget.tplFile} (WYKONUJE SIĘ TYLKO RAZ)`);
    return React.lazy(() =>
      import(`../themes/${tplDir}/widgets/${widget.tplFile}`)
        .catch(() => import('../themes/default/widgets/ErrorWidget'))
    );
  }, [tplDir, widget.tplFile]);

  return (
    <Suspense fallback={<div className="bg-white rounded-lg shadow-sm p-4 h-48 flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>}>
      <WidgetComponent {...widget} componentName={widget.tplFile} />
    </Suspense>
  );
});

export default WidgetLoader;