// src/templates/default/config/widgets.ts
import { lazy } from "react";
import { WidgetCategory } from "@/lib/templates";

export function getWidgetsConfig() {
  return [
    {
      id: "card-list",
      name: "Card List",
      category: "scenario" as WidgetCategory,
      component: lazy(() => import("../widgets/CardListWidget")),
    },
    {
      id: "table-list",
      name: "Table List",
      category: "scenario" as WidgetCategory,
      component: lazy(() => import("../widgets/TableListWidget")),
    },
  ];
}