// src/lib/templates.ts
import { lazy } from "react";

// Dynamiczne importy dla layoutów
const layoutImports = {
  default: lazy(() => import("@/tpl/default/layouts/DefaultLayout")),
  sidebar: lazy(() => import("@/tpl/default/layouts/SidebarLayout")),
  simple: lazy(() => import("@/tpl/minimal/layouts/SimpleLayout")),
};

// Dynamiczne importy dla widgetów
const widgetImports = {
  "card-list": lazy(() => import("@/tpl/default/widgets/CardListWidget")),
  "context-display": lazy(
    () => import("@/tpl/default/widgets/ContextDisplayWidget")
  ),
};

// Dynamiczne importy dla kroków przepływu
const flowStepImports = {
  // Domyślne kroki z default template
  "basic-step": lazy(() => import("@/tpl/default/flowSteps/BasicStepTemplate")),
  "form-step": lazy(() => import("@/tpl/default/flowSteps/FormInputTemplate")),
  "llm-query": lazy(() => import("@/tpl/default/flowSteps/LlmQueryTemplate")),

  // Kroki z minimal template
  "summary-step": lazy(
    () => import("@/tpl/minimal/flowSteps/SummaryStepTemplate")
  ),
  "llm-step": lazy(() => import("@/tpl/minimal/flowSteps/LlmStepTemplate")),
  "form-step-minimal": lazy(
    () => import("@/tpl/minimal/flowSteps/FormStepTemplate")
  ),
};

export function getLayoutComponent(id: string) {
  return layoutImports[id as keyof typeof layoutImports] || null;
}

export function getWidgetComponent(id: string) {
  return widgetImports[id as keyof typeof widgetImports] || null;
}

export function getFlowStepComponent(id: string) {
  console.error('Błąd: Nie znaleziono komponentu przepływu', {
    requestedId: id,
    availableComponents: Object.keys(flowStepImports),
    suggestedAlternative: id.replace('-minimal', '')
  });

  // Spróbuj znaleźć komponent bez sufiksu '-minimal'
  const alternativeId = id.replace('-minimal', '');
  return flowStepImports[alternativeId as keyof typeof flowStepImports] || null;
}

export function getFlowStepForNodeType(nodeType: string) {
  const nodeTypeToStepMap: Record<string, string> = {
    default: "basic-step",
    form: "form-step-minimal",
    llm: "llm-step",
    summary: "summary-step",  // Ensure this maps to the minimal template's summary step
  };

  const stepId = nodeTypeToStepMap[nodeType];
  return stepId ? getFlowStepComponent(stepId) : null;
}
