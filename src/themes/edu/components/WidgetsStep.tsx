// src/themes/clean/components/WidgetsStep.tsx
import { lazy, Suspense } from "react";
import { useFlow } from "../../../core/context";
import { CheckSquare,  ArrowRight, Database } from "lucide-react";
import { useParams } from "react-router-dom";
import { getDatabaseProvider } from "../../../provideDB/databaseProvider";
import { get as getPath } from 'lodash';

type WidgetConfig = {
  tplFile: string;
  title?: string;
  contextDataPath?: string;
  colSpan?: 1 | 2 | 3 | "full";
  [key: string]: any;
};

type WidgetsStepProps = {
  widgets: WidgetConfig[];
  onSubmit: (data: any) => void;
  title?: string;
  subtitle?: string;
  saveToDB?: {
    enabled: boolean;
    provider: "indexedDB";
    itemId?: string;
    itemType: "lesson" | "quiz" | "project";
    itemTitle?: string;
    contentPath?: string;
  } | null;
  scenarioName?: string | null;
  nodeSlug?: string | null;
};

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
  const { scenarioSlug, stepIndex } = useParams<{ 
    scenarioSlug: string; 
    stepIndex: string 
  }>();
  
  // Używamy funkcji singleton zamiast hooka
  const dbProvider = (saveToDB?.enabled && saveToDB?.provider) 
    ? getDatabaseProvider(saveToDB.provider) 
    : null;
  
  const isLastStep = !scenarioSlug;

  const getColSpanClass = (colSpan?: 1 | 2 | 3 | "full") => {
    switch (colSpan) {
      case 1: return "col-span-1";
      case 2: return "col-span-2";
      case 3: return "col-span-3";
      case "full": return "col-span-full";
      default: return "col-span-1";
    }
  };

  const loadWidget = (widget: WidgetConfig) => {
    const Widget = lazy(() =>
      import(`../widgets/${widget.tplFile}`).catch(
        () => import("../widgets/ErrorWidget")
      )
    );

    const data = widget.contextDataPath
      ? get(widget.contextDataPath)
      : undefined;

    return (
      <div
        key={widget.tplFile + (widget.title || "")}
        className={`h-full ${getColSpanClass(widget.colSpan)} bg-white rounded-lg border border-sky-200 shadow-sm overflow-hidden`}
      > 
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-32">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-slate-600">Ładowanie widgetu...</span>
            </div>
          }
        >
          <Widget {...widget} data={data} />
        </Suspense>
      </div>
    );
  };

  // Funkcja obsługująca kliknięcie przycisku "Dalej"
  const handleNext = async () => {
    // Jeśli włączone zapisywanie do bazy i mamy provider
    if (saveToDB?.enabled && dbProvider) {
      try {
        // Pobieramy dane do zapisania
        const contentPath = saveToDB.contentPath || '';
        const dataToSave = contentPath ? getPath(get(contentPath), '') : {};
        
        // Zapisujemy dane używając providera
        await dbProvider.saveData(
          saveToDB,
          dataToSave,
          {
            scenarioName,
            nodeSlug,
            scenarioSlug,
            stepIndex
          }
        );
      } catch (error) {
        console.error("[WidgetsStep] Błąd podczas zapisywania do bazy:", error);
      }
    }
    
    // Wywołujemy onSubmit z null
    onSubmit(null);
  };

  return (
    <div className="max-w-6xl mx-auto py-6 border-t border-sky-200">
      {(title || subtitle) && (
        <div className="mb-8">
          {title && <h2 className="text-2xl font-semibold text-slate-800 mb-2">{title}</h2>}
          {subtitle && <p className="text-slate-600">{subtitle}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {widgets.map(loadWidget)}
      </div>

      <div className="flex justify-between items-center">
        {saveToDB?.enabled && (
          <div className="text-xs text-emerald-600 flex items-center">
            <Database className="w-3 h-3 mr-1" />
            Dane zostaną zapisane lokalnie po kliknięciu przycisku
          </div>
        )}
        
        <button
          onClick={handleNext}
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-full shadow-sm font-semibold hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 flex items-center ml-auto"
        >
          {isLastStep ? (
            <>
              <CheckSquare className="w-4 h-4 mr-2" />
              Zakończ
            </>
          ) : (
            <>
              <ArrowRight className="w-4 h-4 mr-2" />
              Dalej
            </>
          )}
        </button>
      </div>
    </div>
  );
}