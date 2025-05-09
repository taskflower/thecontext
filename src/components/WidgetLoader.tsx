// src/components/WidgetLoader.tsx
import React, { useMemo } from "react";
import { Suspense } from "react";
import LoadingSpinner from "./LoadingSpinner";
import { preloadWidget } from "../preload";

const WidgetLoader: React.FC<{ tplDir: string; widget: any }> = React.memo(
  ({ tplDir, widget }) => {
    const WidgetComponent = useMemo(() => 
      preloadWidget(tplDir, widget.tplFile),
    [tplDir, widget.tplFile]);

    return (
      <Suspense fallback={<LoadingSpinner message="Ładowanie widgetu..." />}>
        <WidgetComponent {...widget} componentName={widget.tplFile} />
      </Suspense>
    );
  }
);

export default WidgetLoader;