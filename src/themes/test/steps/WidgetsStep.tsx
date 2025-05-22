// themes/test/steps/WidgetsStep.tsx - Przekazywanie attrs do widgetów
import { useAppWidgets, useConfig, useAppNavigation } from "@/engine";
import { AppConfig } from "@/engine/types";

export default function WidgetsStep({ attrs }: any) {
  const { config } = useAppNavigation();
  const { config: appConfig } = useConfig<AppConfig>(
    `/src/configs/${config}/app.json`
  );
  const widgets = useAppWidgets(attrs?.widgets || [], appConfig?.tplDir);

  if (!attrs?.widgets?.length) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-3">
        {attrs?.title && (
          <h1 className="text-3xl font-bold mb-6">{attrs.title}</h1>
        )}
        <div className="text-gray-500">No widgets configured</div>
      </div>
    );  
  }

  const getColSpanClass = (colSpan?: string | number) => {
    switch (colSpan) {
      case "full":
      case 3:
        return "col-span-3";
      case 2:
        return "col-span-2";
      default:
        return "col-span-1";
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      {attrs.title && (
        <h1 className="text-3xl font-bold mb-6">{attrs.title}</h1>
      )}
      <div className="grid grid-cols-3 gap-6">
        {widgets.map((widget, i) => {
          const { Component, colSpan, attrs: widgetAttrs, ...props } = widget;
          return (
            <div key={i} className={getColSpanClass(colSpan)}>
              {Component ? (
                <Component {...props} attrs={widgetAttrs} />
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <span className="text-red-400">⚠️</span> Widget not found:{" "}
                  {widget.tplFile}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
