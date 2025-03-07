/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/LLMService.ts
import { MOCK_LLM_RESPONSE } from "../mockData";

// Interfaces
export interface LLMRequest {
  prompt: string;
  systemMessage?: string;
  userId?: string;
  useMock?: boolean;
  authToken?: string | null;
  domainContext?: string;
  customSystemPrompt?: string;
  numberOfScenarios?: number;
}

export interface LLMResponse {
  scenarios: any[];
  tasks: any[];
  steps: any[];
}

/**
 * Service responsible for interacting with the LLM API
 */
class LLMService {
  // Domain-specific system prompts
  private static readonly DOMAIN_PROMPTS: Record<string, string> = {
    marketing: `Jesteś asystentem AI specjalizującym się w tworzeniu szczegółowych scenariuszy marketingowych, zadań i kroków. 
        WAŻNE: Sformatuj swoją odpowiedź TYLKO jako poprawny obiekt JSON bez dodatkowego tekstu lub wyjaśnień.
        JSON musi zawierać następujące klucze:
        - scenarios: tablica obiektów scenariusza z polami: id, title, description, objective, connections (tablica id innych scenariuszy)
        - tasks: tablica obiektów zadań z polami: scenarioRef (odpowiadające id scenariusza), title, description, priority
        - steps: tablica obiektów kroków z polami: taskRef (odpowiadające tytułowi zadania), title, description, type (text-input, simple-plugin lub step-reference)
        
        Utwórz 3-5 powiązanych scenariuszy z 2-3 zadaniami na scenariusz i 2-3 krokami na zadanie.
        NIE dodawaj żadnego tekstu poza JSONem.`,
    
    software: `Jesteś asystentem AI specjalizującym się w tworzeniu szczegółowych scenariuszy rozwoju oprogramowania, zadań i kroków.
        WAŻNE: Sformatuj swoją odpowiedź TYLKO jako poprawny obiekt JSON bez dodatkowego tekstu lub wyjaśnień.
        JSON musi zawierać następujące klucze:
        - scenarios: tablica obiektów scenariusza z polami: id, title, description, objective, connections (tablica id innych scenariuszy)
        - tasks: tablica obiektów zadań z polami: scenarioRef (odpowiadające id scenariusza), title, description, priority
        - steps: tablica obiektów kroków z polami: taskRef (odpowiadające tytułowi zadania), title, description, type (text-input, simple-plugin lub step-reference)
        
        Utwórz 3-5 powiązanych scenariuszy rozwoju oprogramowania z 2-3 zadaniami na scenariusz i 2-3 krokami na zadanie.
        Skup się na elementach takich jak funkcjonalności, moduły, testowanie i wdrażanie.
        NIE dodawaj żadnego tekstu poza JSONem.`,
    
    productdev: `Jesteś asystentem AI specjalizującym się w tworzeniu szczegółowych scenariuszy rozwoju produktu, zadań i kroków.
        WAŻNE: Sformatuj swoją odpowiedź TYLKO jako poprawny obiekt JSON bez dodatkowego tekstu lub wyjaśnień.
        JSON musi zawierać następujące klucze:
        - scenarios: tablica obiektów scenariusza z polami: id, title, description, objective, connections (tablica id innych scenariuszy)
        - tasks: tablica obiektów zadań z polami: scenarioRef (odpowiadające id scenariusza), title, description, priority
        - steps: tablica obiektów kroków z polami: taskRef (odpowiadające tytułowi zadania), title, description, type (text-input, simple-plugin lub step-reference)
        
        Utwórz 3-5 powiązanych scenariuszy rozwoju produktu z 2-3 zadaniami na scenariusz i 2-3 krokami na zadanie.
        Skup się na badaniach, prototypowaniu, testowaniu i fazach wprowadzania produktu na rynek.
        NIE dodawaj żadnego tekstu poza JSONem.`,
    
    research: `Jesteś asystentem AI specjalizującym się w tworzeniu szczegółowych scenariuszy projektów badawczych, zadań i kroków.
        WAŻNE: Sformatuj swoją odpowiedź TYLKO jako poprawny obiekt JSON bez dodatkowego tekstu lub wyjaśnień.
        JSON musi zawierać następujące klucze:
        - scenarios: tablica obiektów scenariusza z polami: id, title, description, objective, connections (tablica id innych scenariuszy)
        - tasks: tablica obiektów zadań z polami: scenarioRef (odpowiadające id scenariusza), title, description, priority
        - steps: tablica obiektów kroków z polami: taskRef (odpowiadające tytułowi zadania), title, description, type (text-input, simple-plugin lub step-reference)
        
        Utwórz 3-5 powiązanych scenariuszy badawczych z 2-3 zadaniami na scenariusz i 2-3 krokami na zadanie.
        Skup się na formułowaniu hipotez, projektowaniu eksperymentów, zbieraniu danych, analizie i publikowaniu wyników.
        NIE dodawaj żadnego tekstu poza JSONem.`,
    
    education: `Jesteś asystentem AI specjalizującym się w tworzeniu szczegółowych scenariuszy edukacyjnych, zadań i kroków.
        WAŻNE: Sformatuj swoją odpowiedź TYLKO jako poprawny obiekt JSON bez dodatkowego tekstu lub wyjaśnień.
        JSON musi zawierać następujące klucze:
        - scenarios: tablica obiektów scenariusza z polami: id, title, description, objective, connections (tablica id innych scenariuszy)
        - tasks: tablica obiektów zadań z polami: scenarioRef (odpowiadające id scenariusza), title, description, priority
        - steps: tablica obiektów kroków z polami: taskRef (odpowiadające tytułowi zadania), title, description, type (text-input, simple-plugin lub step-reference)
        
        Utwórz 3-5 powiązanych scenariuszy edukacyjnych z 2-3 zadaniami na scenariusz i 2-3 krokami na zadanie.
        Skup się na projektowaniu programów nauczania, planowaniu lekcji, ocenianiu i angażowaniu uczniów.
        NIE dodawaj żadnego tekstu poza JSONem.`,
  };

