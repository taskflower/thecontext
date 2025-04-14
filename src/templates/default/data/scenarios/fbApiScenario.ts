// src/templates/default/data/scenarios/fbApiScenario.ts
import { Scenario } from "../../../baseTemplate";

export function getFbApiScenario(): Scenario {
  return {
    id: "scenario-2",
    name: "Implementacja i Monitoring Kampanii Facebook API",
    description: "Wdrożenie przygotowanej kampanii przez Facebook Marketing API i analiza wyników",
    nodes: [
      {
        id: "fb-api-integration-node",
        scenarioId: "scenario-2",
        label: "Integracja z Facebook API",
        assistantMessage: 
          "Teraz zaimplementujemy przygotowaną wcześniej kampanię za pomocą Facebook Marketing API. " +
          "Wymagane są dane uwierzytelniające: token dostępu do API oraz ID konta reklamowego. " +
          "Wprowadź poniższe dane, aby kontynuować:",
        contextPath: "fbCampaignApi",
        templateId: "fb-api-integration",
      },
      {
        id: "campaign-optimizations-node",
        scenarioId: "scenario-2",
        label: "Optymalizacje Kampanii",
        assistantMessage: 
          "Na podstawie danych z implementacji kampanii możemy zaproponować kilka optymalizacji. " +
          "Wybierz, które z poniższych optymalizacji chcesz zastosować:",
        contextPath: "fbCampaignOptimizations",
        templateId: "form-step",
        attrs: {
          formSchemaPath: "formSchemas.fbCampaignOptimizations",
        },
      },
      {
        id: "campaign-stats-node",
        scenarioId: "scenario-2",
        label: "Statystyki Kampanii",
        assistantMessage: 
          "Oto statystyki Twojej kampanii reklamowej. Możesz analizować wyniki dla różnych okresów czasowych " +
          "i sprawdzić kluczowe wskaźniki efektywności.",
        contextPath: "fbCampaignStats",
        templateId: "fb-campaign-stats",
      },
      {
        id: "campaign-summary-node",
        scenarioId: "scenario-2",
        label: "Przygotowanie Analizy",
        assistantMessage: 
          "Na podstawie zgromadzonych danych przygotowuję analizę kampanii. " +
          "Proszę czekać...",
        contextPath: "fbCampaignSummary",
        templateId: "llm-query",
        attrs: {
          autoStart: true,
          includeSystemMessage: true,
          initialUserMessage: 
            "Przygotuj podsumowanie kampanii Facebook na podstawie analizy statystyk. " +
            "Uwzględnij wskaźniki efektywności kampanii z okresu {{fbCampaignStats.timeframe}}, " +
            "a także zastosowane optymalizacje. Przedstaw wnioski i rekomendacje na przyszłość."
        }
      },
      {
        id: "final-summary-node",
        scenarioId: "scenario-2",
        label: "Podsumowanie Kampanii",
        assistantMessage: 
          "Oto kompleksowe podsumowanie Twojej kampanii Facebook. " +
          "Analizujemy wyniki, wpływ zastosowanych optymalizacji oraz przedstawiamy rekomendacje na przyszłość.",
        contextPath: "fbCampaignFinal",
        templateId: "fb-campaign-summary",
      }
    ],
    systemMessage: 
      "Jesteś ekspertem ds. marketingu internetowego ze specjalizacją w kampaniach Facebook Ads. Używamy języka polskiego."
  };
}