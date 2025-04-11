// src/templates/default/data/llmSchemas.ts

export function getLlmSchemas() {
    return {
      webAnalysing: {
        ogólny_opis: "Główne funkcje i typ strony",
        branża: "Nazwa najbardziej pasującej branży",
        grupa_docelowa: "Do kogo skierowana jest strona",
        mocne_strony: ["lista kluczowych stron"],
        słabe_strony: ["lista słabych stron"],
        sugestie_marketingowe: "Jak poprawić konwersję",
      },
      fbCampaignContent: {
        tytuł_reklamy: "Krótki, chwytliwy tytuł reklamy",
        opis_reklamy: "Tekst reklamy zgodny z celem kampanii",
        call_to_action: "Tekst przycisku CTA",
        sugestie_graficzne: "Opis grafiki która powinna być użyta w reklamie",
        grupa_docelowa: {
          płeć: "Kobiety, Mężczyźni lub Wszyscy",
          wiek_od: "Dolna granica wieku grupy docelowej",
          wiek_do: "Górna granica wieku grupy docelowej",
          zainteresowania: ["lista zainteresowań"]
        }
      }
    };
  }