// src/themes/default/components/WidgetsStep.tsx
import { Suspense, useMemo } from "react";
import { useFlow } from "../../../core/context";
import { CheckSquare, Loader } from "lucide-react";
import { getDatabaseProvider } from "../../../provideDB/databaseProvider";
import { get as getPath } from "lodash";
import { getColSpanClass } from "@/core/utils/themesHelpers";
import { WidgetConfig, WidgetsStepProps } from "@/themes/themeTypes";
import { preloadWidget } from "@/preload";

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

  const dbProvider =
    saveToDB?.enabled && saveToDB.provider
      ? getDatabaseProvider(saveToDB.provider)
      : null;

  const loadWidget = (widget: WidgetConfig) => {
    const Widget = useMemo(() => 
      preloadWidget("default", widget.tplFile),
    [widget.tplFile]);

    const data = widget.contextDataPath
      ? get(widget.contextDataPath)
      : undefined;

    return (
      <div
        key={widget.tplFile + (widget.title || "")}
        className={`bg-white rounded overflow-hidden shadow-sm border border-gray-100 h-full ${getColSpanClass(
          widget.colSpan
        )}`}
      >
        <Suspense
          fallback={
            <div className="flex items-center justify-center p-6 h-32">
              <Loader className="w-4 h-4 text-gray-900 animate-spin" />
              <span className="ml-2 text-gray-600 text-sm">
                Ładowanie widgetu...
              </span>
            </div>
          }
        >
          <Widget {...widget} data={data} />
        </Suspense>
      </div>
    );
  };

  const handleNext = async () => {
    if (saveToDB?.enabled && dbProvider) {
      try {
        const contentPath = saveToDB.contentPath || "";
        const dataToSave = contentPath ? getPath(get(contentPath), "") : {};

        await dbProvider.saveData(saveToDB, dataToSave, {
          scenarioName,
          nodeSlug,
        });
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
            <h2 className="text-xl font-medium text-gray-900 mb-2">{title}</h2>
          )}
          {subtitle && <p className="text-gray-600 text-sm">{subtitle}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {widgets.map(loadWidget)}
      </div>

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