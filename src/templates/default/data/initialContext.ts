// src/templates/default/data/initialContext.ts
import { getSchemas } from './schemas';

export function getInitialContext() {
  return {
    // Domena: strona internetowa
    web: {
      url: "https://example.com",  // Domyślna wartość, by uniknąć braku wartości
      analysis: {
        // Wstępne wartości, by uniknąć błędów przy odwoływaniu się do niezdefiniowanych właściwości
        general_description: "",
        industry: "",
        target_audience: "",
        strengths: [],
        weaknesses: [],
        marketing_suggestions: ""
      }
    },
    
    // Domena: kampania Facebook
    campaign: {
      // Wartości domyślne dla ustawień kampanii
      goal: "Świadomość marki",
      budget: 100,
      duration: 7,
      
      // Pozostałe sekcje kampanii
      content: {},
      api: {},
      stats: {
        timeframe: "week",  // Domyślny okres czasu
      },
      optimizations: {
        increaseBudget: "Nie",
        expandTargeting: "Nie",
        changeCta: "Nie",
        autoBidding: "Nie"
      },
      summary: {}
    },
    
    // Lepsze nazwy domen dla wsparcia innych szablonów 
    // (aliasy dla kompatybilności wstecznej)
    primaryWebAnalysing: {
      www: "https://example.com",
      branża: "",
      grupa_docelowa: ""
    },
    
    fbCampaign: {
      cel: "Świadomość marki",
      budżet: 100,
      czas_trwania: 7,
      settings: {
        cel: "Świadomość marki",
        budżet: 100,
        czas_trwania: 7
      },
      content: {
        tytuł_reklamy: "",
        opis_reklamy: "",
        call_to_action: "Dowiedz się więcej"
      }
    },
    
    // Centralne repozytorium schematów
    schemas: getSchemas()
  };
}