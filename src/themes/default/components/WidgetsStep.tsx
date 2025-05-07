// src/themes/default/components/WidgetsStep.tsx
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
      case 1:
        return "col-span-1";
      case 2:
        return "col-span-2";
      case 3:
        return "col-span-3";
      case "full":
        return "col-span-full";
      default:
        return "col-span-1";
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
        className={`bg-white rounded-lg overflow-hidden h-full ${getColSpanClass(widget.colSpan)}`}
      > 
        <Suspense
          fallback={
            <div className="flex items-center justify-center p-6 h-32">
              <Loader className="w-6 h-6 text-gray-900 animate-spin" />
              <span className="ml-2 text-gray-600">Ładowanie widgetu...</span>
            </div>
          }
        >
          <Widget {...widget} data={data} />
        </Suspense>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {(title || subtitle) && (
        <div className="mb-8">
          {title && <h2 className="text-2xl font-semibold text-gray-900 mb-2">{title}</h2>}
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {widgets.map(loadWidget)}
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => onSubmit({})}
          className="px-5 py-3 rounded-md transition-colors text-base font-medium bg-gray-900 text-white hover:bg-gray-800 flex items-center"
        >
          <CheckSquare className="w-4 h-4 mr-2" />
          Zakończ
        </button>
      </div>
    </div>
  );
}