  /**
   * Generate content using the LLM
   *
   * @param options Request options
   * @returns LLM response data
   */
  public static async generateContent(
    options: LLMRequest
  ): Promise<LLMResponse> {
    const {
      prompt,
      userId = "user123",
      useMock = false,
      authToken = null,
      domainContext = "marketing",
      customSystemPrompt = "",
      numberOfScenarios = 3,
    } = options;

    console.log("[LLMService] Generowanie treści, useMock:", useMock);
    console.log("[LLMService] Kontekst domeny:", domainContext);

    try {
      if (useMock) {
        console.log("[LLMService] Używanie przykładowych danych");
        // Symulacja opóźnienia sieciowego
        await new Promise((resolve) => setTimeout(resolve, 1500));
        return MOCK_LLM_RESPONSE;
      } else {
        // Określ, którego komunikatu systemowego użyć
        let finalSystemMessage = "";
        
        if (domainContext === "custom" && customSystemPrompt) {
          // Użyj niestandardowego promptu systemowego
          finalSystemMessage = customSystemPrompt;
        } else {
          // Użyj prompta specyficznego dla domeny lub domyślnie marketingu
          finalSystemMessage = this.DOMAIN_PROMPTS[domainContext] || this.DOMAIN_PROMPTS.marketing;
        }
        
        // Zmodyfikuj komunikat systemowy, aby uwzględnić liczbę scenariuszy
        finalSystemMessage = finalSystemMessage.replace(
          /Utwórz 3-5 powiązanych/g, 
          `Utwórz ${numberOfScenarios} powiązanych`
        );

        // Dostosuj prompt na podstawie domeny
        let enhancedPrompt = prompt;
        if (!prompt.toLowerCase().includes(domainContext) && domainContext !== "custom") {
          enhancedPrompt = `Utwórz szczegółową strukturę ${domainContext} dla: ${prompt}`;
        }

        // Przygotuj nagłówki z tokenem uwierzytelniającym, jeśli jest dostępny
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        if (authToken) {
          headers["Authorization"] = `Bearer ${authToken}`;
        }

        // Wywołaj API
        const response = await fetch(
          "http://localhost:3000/api/v1/services/chat/completion",
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              messages: [
                {
                  role: "system",
                  content: finalSystemMessage,
                },
                { role: "user", content: enhancedPrompt },
              ],
              userId,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Błąd API: ${response.status}`);
        }

        const data = await response.json();

        // Wyodrębnij i przeanalizuj odpowiedź LLM
        try {
          // Wyodrębnij zawartość z formatu odpowiedzi serwera
          const content = data.data?.message?.content;

          if (!content) {
            throw new Error("Pusta odpowiedź od LLM");
          }

          console.log("[LLMService] Treść odpowiedzi LLM:", content);

          // Próba znalezienia i sparsowania JSONa w odpowiedzi
          const jsonMatch =
            content.match(/```json\n([\s\S]*?)\n```/) ||
            content.match(/```\n?({[\s\S]*?})\n?```/) ||
            content.match(/{[\s\S]*?}(?=\n|$)/);

          let parsedData;

          if (jsonMatch) {
            try {
              const jsonText = jsonMatch[1] || jsonMatch[0];
              // Oczyszczenie tekstu JSONa
              const cleanedJson = jsonText.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
              parsedData = JSON.parse(cleanedJson);
              console.log("[LLMService] Pomyślnie sparsowano JSON z odpowiedzi");
            } catch (jsonError) {
              console.error("[LLMService] Błąd parsowania JSONa:", jsonError);
              throw new Error(`Nieprawidłowy format JSON w odpowiedzi LLM: ${(jsonError as Error).message}`);
            }
          } else {
            console.error("[LLMService] Nie znaleziono JSONa w odpowiedzi");
            console.log("[LLMService] Treść odpowiedzi:", content);
            throw new Error("Odpowiedź LLM nie zawiera prawidłowego JSONa. Sprawdź prompt systemowy.");
          }

          // Weryfikacja struktury
          if (!parsedData.scenarios || !Array.isArray(parsedData.scenarios)) {
            throw new Error("Nieprawidłowy format odpowiedzi: brak tablicy scenarios");
          }

          return parsedData;
        } catch (parseError) {
          console.error("[LLMService] Błąd parsowania odpowiedzi LLM:", parseError);
          throw new Error(
            `Nie udało się sparsować odpowiedzi LLM: ${(parseError as Error).message}`
          );
        }
      }
    } catch (err) {
      console.error("[LLMService] Błąd w generateContent:", err);
      throw new Error(`Błąd w usłudze LLM: ${(err as Error).message}`);
    }
  }
}

export default LLMService;