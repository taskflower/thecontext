import { lazy, Suspense } from "react";
import { useFlow } from "../../../core/context";
import { CheckSquare, Loader } from "lucide-react";

type WidgetConfig = {
  tplFile: string;
  title?: string;
  contextDataPath?: string;
  colSpan?: 1 | 2 | 3 | "full"; // Dodana opcja określająca szerokość widgetu
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

  // Funkcja mapująca colSpan na klasy CSS
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

  // Funkcja do ładowania widgetów
  const loadWidget = (widget: WidgetConfig) => {
    const Widget = lazy(() =>
      import(`../widgets/${widget.tplFile}`).catch(
        () => import("../widgets/ErrorWidget")
      )
    );

    // Dane dla widgetu
    const data = widget.contextDataPath
      ? get(widget.contextDataPath)
      : undefined;

    return (
      <div
        key={widget.tplFile + (widget.title || "")}
        className={`bg-white rounded-lg shadow overflow-hidden h-full ${getColSpanClass(widget.colSpan)}`}
      >
        <Suspense
          fallback={
            <div className="flex items-center justify-center p-4 h-32">
              <Loader className="w-6 h-6 text-blue-500 animate-spin" />
              <span className="ml-2">Ładowanie widgetu...</span>
            </div>
          }
        >
          <Widget {...widget} data={data} />
        </Suspense>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      {(title || subtitle) && (
        <div className="mb-6">
          {title && <h2 className="text-2xl font-bold mb-2">{title}</h2>}
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {widgets.map(loadWidget)}
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => onSubmit({})}
          className="py-2 px-4 bg-blue-500 text-white border-none rounded cursor-pointer hover:bg-blue-400 flex items-center"
        >
          <CheckSquare className="w-4 h-4 mr-2" />
          Zakończ
        </button>
      </div>
    </div>
  );
}