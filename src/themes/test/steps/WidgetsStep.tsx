import { WidgetContainer } from "@/engine/components/WidgetContainer";
import { useAppNavigation, useConfig } from "@/engine";
import { AppConfig } from "@/engine/types";

export default function WidgetsStep({ attrs }: any) {
  const { config } = useAppNavigation();
  const { config: appConfig } = useConfig<AppConfig>(
    `/src/configs/${config}/app.json`
  );

  return (
    <WidgetContainer
      widgets={attrs?.widgets || []}
      templateDir={appConfig?.tplDir}
      title={attrs?.title}
    />
  );
}
