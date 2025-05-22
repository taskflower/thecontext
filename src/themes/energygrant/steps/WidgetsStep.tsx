import React, { useState, useEffect } from "react";

interface Widget {
  tplFile: string;
  colSpan?: string | number;
  title?: string;
  subtitle?: string;
  [key: string]: any;
}

interface WidgetsStepProps {
  attrs?: {
    title?: string;
    subtitle?: string;
    widgets?: Widget[];
    [key: string]: any;
  };
  [key: string]: any;
}

const WidgetsStep: React.FC<WidgetsStepProps> = ({ attrs }) => {
  const [widgets, setWidgets] = useState<
    Array<{ Component: React.ComponentType<any> } & Widget>
  >([]);
  const [loading, setLoading] = useState(true);

  // Dynamically determine theme path - absolute path to avoid cumulative relative paths
  const themePath = "/src/themes/energygrant/widgets"; // Absolute path

  useEffect(() => {
    if (attrs?.widgets) {
      setLoading(true);

      Promise.all(
        attrs.widgets.map((widget) =>
          import(`${themePath}/${widget.tplFile}`)
            .then((module) => ({
              Component: module.default,
              ...widget,
            }))
            .catch((err) => {
              console.error(`Failed to load widget: ${widget.tplFile}`, err);
              // Return placeholder component for missing widgets
              return {
                Component: ({ tplFile, ...props }: any) => (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <span className="text-red-400">⚠️</span>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          Widget not found: {tplFile}
                        </h3>
                        <p className="text-xs text-red-600 mt-1">
                          File: {themePath}/{tplFile}
                        </p>
                        {Object.keys(props).length > 0 && (
                          <details className="mt-2">
                            <summary className="text-xs text-red-600 cursor-pointer">
                              Expected props
                            </summary>
                            <pre className="text-xs text-red-500 mt-1 bg-red-100 p-2 rounded">
                              {JSON.stringify(props, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                ),
                ...widget,
              };
            })
        )
      ).then((loadedWidgets) => {
        setWidgets(
          loadedWidgets as Array<
            { Component: React.ComponentType<any> } & Widget
          >
        );
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [attrs?.widgets, themePath]);

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {attrs?.title && (
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{attrs.title}</h1>
            {attrs.subtitle && (
              <p className="mt-2 text-lg text-gray-600">{attrs.subtitle}</p>
            )}
          </div>
        )}

        {loading ? (
          <div>Loading widgets...</div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {widgets.map((widget, i) => {
              const WidgetComponent = widget.Component;
              const { Component, ...widgetProps } = widget;

              // Map colSpan values to proper Tailwind classes for 3-column grid
              const getColSpanClass = (
                colSpan: string | number | undefined
              ) => {
                switch (colSpan) {
                  case "full":
                  case 3:
                    return "col-span-3";
                  case 2:
                    return "col-span-2";
                  case 1:
                  default:
                    return "col-span-1";
                }
              };

              return WidgetComponent ? (
                <div key={i} className={getColSpanClass(widget.colSpan)}>
                  <WidgetComponent {...widgetProps} />
                </div>
              ) : null;
            })}
          </div>
        )}
      </div>
    </main>
  );
};

export default WidgetsStep;
