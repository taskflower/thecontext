// src/templates/default/flowSteps/index.ts
import { lazy } from "react";
import { FlowStepTemplate } from "../../baseTemplate";

export function getFlowStepsConfig(): FlowStepTemplate[] {
  return [
    {
      id: "basic-step",
      name: "Basic Step",
      compatibleNodeTypes: ["default", "input"],
      component: lazy(() => import("./BasicStepTemplate")),
    },
    {
      id: "llm-query",
      name: "LLM Query",
      compatibleNodeTypes: ["llm"],
      component: lazy(() => import("./LlmQueryTemplate")),
    },
    {
      id: "form-step",
      name: "Form Input",
      compatibleNodeTypes: ["form"],
      component: lazy(() => import("./FormInputTemplate")),
    },
    {
      id: "fb-campaign-preview",
      name: "Facebook Campaign Preview",
      compatibleNodeTypes: ["preview", "default"],
      component: lazy(() => import("./FbCampaignPreviewTemplate")),
    },
    {
      id: "fb-api-integration",
      name: "Facebook API Integration",
      compatibleNodeTypes: ["api", "default"],
      component: lazy(() => import("./FbApiIntegrationTemplate")),
    },
    {
      id: "fb-campaign-stats",
      name: "Facebook Campaign Stats",
      compatibleNodeTypes: ["stats", "default"],
      component: lazy(() => import("./FbCampaignStatsTemplate")),
    },
    {
      id: "fb-campaign-summary",
      name: "Facebook Campaign Summary",
      compatibleNodeTypes: ["summary", "default"],
      component: lazy(() => import("./FbCampaignSummaryTemplate")),
    }
  ];
}