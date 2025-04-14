// src/templates/education/data/formSchemas.ts

export function getFormSchemas() {
    return {
      subjectSelection: [
        {
          name: "subject",
          label: "Przedmiot",
          type: "select",
          required: true,
          options: [
            "Matematyka",
            "Fizyka",
            "Chemia",
            "Biologia",
            "Historia",
            "Język polski",
            "Geografia",
            "Informatyka",
            "WOS"
          ]
        },
        {
          name: "topic",
          label: "Temat",
          type: "text",
          required: true
        },
        {
          name: "level",
          label: "Poziom zaawansowania",
          type: "select",
          required: true,
          options: [
            "podstawowy",
            "średnio-zaawansowany",
            "zaawansowany"
          ]
        }
      ],
      quizOptions: [
        {
          name: "questionCount",
          label: "Liczba pytań",
          type: "select",
          required: true,
          options: ["5", "10", "15", "20"]
        },
        {
          name: "includeExplanations",
          label: "Dołącz wyjaśnienia odpowiedzi",
          type: "select",
          required: true,
          options: ["Tak", "Nie"]
        }
      ],
      projectSettings: [
        {
          name: "projectType",
          label: "Typ projektu",
          type: "select",
          required: true,
          options: [
            "Esej",
            "Prezentacja",
            "Badanie",
            "Eksperyment",
            "Analiza danych"
          ]
        },
        {
          name: "deadlineWeeks",
          label: "Czas na wykonanie (tygodnie)",
          type: "number",
          required: true
        }
      ]
    };
  }