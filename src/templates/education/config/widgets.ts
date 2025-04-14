// src/templates/education/config/widgets.ts
import { lazy } from "react";
import { WidgetCategory } from "@/lib/templates";

export function getWidgetsConfig() {
  return [
    {
      id: "card-list",
      name: "Lista Kart",
      category: "scenario" as WidgetCategory,
      component: lazy(() => import("../../default/widgets/CardListWidget")),
    },
    {
      id: "table-list",
      name: "Lista Tabelaryczna",
      category: "scenario" as WidgetCategory,
      component: lazy(() => import("../../default/widgets/TableListWidget")),
    },
  ];
}