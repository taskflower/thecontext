import React, { useMemo } from "react";
import { CheckSquare, ArrowRight } from "lucide-react";
import { useFlow } from "@/core";
import { WidgetsStepProps } from "@/themes/themeTypes";
import { getColSpanClass } from "@/core/utils/themesHelpers";
import { useTheme } from "@/themes/ThemeContext";
import {
  getDatabaseProvider,
  SaveToDBOptions,
} from "@/provideDB/databaseProvider";
import { useConfig } from "@/ConfigProvider";
import Loader from "@/themes/default/commons/Loader";
import ActionButton from "@/themes/default/commons/ActionButton";

const WidgetLoading: React.FC = React.memo(() => <Loader />);

const WidgetContainer = React.memo(
  ({ widget, data, tplDir }: { widget: any; data: any; tplDir: string }) => {
    const { preload } = useConfig();

    const WidgetComp = useMemo(
      () => preload.widget(tplDir, widget.tplFile),
      [preload, tplDir, widget.tplFile]
    );

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
  }
);

const WidgetsStep: React.FC<WidgetsStepProps> = React.memo(
  ({
    widgets = [],
    onSubmit,
    title = "Podsumowanie",
    subtitle,
    saveToDB,
    scenarioName,
    nodeSlug,
    context,
    disableNextButton,
  }) => {
    const { get } = useFlow();
    const tplDir = useTheme();

    const handleNext = async () => {
      if (saveToDB?.provider) {
        
        try {
          const dbProvider = getDatabaseProvider(
            saveToDB.provider,
            saveToDB.contentPath
          );
          const dataToSave = saveToDB.contentPath
            ? get(saveToDB.contentPath)
            : {};
         
          
          const options: SaveToDBOptions = {
            ...saveToDB,
            additionalInfo: { scenarioName, nodeSlug },
          };
          const res = await dbProvider.saveData(options, dataToSave);
          console.log(options,res);
          
          console.log(options, dataToSave)
        } catch (error) {
          console.error(
            "[WidgetsStep] Błąd podczas zapisywania do bazy:",
            error
          );
        }
      }
      onSubmit(null);
    };

    const { stepIdx, totalSteps } = context || {};
    const isLastStep =
      typeof stepIdx === "number" && typeof totalSteps === "number"
        ? stepIdx === totalSteps - 1
        : true;
    const nextButtonLabel = isLastStep ? "Zakończ" : "Dalej";
    const NextButtonIcon = isLastStep ? CheckSquare : ArrowRight;

    return (
      <div className="max-w-6xl mx-auto pt-6 ">
        {(title || subtitle) && (
          <div className="mb-6">
            {title && <h2 className="text-xl text-gray-900 mb-3">{title}</h2>}
            {subtitle && <p className="text-gray-600 text-sm">{subtitle}</p>}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {widgets.map((widget) => {
            const data = widget.contextDataPath
              ? get(widget.contextDataPath)
              : undefined;
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

        {scenarioName && nodeSlug && (
          <div className="flex justify-end">
            <ActionButton
              label={nextButtonLabel}
              onClick={handleNext}
              icon={<NextButtonIcon className="w-4 h-4 mr-2" />}
              disabled={disableNextButton} // Zablokowanie przycisku, jeśli użytkownik nie jest zalogowany
            />
          </div>
        )}
      </div>
    );
  }
);

export default WidgetsStep;
