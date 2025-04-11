// src/templates/default/data/scenarios/marketingScenario.ts
import { Scenario } from "../../../baseTemplate";

export function getMarketingScenario(): Scenario {
  return {
    id: "scenario-1",
    name: "Analiza Marketingowa WWW i Kampania Facebook",
    description: "Analiza strony internetowej pod kątem marketingowym i przygotowanie kampanii Facebook",
    nodes: [
      // Existing nodes - untouched
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
        contextPath: "primaryWebAnalysing",
        templateId: "llm-query",
        attrs: {
          autoStart: true,   
          llmSchemaPath: "llmSchemas.webAnalysing",
          includeSystemMessage: true,
          initialUserMessage: "Przeanalizuj adres www {{primaryWebAnalysing.www}}. Odpowiedź wyslij jako obiekt JSON zgodnie ze schematem:",
        },
      },
      
      // Nodes for Facebook campaign
      {
        id: "fb-campaign-settings-node",
        scenarioId: "scenario-1",
        label: "Ustawienia Kampanii Facebook",
        assistantMessage: "Teraz przygotujmy kampanię reklamową na Facebook. Proszę uzupełnić podstawowe ustawienia kampanii:",
        contextPath: "fbCampaign.settings",
        templateId: "form-step",
        attrs: {
          formSchemaPath: "formSchemas.fbCampaignSettings",
        },
      },
      {
        id: "fb-campaign-ai-content-node",
        scenarioId: "scenario-1",
        label: "Przygotowanie treści kampanii",
        contextPath: "fbCampaign.content",
        templateId: "llm-query",
        attrs: {
          autoStart: true,
          llmSchemaPath: "llmSchemas.fbCampaignContent",
          includeSystemMessage: true,
          initialUserMessage: "Na podstawie analizy strony {{primaryWebAnalysing.www}} oraz ustawień kampanii (cel: {{fbCampaign.settings.cel}}, budżet: {{fbCampaign.settings.budżet}} PLN, czas trwania: {{fbCampaign.settings.czas_trwania}} dni), przygotuj treść reklamy na Facebook. Odpowiedź wyślij jako obiekt JSON zgodnie ze schematem:",
        },
      },
      {
        id: "fb-campaign-preview-node",
        scenarioId: "scenario-1",
        label: "Podgląd Kampanii Facebook",
        assistantMessage: "Oto podgląd Twojej kampanii reklamowej na Facebook. Możesz zaakceptować lub wrócić do poprzednich kroków, aby wprowadzić zmiany.",
        contextPath: "fbCampaign",
        templateId: "fb-campaign-preview",
      }
    ],
    systemMessage:
      "Jesteś w roli twórcy strategii marketingowej. Używamy języka polskiego."
  };
}