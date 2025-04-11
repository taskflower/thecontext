// src/templates/default/config/flowSteps.ts
import { lazy } from "react";

export function getFlowStepsConfig() {
  return [
    {
      id: "basic-step",
      name: "Basic Step",
      compatibleNodeTypes: ["default", "input"],
      component: lazy(() => import("../flowSteps/BasicStepTemplate")),
    },
    {
      id: "llm-query",
      name: "LLM Query",
      compatibleNodeTypes: ["llm"],
      component: lazy(() => import("../flowSteps/LlmQueryTemplate")),
    },
    {
      id: "form-step",
      name: "Form Input",
      compatibleNodeTypes: ["form"],
      component: lazy(() => import("../flowSteps/FormInputTemplate")),
    },
    // Facebook Campaign Preview Template
    {
      id: "fb-campaign-preview",
      name: "Facebook Campaign Preview",
      compatibleNodeTypes: ["preview", "default"],
      component: lazy(() => import("../flowSteps/FbCampaignPreviewTemplate")),
    },
    // Templates for Facebook Marketing API integration
    {
      id: "fb-api-integration",
      name: "Facebook API Integration",
      compatibleNodeTypes: ["api", "default"],
      component: lazy(() => import("../flowSteps/FbApiIntegrationTemplate")),
    },
    {
      id: "fb-campaign-stats",
      name: "Facebook Campaign Stats",
      compatibleNodeTypes: ["stats", "default"],
      component: lazy(() => import("../flowSteps/FbCampaignStatsTemplate")),
    }
  ];
}