// src/templates/minimal/workspaces/index.ts - Updated with icons
import { Workspace } from "../../baseTemplate";

export const workspaces: Workspace[] = [
  {
    id: "workspace-minimal", // unikaj kolizji z default ("workspace-1")
    name: "Demo Biznesowe",
    description: "Zbieranie danych i generowanie raportu AI",
    icon: "briefcase", // Dodana ikona dla workspace'a
    templateSettings: {
      layoutTemplate: "simple",
      scenarioWidgetTemplate: "icon-card-list", // Zmienione na nasz nowy widget
      defaultFlowStepTemplate: "form-step",
    },
    getScenarios: () => [
      {
        id: "scenario-business",
        name: "Analiza finansowa",
        description: "Zbierz dane i wygeneruj raport ROI",
        icon: "calculator", // Dodana ikona dla scenariusza
        systemMessage: "Jesteś asystentem finansowym.",
        getSteps: () => [
          {
            id: "collect-data",
            scenarioId: "scenario-business",
            label: "Dane finansowe",
            assistantMessage: "Podaj przychody i koszty projektu:",
            contextPath: "collect-data",
            templateId: "form-step",
            attrs: { schemaPath: "schemas.form.business" },
          },
          {
            id: "generate-report",
            scenarioId: "scenario-business",
            label: "Raport ROI",
            assistantMessage: "Generuję raport ROI na podstawie danych...",
            contextPath: "generate-report",
            templateId: "llm-step",
            attrs: {
              autoStart: true,
              includeSystemMessage: true,
              initialUserMessage: 
                "Na podstawie danych: przychody={{collect-data.revenue}}, koszty={{collect-data.cost}} oblicz ROI i zaproponuj rekomendacje.",
              schemaPath: "schemas.llm.businessReport",
            },
          },
          {
            id: "show-summary",
            scenarioId: "scenario-business",
            label: "Podsumowanie",
            assistantMessage: "Oto podsumowanie wyników analizy finansowej twojego projektu. Przeanalizowaliśmy wprowadzone dane i obliczony został zwrot z inwestycji (ROI).",
            contextPath: "summary",
            templateId: "summary-step",
            attrs: {}
          }
        ],
      },
      // Dodany drugi scenariusz
      {
        id: "scenario-quiz",
        name: "Quiz matematyczny",
        description: "Sprawdź swoją wiedzę z algebry",
        icon: "math", // Ikona matematyki
        systemMessage: "Jesteś asystentem matematycznym.",
        getSteps: () => [
          {
            id: "intro",
            scenarioId: "scenario-quiz",
            label: "Wprowadzenie",
            assistantMessage: "Witaj w quizie matematycznym! Odpowiedz na pytania związane z algebrą.",
            contextPath: "intro",
            templateId: "form-step",
            attrs: { schemaPath: "schemas.form.intro" },
          }
        ],
      }
    ],
    getInitialContext: () => ({
      schemas: {
        form: {
          business: [
            { name: "revenue", label: "Przychody (PLN)", type: "number", required: true },
            { name: "cost", label: "Koszty (PLN)", type: "number", required: true },
          ],
          intro: [
            { name: "name", label: "Imię i nazwisko", type: "text", required: true },
          ]
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