import React, { Suspense } from "react";
import { useWidget } from "@/core";
import { Loading } from ".";

const WidgetLoader: React.FC<{ tplDir: string; widget: any }> = React.memo(
  ({ tplDir, widget }) => {
    const WidgetComponent = useWidget(tplDir, widget.tplFile);

    return (
      <Suspense fallback={<Loading message="Ładowanie widgetu..." />}>
        <WidgetComponent {...widget} componentName={widget.tplFile} />
      </Suspense>
    );
  }
);

export default WidgetLoader;
