// src/templates/default/data/scenarios/fbApiScenario.ts
import { Scenario } from "../../../baseTemplate";

export function getFbApiScenario(): Scenario {
  return {
    id: "scenario-2",
    name: "Implementacja i Monitoring Kampanii Facebook API",
    description: "Wdrożenie przygotowanej kampanii przez Facebook Marketing API i analiza wyników",
    nodes: [
      // Krok 1: Integracja z API
      {
        id: "campaign-api-integration",
        scenarioId: "scenario-2",
        label: "Integracja z API",
        assistantMessage: 
          "Teraz zaimplementujemy przygotowaną wcześniej kampanię za pomocą Facebook Marketing API. " +
          "Wymagane są dane uwierzytelniające: token dostępu do API oraz ID konta reklamowego.",
        contextPath: "campaign.api",
        templateId: "fb-api-integration",
        metadata: {
          description: "Łączy się z Facebook Marketing API i wdraża kampanię"
        }
      },
      
      // Krok 2: Optymalizacje kampanii
      {
        id: "campaign-optimizations",
        scenarioId: "scenario-2",
        label: "Optymalizacje",
        assistantMessage: 
          "Na podstawie danych z implementacji kampanii możemy zaproponować kilka optymalizacji. " +
          "Wybierz, które z poniższych optymalizacji chcesz zastosować:",
        contextPath: "campaign.optimizations",
        templateId: "form-step",
        attrs: {
          formSchemaPath: "schemas.form.campaignOptimizations",
        },
        metadata: {
          description: "Pozwala wybrać optymalizacje dla kampanii reklamowej"
        }
      },
      
      // Krok 3: Statystyki kampanii
      {
        id: "campaign-statistics",
        scenarioId: "scenario-2",
        label: "Statystyki",
        assistantMessage: 
          "Oto statystyki Twojej kampanii reklamowej. Możesz analizować wyniki dla różnych okresów czasowych " +
          "i sprawdzić kluczowe wskaźniki efektywności.",
        contextPath: "campaign.stats",
        templateId: "fb-campaign-stats",
        metadata: {
          description: "Wyświetla aktualne statystyki kampanii z różnych okresów"
        }
      },
      
      // Krok 4: Analiza AI
      {
        id: "campaign-analysis",
        scenarioId: "scenario-2",
        label: "Analiza AI",
        assistantMessage: 
          "Na podstawie zgromadzonych danych przygotowuję kompleksową analizę kampanii. " +
          "Proszę czekać...",
        contextPath: "campaign.summary",
        templateId: "llm-query",
        attrs: {
          autoStart: true,
          includeSystemMessage: true,
          llmSchemaPath: "schemas.llm.campaignSummary",
          initialUserMessage: 
            "Przygotuj podsumowanie kampanii Facebook na podstawie statystyk. " +
            "Uwzględnij wskaźniki efektywności kampanii z okresu {{campaign.stats.timeframe}}, " +
            "a także zastosowane optymalizacje: {{campaign.optimizations.increaseBudget}}, " +
            "{{campaign.optimizations.expandTargeting}}, {{campaign.optimizations.changeCta}}. " +
            "Przedstaw wnioski i rekomendacje na przyszłość."
        },
        metadata: {
          description: "Analizuje kampanię przy użyciu AI i generuje rekomendacje"
        }
      },
      
      // Krok 5: Wizualizacja podsumowania
      {
        id: "campaign-summary-visualization",
        scenarioId: "scenario-2",
        label: "Podsumowanie",
        assistantMessage: 
          "Oto kompleksowe podsumowanie Twojej kampanii Facebook. " +
          "Analizujemy wyniki, wpływ zastosowanych optymalizacji oraz przedstawiamy rekomendacje na przyszłość.",
        contextPath: "campaign",
        templateId: "fb-campaign-summary",
        metadata: {
          description: "Wizualizuje kompleksowe podsumowanie kampanii i jej wyników"
        }
      }
    ],
    systemMessage: 
      "Jesteś ekspertem ds. marketingu internetowego ze specjalizacją w kampaniach Facebook Ads. Używamy języka polskiego. Potrafisz szczegółowo analizować dane kampanii i rekomendować optymalizacje dla najlepszych wyników."
  };
}