// src/templates/default/data/scenarios/marketingScenario.ts
import { Scenario } from "../../../baseTemplate";

export function getMarketingScenario(): Scenario {
  return {
    id: "scenario-1",
    name: "Analiza Marketingowa WWW i Kampania Facebook",
    description: "Analiza strony internetowej pod kątem marketingowym i przygotowanie kampanii Facebook",
    nodes: [
      // Krok 1: Pobieranie adresu strony WWW
      {
        id: "website-url-form",
        scenarioId: "scenario-1",
        label: "Adres strony WWW",
        assistantMessage: "Witaj! Podaj adres strony internetowej do analizy marketingowej:",
        contextPath: "web",  // Zmieniono z web.url na web, aby zapisać cały obiekt
        templateId: "form-step",
        attrs: {
          schemaPath: "schemas.form.website",  // Poprawiono ścieżkę schematu
        },
        metadata: {
          description: "Pobiera od użytkownika adres strony do analizy"
        }
      },
      
      // Krok 2: Analiza strony przez AI
      {
        id: "website-ai-analysis",
        scenarioId: "scenario-1",
        label: "Analiza AI",
        contextPath: "web.analysis",
        templateId: "llm-query",  // Używamy istniejącego komponentu
        attrs: {
          autoStart: true,   
          schemaPath: "schemas.llm.webAnalysis",  // Użyto nowej ścieżki schematu
          includeSystemMessage: true,
          initialUserMessage: "Przeanalizuj adres WWW {{web.url}}. Przygotuj kompleksową analizę marketingową tej strony. Odpowiedź wyślij jako obiekt JSON zgodnie ze schematem:",
        },
        metadata: {
          description: "Analizuje stronę internetową przy użyciu AI i generuje raport"
        }
      },
      
      // Krok 3: Ustawienia kampanii Facebook
      {
        id: "campaign-settings-form",
        scenarioId: "scenario-1",
        label: "Ustawienia kampanii",
        assistantMessage: "Teraz przygotujmy kampanię reklamową na Facebook. Proszę uzupełnić podstawowe ustawienia kampanii:",
        contextPath: "campaign",  // Zmieniono z campaign.settings na campaign, aby zapisać cały obiekt
        templateId: "form-step",
        attrs: {
          schemaPath: "schemas.form.campaignSettings",  // Poprawiono ścieżkę schematu
        },
        metadata: {
          description: "Zbiera podstawowe parametry kampanii reklamowej"
        }
      },
      
      // Krok 4: Generowanie treści kampanii przez AI
      {
        id: "campaign-content-generation",
        scenarioId: "scenario-1",
        label: "Treść kampanii",
        contextPath: "campaign.content",
        templateId: "llm-query",  // Używamy istniejącego komponentu
        attrs: {
          autoStart: true,
          schemaPath: "schemas.llm.campaignContent",  // Użyto nowej ścieżki schematu
          includeSystemMessage: true,
          initialUserMessage: "Na podstawie analizy strony {{web.url}} i jej wyników ({{web.analysis.general_description}}, branża: {{web.analysis.industry}}, grupa docelowa: {{web.analysis.target_audience}}) oraz ustawień kampanii (cel: {{campaign.goal}}, budżet: {{campaign.budget}} PLN, czas trwania: {{campaign.duration}} dni), przygotuj treść reklamy na Facebook. Odpowiedź wyślij jako obiekt JSON zgodnie ze schematem:",
          // Zmieniono ścieżki z campaign.settings.X na campaign.X, by pasowały do nowej struktury
        },
        metadata: {
          description: "Generuje optymalne treści reklamowe na podstawie analizy i parametrów"
        }
      },
      
      // Krok 5: Podsumowanie kampanii
      {
        id: "campaign-summary",
        scenarioId: "scenario-1",
        label: "Podsumowanie kampanii",
        contextPath: "campaign.summary",
        templateId: "llm-query",  // Używamy istniejącego komponentu
        attrs: {
          autoStart: true,
          schemaPath: "schemas.llm.campaignSummary",  // Użyto nowej ścieżki schematu
          includeSystemMessage: true,
          initialUserMessage: "Przygotuj podsumowanie kampanii reklamowej dla strony {{web.url}}. Uwzględnij analizę strony, ustawienia kampanii (cel: {{campaign.goal}}, budżet: {{campaign.budget}} PLN) oraz wygenerowane treści kampanii. Odpowiedź wyślij jako obiekt JSON zgodnie ze schematem:",
          // Zmieniono ścieżki z campaign.settings.X na campaign.X, by pasowały do nowej struktury
        },
        metadata: {
          description: "Tworzy kompleksowe podsumowanie i prognozę efektów kampanii"
        }
      },
      
      // Krok 6: Wizualny podgląd kampanii
      {
        id: "campaign-preview",
        scenarioId: "scenario-1",
        label: "Podgląd kampanii",
        assistantMessage: "Oto podgląd Twojej kampanii reklamowej na Facebook. Przeanalizuj wszystkie elementy kampanii i sprawdź, czy wszystko jest zgodne z Twoimi oczekiwaniami.",
        contextPath: "campaign",
        templateId: "fb-campaign-preview",
        metadata: {
          description: "Wyświetla wizualny podgląd całej kampanii reklamowej"
        }
      }
    ],
    systemMessage:
      "Jesteś doświadczonym specjalistą ds. marketingu internetowego ze specjalizacją w reklamach Facebook. Używamy języka polskiego. Twoje analizy są zawsze oparte na najlepszych praktykach marketingowych."
  };
}