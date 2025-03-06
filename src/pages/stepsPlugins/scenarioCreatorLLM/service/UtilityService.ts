// src/pages/stepsPlugins/scenarioCreatorLLM/service/UtilityService.ts
export class UtilityService {
    /**
     * Generuje datę zakończenia
     * 
     * @param daysFromNow Liczba dni od teraz
     * @returns Data w formacie YYYY-MM-DD
     */
    public static generateDueDate(daysFromNow: number = 30): string {
      const date = new Date();
      date.setDate(date.getDate() + daysFromNow);
      return date.toISOString().split('T')[0];
    }
    
    /**
     * Funkcja narzędziowa do tworzenia opóźnień
     * 
     * @param ms Milisekundy opóźnienia
     * @returns Promise rozwiązywany po opóźnieniu
     */
    public static delay(ms: number): Promise<void> {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  }