// src/templates/minimal/workspaces/index.ts
import { Workspace } from "../../baseTemplate";

export const workspaces: Workspace[] = [
  {
    id: "workspace-minimal", // unikaj kolizji z default ("workspace-1")
    name: "Demo Biznesowe",
    description: "Zbieranie danych i generowanie raportu AI",
    templateSettings: {
      layoutTemplate: "simple",
      scenarioWidgetTemplate: "",
      defaultFlowStepTemplate: "form-step",
    },
    getScenarios: () => [
      {
        id: "scenario-business",
        name: "Analiza finansowa",
        description: "Zbierz dane i wygeneruj raport ROI",
        systemMessage: "Jesteś asystentem finansowym.",
        getSteps: () => [
          {
            id: "collect-data",
            scenarioId: "scenario-business",
            label: "Dane finansowe",
            assistantMessage: "Podaj przychody i koszty projektu:",
            templateId: "form-step",
            attrs: { schemaPath: "schemas.form.business" },
          },
          {
            id: "generate-report",
            scenarioId: "scenario-business",
            label: "Raport ROI",
            assistantMessage: "Generuję raport ROI na podstawie danych...",
            templateId: "llm-step",
            attrs: {
              autoStart: true,
              includeSystemMessage: true,
              initialUserMessage: 
                "Na podstawie danych: przychody={{collect-data.revenue}}, koszty={{collect-data.cost}} oblicz ROI i zaproponuj rekomendacje.",
              schemaPath: "schemas.llm.businessReport",
            },
          },
        ],
      },
    ],
    getInitialContext: () => ({
      schemas: {
        form: {
          business: [
            { name: "revenue", label: "Przychody (PLN)", type: "number", required: true },
            { name: "cost", label: "Koszty (PLN)", type: "number", required: true },
          ],
        },
        llm: {
          businessReport: {
            roi: "Obliczony zwrot z inwestycji (w %)",
            recommendations: ["Lista rekomendacji"]
          },
        },
      },
    }),
  },
];
