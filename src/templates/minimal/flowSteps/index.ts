// src/templates/minimal/flowSteps/index.ts
import { FlowStepTemplate } from "../../baseTemplate";
import { lazy } from "react";

export function getFlowStepsConfig(): FlowStepTemplate[] {
  return [
    {
      id: "form-step",
      name: "Form Input",
      compatibleNodeTypes: ["form"],
      component: lazy(() => import("./FormStepTemplate")),
    },
    {
      id: "llm-step",
      name: "LLM Query",
      compatibleNodeTypes: ["llm"],
      component: lazy(() => import("./LlmStepTemplate")),
    },
    {
      id: "summary-step",
      name: "Summary Step",
      compatibleNodeTypes: ["summary"],
      component: lazy(() => import("./SummaryStepTemplate")),
    },
  ];
}