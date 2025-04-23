// src/templates/default/layouts/index.ts
import { LayoutTemplate } from "@/lib/templates";
import { lazy } from "react";


export function getLayoutsConfig(): LayoutTemplate[] {
  return [
    {
      id: "default",
      name: "Default Layout",
      component: lazy(() => import("./DefaultLayout")),
    },
    {
      id: "sidebar",
      name: "Sidebar Layout",
      component: lazy(() => import("./SidebarLayout")),
    },
  ];
}
