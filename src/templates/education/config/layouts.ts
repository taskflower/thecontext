// src/templates/education/config/layouts.ts
import { lazy } from "react";

export function getLayoutsConfig() {
  return [
    {
      id: "default",
      name: "Domyślny Układ",
      component: lazy(() => import("../layouts/EduLayout")),
    },
    {
      id: "sidebar",
      name: "Układ z Paskiem Bocznym",
      component: lazy(() => import("../../default/layouts/SidebarLayout")),
    },
  ];
}
