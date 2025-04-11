// src/templates/default/config/layouts.ts
import { lazy } from "react";

export function getLayoutsConfig() {
  return [
    {
      id: "default",
      name: "Default Layout",
      component: lazy(() => import("../layouts/DefaultLayout")),
    },
    {
      id: "sidebar",
      name: "Sidebar Layout",
      component: lazy(() => import("../layouts/SidebarLayout")),
    },
  ];
}