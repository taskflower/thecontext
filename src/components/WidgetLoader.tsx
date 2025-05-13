// src/components/WidgetLoader.tsx
import React, { Suspense } from "react";
import { useWidget } from "@/core";
import { Loading } from ".";

const WidgetLoader: React.FC<{ tplDir: string; widget: any }> = ({ tplDir, widget }) => {
  const Widget = useWidget(tplDir, widget.tplFile);
  
  return (
    <Suspense fallback={<Loading message="Ładowanie widgetu..." />}>
      <Widget {...widget} componentName={widget.tplFile} />
    </Suspense>
  );
};

export default WidgetLoader;