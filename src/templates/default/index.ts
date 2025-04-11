// src/templates/default/index.ts
import { lazy } from "react";
import {
  BaseTemplate,
  BaseTemplateConfig,
  BaseWorkspaceData,
  Scenario,
} from "../baseTemplate";
import { WidgetCategory } from "@/lib/templates";


export class DefaultTemplate extends BaseTemplate {
  readonly id = "default";
  readonly name = "Default Template";
  readonly description = "The standard template with a clean, modern design";
  readonly version = "1.0.0";
  readonly author = "Application Team";

  getConfig(): BaseTemplateConfig {
    // Layouts
    const layouts = [
      {
        id: "default",
        name: "Default Layout",
        component: lazy(() => import("./layouts/DefaultLayout")),
      },
      {
        id: "sidebar",
        name: "Sidebar Layout",
        component: lazy(() => import("./layouts/SidebarLayout")),
      },
    ];

    // Widgets
    const widgets = [
      {
        id: "card-list",
        name: "Card List",
        category: "scenario" as WidgetCategory,
        component: lazy(() => import("./widgets/CardListWidget")),
      },
      {
        id: "table-list",
        name: "Table List",
        category: "scenario" as WidgetCategory,
        component: lazy(() => import("./widgets/TableListWidget")),
      },
    ];

    // Flow steps
    const flowSteps = [
      {
        id: "basic-step",
        name: "Basic Step",
        compatibleNodeTypes: ["default", "input"],
        component: lazy(() => import("./flowSteps/BasicStepTemplate")),
      },
      {
        id: "llm-query",
        name: "LLM Query",
        compatibleNodeTypes: ["llm"],
        component: lazy(() => import("./flowSteps/LlmQueryTemplate")),
      },
      {
        id: "form-step",
        name: "Form Input",
        compatibleNodeTypes: ["form"],
        component: lazy(() => import("./flowSteps/FormInputTemplate")),
      },
    ];

    return {
      id: this.id,
      name: this.name,
      description: this.description,
      version: this.version,
      author: this.author,
      layouts,
      widgets,
      flowSteps,
    };
  }

  getDefaultWorkspaceData(): BaseWorkspaceData {
    // Scenariusz analizy marketingowej strony www
    const marketingScenario: Scenario = {
      id: "scenario-1",
      name: "Analiza Marketingowa WWW",
      description: "Analiza strony internetowej pod kątem marketingowym",
      nodes: [
        {
          id: "form-node-1",
          scenarioId: "scenario-1",
          label: "Adres WWW",
          assistantMessage:
            "Witaj! Podaj adres strony internetowej do analizy marketingowej:",
          contextPath: "primaryWebAnalysing",
          templateId: "form-step",
          attrs: {
            formSchemaPath: "formSchemas.websiteForm",
          },
        },
        {
          id: "ai-analysis-node",
          scenarioId: "scenario-1",
          label: "Analiza AI",
          // assistantMessage:
          //   "Dziękuję! Przeanalizuję stronę {{primaryWebAnalysing.www}}, dostarczajac odpowiednio sformatowaną odpowiedź.",
          contextPath: "primaryWebAnalysing",
          templateId: "llm-query",
          attrs: {
            autoStart:true,   
            llmSchemaPath: "llmSchemas.webAnalysing",
            includeSystemMessage: true,
            initialUserMessage: "Przeanalizuj adres www {{primaryWebAnalysing.www}}. Odpowiedź wyslij jako obiekt JSON zgodnie ze schematem:",
          },
        },
      ],
      systemMessage:
        "Jesteś w roli twórcy strategii marketingowej. Używamy języka polskiego.",
    };

    // Dane początkowe kontekstu
    const initialContext: Record<string, any> = {
      primaryWebAnalysing: {
        www: "",
      },
      primaryWebAnalysing: [],
      formSchemas: {
        websiteForm: [
          {
            name: "www",
            label: "Adres strony WWW",
            type: "text",
            required: true,
          },
        ],
      },
      llmSchemas: {
        webAnalysing: {
            ogólny_opis: "Główne funkcje i typ strony",
            branża:"Nazwa najbardziej pasujęcej branży",
            grupa_docelowa: "Do kogo skierowana jest strona",
            mocne_strony: ["lista kluczowych stron"],
            słabe_strony: ["lista słabych stron"],
            sugestie_marketingowe: "Jak poprawić konwersję",
        },
      },
    };

    // Zwrócenie danych workspace
    return {
      id: "workspace-1",
      name: "Analiza Marketingowa",
      description: "Workspace do analizy marketingowej stron internetowych",
      scenarios: [marketingScenario],
      templateSettings: {
        layoutTemplate: "default",
        scenarioWidgetTemplate: "card-list",
        defaultFlowStepTemplate: "basic-step",
        theme: "light",
      },
      initialContext,
    };
  }
}
