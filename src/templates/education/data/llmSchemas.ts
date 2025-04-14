// src/templates/education/data/llmSchemas.ts

export function getLlmSchemas() {
    return {
      lessonContent: {
        tytul: "Tytuł lekcji",
        cele_nauczania: ["lista celów nauczania"],
        wprowadzenie: "Krótkie wprowadzenie do tematu",
        kluczowe_pojecia: ["lista kluczowych pojęć z definicjami"],
        tresc_glowna: "Główna treść lekcji z wyjaśnieniami",
        przyklady: ["lista przykładów zastosowania"],
        interaktywne_cwiczenia: ["lista ćwiczeń do wykonania"],
        podsumowanie: "Krótkie podsumowanie najważniejszych informacji"
      },
      quizContent: {
        tytul_quizu: "Tytuł quizu",
        poziom_trudnosci: "podstawowy/średni/zaawansowany",
        pytania: [{
          tresc: "Treść pytania",
          typ: "wielokrotny wybór/prawda-fałsz/uzupełnij",
          odpowiedzi: ["lista możliwych odpowiedzi"],
          poprawna_odpowiedz: "Poprawna odpowiedź",
          wyjasnienie: "Wyjaśnienie dlaczego ta odpowiedź jest poprawna"
        }]
      },
      projectIdea: {
        tytul_projektu: "Tytuł projektu edukacyjnego",
        opis: "Szczegółowy opis projektu",
        cele: ["lista celów edukacyjnych projektu"],
        wymagania: ["lista wymagań formalnych"],
        etapy: ["lista etapów realizacji"],
        wskazowki: ["przydatne wskazówki dla uczniów"],
        kryteria_oceny: ["lista kryteriów według których projekt będzie oceniony"],
        materialy_dodatkowe: ["lista przydatnych materiałów"]
      }
    };
  }