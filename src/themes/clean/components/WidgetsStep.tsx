// src/themes/clean/components/WidgetsStep.tsx
import { lazy, Suspense } from "react";
import { useFlow } from "../../../core/context";
import { CheckSquare, Loader } from "lucide-react";

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
};

export default function WidgetsStep({
  widgets = [],
  onSubmit,
  title = "Podsumowanie",
  subtitle,
}: WidgetsStepProps) {
  const { get } = useFlow();

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
        className={`h-full ${getColSpanClass(widget.colSpan)}`}
      > 
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-32">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-600">Ładowanie widgetu...</span>
            </div>
          }
        >
          <Widget {...widget} data={data} />
        </Suspense>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto py-6 border-t border-gray-200">
      {(title || subtitle) && (
        <div className="mb-8">
          {title && <h2 className="text-2xl font-semibold text-slate-800 mb-2">{title}</h2>}
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {widgets.map(loadWidget)}
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => onSubmit({})}
          className="py-2 px-4 bg-slate-800 text-white rounded-md font-medium hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 flex items-center"
        >
          <CheckSquare className="w-4 h-4 mr-2" />
          Zakończ
        </button>
      </div>
    </div>
  );
}