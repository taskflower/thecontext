// src/templates/education/config/flowSteps.ts
import { lazy } from "react";

export function getFlowStepsConfig() {
  return [
    {
      id: "basic-step",
      name: "Podstawowy Krok",
      compatibleNodeTypes: ["default", "input"],
      component: lazy(() => import("../../default/flowSteps/BasicStepTemplate")),
    },
    {
      id: "form-step",
      name: "Formularz",
      compatibleNodeTypes: ["form"],
      component: lazy(() => import("../../default/flowSteps/FormInputTemplate")),
    },
    {
      id: "llm-query",
      name: "Zapytanie LLM",
      compatibleNodeTypes: ["llm"],
      component: lazy(() => import("../../default/flowSteps/LlmQueryTemplate")),
    },
    {
      id: "content-display",
      name: "Wyświetlanie Treści",
      compatibleNodeTypes: ["lesson", "project", "default"],
      component: lazy(() => import("../flowSteps/ContentDisplayFlowStep")),
    },
    {
      id: "quiz-interaction",
      name: "Interakcja z Quizem",
      compatibleNodeTypes: ["quiz", "default"],
      component: lazy(() => import("../flowSteps/QuizInteractionTemplate")),
    }
  ];
}