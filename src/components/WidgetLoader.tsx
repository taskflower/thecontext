// src/components/WidgetLoader.tsx
import React, { useMemo } from "react";
import { Suspense } from "react";
import LoadingSpinner from "./LoadingSpinner";

const WidgetLoader: React.FC<{ tplDir: string; widget: any }> = React.memo(
  ({ tplDir, widget }) => {
    const WidgetComponent = useMemo(() => {
      console.log(
        `[FlowApp] Ładowanie widgetu: ${widget.tplFile} (WYKONUJE SIĘ TYLKO RAZ)`
      );
      return React.lazy(() =>
        import(`../themes/${tplDir}/widgets/${widget.tplFile}`).catch(
          () => import("../themes/default/widgets/ErrorWidget")
        )
      );
    }, [tplDir, widget.tplFile]);

    return (
      <Suspense fallback={<LoadingSpinner message="Ładowanie widgetu..." />}>
        <WidgetComponent {...widget} componentName={widget.tplFile} />
      </Suspense>
    );
  }
);

export default WidgetLoader;
