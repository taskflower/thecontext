// src/themes/default/components/WidgetsStep.tsx
import React, { useMemo } from "react";
import { CheckSquare } from "lucide-react";
import { getDatabaseProvider } from "../../../provideDB/databaseProvider";
import { useFlow } from "@/core";
import { preloadWidget } from "@/preload";
import { WidgetsStepProps } from "@/themes/themeTypes";
import { getColSpanClass } from "@/core/utils/themesHelpers";

// Lekki spinner dla widgetów (nie przykrywa całego layoutu)
const WidgetLoading: React.FC = React.memo(() => (
  <div className="flex items-center justify-center h-32 bg-gray-50">
    <div className="w-6 h-6 border-4 border-gray-300 border-t-transparent rounded-full animate-spin" />
  </div>
));

// Zoptymalizowany komponent widgetu
const WidgetContainer = React.memo(({ 
  widget, 
  data, 
  tplDir 
}: { 
  widget: any, 
  data: any, 
  tplDir: string 
}) => {
  const WidgetComp = useMemo(() => preloadWidget(tplDir, widget.tplFile), [tplDir, widget.tplFile]);
  
  return (
    <div
      key={widget.tplFile + (widget.title || "")}
      className={`bg-white rounded overflow-hidden shadow-sm border border-gray-100 h-full ${getColSpanClass(
        widget.colSpan
      )}`}
    >
      <React.Suspense fallback={<WidgetLoading />}>
        <WidgetComp {...widget} data={data} />
      </React.Suspense>
    </div>
  );
});

// Główny komponent, teraz również memoizowany
const WidgetsStep: React.FC<WidgetsStepProps> = React.memo(({
  widgets = [],
  onSubmit,
  title = "Podsumowanie",
  subtitle,
  saveToDB,
  scenarioName,
  nodeSlug,
}: WidgetsStepProps) => {
  const { get } = useFlow();

  // Prefetch i cache komponentów widgetów
  const tplDir = useMemo(() => widgets[0]?.tplDir || "default", [widgets]);

  const handleNext = async () => {
    if (saveToDB?.enabled && saveToDB.provider) {
      try {
        const dbProvider = getDatabaseProvider(saveToDB.provider);
        const contentPath = saveToDB.contentPath || "";
        const dataToSave = contentPath ? get(contentPath) : {};

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

  // Sprawdzenie czy komponent jest używany w kontekście scenariusza czy workspace
  const isScenarioContext = Boolean(scenarioName && nodeSlug);

  return (
    <div className="max-w-6xl mx-auto">
      {(title || subtitle) && (
        <div className="mb-6">
          {title && (
            <h2 className="text-xl font-medium text-gray-900 mb-2">
              {title}
            </h2>
          )}
          {subtitle && <p className="text-gray-600 text-sm">{subtitle}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {widgets.map((widget) => {
          const data = widget.contextDataPath ? get(widget.contextDataPath) : undefined;
          return (
            <WidgetContainer 
              key={widget.tplFile + (widget.title || "")}
              widget={widget} 
              data={data} 
              tplDir={tplDir} 
            />
          );
        })}
      </div>

      {/* Przycisk "Zakończ" wyświetlany tylko w kontekście scenariusza */}
      {isScenarioContext && (
        <div className="flex justify-end">
          <button
            onClick={handleNext}
            className="px-5 py-2.5 rounded transition-colors text-sm font-medium bg-black text-white hover:bg-gray-800 flex items-center"
          >
            <CheckSquare className="w-4 h-4 mr-2" />
            Zakończ
          </button>
        </div>
      )}
    </div>
  );
});

export default WidgetsStep;