// src/services/setupLLMService/promptBuilder.ts
import { LLMMessage } from "./types";

export class PromptBuilder {
  private static readonly SYSTEM_PROMPT = `Jesteś asystentem AI, który pomaga w konfiguracji struktury projektów.
      
Twoje zadanie to wygenerowanie odpowiedniej struktury projektu na podstawie opisu użytkownika.
Struktura powinna zawierać:
- kontenery (foldery) do organizacji dokumentów
- szablony zadań z odpowiednimi krokami
- początkowe zadanie do wykonania

Zwróć odpowiedź jako JSON zgodny z poniższą strukturą:
{
  "projectName": "Nazwa projektu",
  "containers": [
    {
      "name": "Nazwa kontenera",
      "documents": [
        {
          "title": "Tytuł dokumentu",
          "content": "Treść dokumentu"
        }
      ]
    }
  ],
  "templates": [
    {
      "name": "Nazwa szablonu",
      "description": "Opis szablonu",
      "defaultPriority": "medium", // lub "low", "high"
      "defaultSteps": [
        {
          "order": 1,
          "type": "retrieval", // lub "processing", "generation", "validation", "custom"
          "description": "Opis kroku"
        }
      ]
    }
  ],
  "initialTask": {
    "title": "Tytuł początkowego zadania",
    "description": "Opis zadania",
    "priority": "high" // lub "low", "medium"
  }
}

Odpowiedz wyłącznie w formacie JSON. Nie dodawaj dodatkowego tekstu przed ani po JSON.
Dostosuj strukturę projektu do konkretnych potrzeb użytkownika.`;

  static createProjectSetupSystemPrompt(): LLMMessage {
    return {
      role: "system",
      content: this.SYSTEM_PROMPT
    };
  }

  static createProjectSetupUserPrompt(
    projectName: string,
    projectDescription: string,
    intent: string
  ): LLMMessage {
    const projectTypeGuidance = this.getProjectTypeGuidance();
    
    return {
      role: "user",
      content: `Potrzebuję stworzyć projekt o nazwie "${projectName}" 
z opisem: "${projectDescription}".

Moje konkretne potrzeby dla tego projektu to: "${intent}".

Proszę o wygenerowanie kompletnej struktury projektu z odpowiednimi kontenerami, szablonami i początkowym zadaniem.
Pamiętaj, że projekt dotyczy: ${projectName} i ma cel: ${projectDescription}.
Struktura projektu powinna być dostosowana do moich potrzeb: ${intent}.

${projectTypeGuidance}

Dostosuj szablony zadań do rodzaju projektu.`
    };
  }

  private static getProjectTypeGuidance(): string {
    return `Jeśli projekt dotyczy nauki, utwórz kontenery dla materiałów edukacyjnych, ćwiczeń i notatek.
Jeśli projekt dotyczy marketingu, utwórz kontenery dla materiałów marketingowych, kampanii i analiz.
Jeśli projekt dotyczy badań, utwórz kontenery dla danych badawczych, analiz i wyników.`;
  }

  static createProjectSetupPrompt(
    projectName: string,
    projectDescription: string,
    intent: string
  ): LLMMessage[] {
    return [
      this.createProjectSetupSystemPrompt(),
      this.createProjectSetupUserPrompt(projectName, projectDescription, intent)
    ];
  }
}