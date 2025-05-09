// src/themes/default/components/WidgetsStep.tsx
import React, { Suspense, useMemo } from "react";
import { CheckSquare } from "lucide-react";
import { getDatabaseProvider } from "../../../provideDB/databaseProvider";
import { get as getPath } from "lodash";
import { WidgetConfig, WidgetsStepProps } from "@/themes/themeTypes";
import { useFlow } from "@/core";
import { preloadWidget } from "@/preload";
import { Loading } from "@/components";
import { getColSpanClass } from "@/core/utils/themesHelpers";

export default function WidgetsStep({
  widgets = [],
  onSubmit,
  title = "Podsumowanie",
  subtitle,
  saveToDB,
  scenarioName,
  nodeSlug,
}: WidgetsStepProps) {
  const { get } = useFlow();

  // Prefetch i cache komponentów widgetów
  const widgetComponents = useMemo(
    () =>
      widgets.map((widget) => ({
        ...widget,
        Component: preloadWidget(widget.tplDir || "default", widget.tplFile),
      })),
    [widgets]
  );

  const dbProvider =
    saveToDB?.enabled && saveToDB.provider
      ? getDatabaseProvider(saveToDB.provider)
      : null;

  const handleNext = async () => {
    if (saveToDB?.enabled && dbProvider) {
      try {
        const contentPath = saveToDB.contentPath || "";
        const dataToSave = contentPath
          ? getPath(get(contentPath), "")
          : {};

        await dbProvider.saveData(
          saveToDB,
          dataToSave,
          { scenarioName, nodeSlug }
        );
      } catch (error) {
        console.error("[WidgetsStep] Błąd podczas zapisywania do bazy:", error);
      }
    }
    onSubmit(null);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {(title || subtitle) && (
        <div className="mb-6">
          {title && (
            <h2 className="text-xl font-medium text-gray-900 mb-2">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-gray-600 text-sm">{subtitle}</p>
          )}
        </div>
      )}

      <Suspense fallback={<Loading message="Ładowanie widgetów..." />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {widgetComponents.map((widget) => {
            const data = widget.contextDataPath
              ? getPath(get(widget.contextDataPath), "")
              : undefined;
            return (
              <div
                key={widget.tplFile + (widget.title || "")}
                className={`bg-white rounded overflow-hidden shadow-sm border border-gray-100 h-full ${getColSpanClass(
                  widget.colSpan
                )}`}
              >
                <widget.Component {...widget} data={data} />
              </div>
            );
          })}
        </div>
      </Suspense>

      <div className="flex justify-end">
        <button
          onClick={handleNext}
          className="px-5 py-2.5 rounded transition-colors text-sm font-medium bg-black text-white hover:bg-gray-800 flex items-center"
        >
          <CheckSquare className="w-4 h-4 mr-2" />
          Zakończ
        </button>
      </div>
    </div>
  );
}
