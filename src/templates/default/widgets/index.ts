// src/templates/default/widgets/index.ts
import { lazy } from "react";
import { WidgetTemplate } from "../../baseTemplate";

export function getWidgetsConfig(): WidgetTemplate[] {
  return [
    {
      id: "card-list",
      name: "Card List",
      category: "scenario" as any,
      component: lazy(() => import("./CardListWidget")),
    },
    {
      id: "table-list",
      name: "Table List",
      category: "scenario" as any,
      component: lazy(() => import("./TableListWidget")),
    },
    {
      id: "context-display",
      name: "Context Display",
      category: "utility" as any,
      component: lazy(() => import("./ContextDisplayWidget")),
    },
  ];
}