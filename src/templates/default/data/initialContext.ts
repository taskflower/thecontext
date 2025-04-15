// src/templates/default/data/initialContext.ts
import { getSchemas } from './schemas';

export function getInitialContext() {
  return {
    // Domena: strona internetowa
    web: {
      url: "",           // Adres strony (wejście)
      analysis: {}       // Analiza AI (wyjście)
    },
    
    // Domena: kampania Facebook
    campaign: {
      settings: {},      // Ustawienia kampanii (formularz)
      content: {},       // Treści kampanii (AI)
      api: {},           // Dane API
      stats: {},         // Statystyki
      optimizations: {}, // Optymalizacje
      summary: {}        // Podsumowanie
    },
    
    // Centralne repozytorium schematów
    schemas: getSchemas()
  };
}