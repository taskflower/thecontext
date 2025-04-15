// src/templates/default/data/schemas.ts

/**
 * Centralne repozytorium wszystkich schematów dla aplikacji
 * Zawiera zarówno schematy formularzy jak i modeli językowych
 */
export function getSchemas() {
  return {
    // Schematy formularzy
    form: {
      // Formularz adresu strony WWW
      website: [
        {
          name: "url",
          label: "Adres strony WWW",
          type: "text",
          required: true,
          description: "Pełny adres URL strony do analizy (np. https://example.com)"
        },
      ],

      // Formularz ustawień kampanii Facebook
      campaignSettings: [
        {
          name: "goal",
          label: "Cel kampanii",
          type: "select",
          required: true,
          description: "Określa główny cel reklamowy",
          options: [
            "Świadomość marki",
            "Ruch na stronie",
            "Konwersje",
            "Instalacje aplikacji",
            "Pozyskiwanie leadów"
          ]
        },
        {
          name: "budget",
          label: "Dzienny budżet (PLN)",
          type: "number",
          required: true,
          description: "Kwota w PLN do wydania dziennie"
        },
        {
          name: "duration",
          label: "Czas trwania kampanii (dni)",
          type: "number",
          required: true,
          description: "Liczba dni, przez które kampania będzie aktywna"
        }
      ],

      // Formularz optymalizacji kampanii
      campaignOptimizations: [
        {
          name: "increaseBudget",
          label: "Zwiększ dzienny budżet o 20%",
          type: "select",
          required: true,
          options: ["Tak", "Nie"],
          description: "Zwiększa budżet kampanii dla potencjalnie lepszych wyników"
        },
        {
          name: "expandTargeting",
          label: "Rozszerz targetowanie o dodatkowe grupy",
          type: "select",
          required: true,
          options: ["Tak", "Nie"],
          description: "Poszerza grupę docelową o nowe segmenty demograficzne"
        },
        {
          name: "changeCta",
          label: "Zmodyfikuj przycisk CTA",
          type: "select",
          required: true,
          options: ["Tak", "Nie"],
          description: "Zmienia tekst przycisku wezwania do działania"
        },
        {
          name: "autoBidding",
          label: "Włącz automatyczną optymalizację stawek",
          type: "select",
          required: true,
          options: ["Tak", "Nie"],
          description: "Pozwala systemowi Facebook automatycznie dostosowywać stawki"
        }
      ]
    },

    // Schematy dla modeli językowych (LLM)
    llm: {
      // Schemat analizy strony
      webAnalysis: {
        general_description: "Główne funkcje i typ strony", 
        industry: "Nazwa najbardziej pasującej branży",
        target_audience: "Do kogo skierowana jest strona",
        strengths: ["Lista mocnych stron witryny"],
        weaknesses: ["Lista słabych stron witryny"],
        marketing_suggestions: "Jak poprawić konwersję"
      },

      // Schemat treści kampanii reklamowej
      campaignContent: {
        ad_title: "Krótki, chwytliwy tytuł reklamy",
        ad_text: "Tekst reklamy zgodny z celem kampanii",
        call_to_action: "Tekst przycisku CTA",
        visual_suggestions: "Opis grafiki która powinna być użyta w reklamie",
        target_audience: {
          gender: "Kobiety, Mężczyźni lub Wszyscy",
          age_from: "Dolna granica wieku grupy docelowej",
          age_to: "Górna granica wieku grupy docelowej",
          interests: ["Lista zainteresowań grupy docelowej"]
        }
      },
      
      // Schemat podsumowania kampanii
      campaignSummary: {
        overview: "Ogólny opis kampanii",
        performance: {
          impressions: "Szacowana liczba wyświetleń",
          clicks: "Szacowana liczba kliknięć",
          ctr: "Szacowany CTR (Click-Through Rate)",
          cpc: "Szacowany koszt kliknięcia"
        },
        recommendations: ["Lista rekomendacji dotyczących kampanii"],
        roi_prediction: "Przewidywany zwrot z inwestycji"
      }
    }
  };
}