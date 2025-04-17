// src/templates/minimal/layouts/index.ts
import { LayoutTemplate } from "../../baseTemplate";
import { lazy } from "react";

export function getLayoutsConfig(): LayoutTemplate[] {
  return [
    {
      id: "simple",
      name: "Simple Layout",
      component: lazy(() => import("./SimpleLayout")),
    },
  ];
}