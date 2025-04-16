// src/components/debug/helpers.ts

/**
 * Funkcje pomocnicze dla komponentów debugera
 */

/**
 * Zwraca opis kroku na podstawie typu i metadanych
 * @param step Krok do opisania
 * @returns Opis tekstowy
 */
export function getStepDescription(step: any): string {
    // First try to get description from metadata
    const metadata = getStepMetadata(step);
    if (metadata.description) {
      return metadata.description;
    }
  
    // Sprawdź po templateId
    if (step.templateId) {
      switch (step.templateId) {
        case "form-step":
          return "Pobiera dane od użytkownika poprzez formularz i zapisuje je w kontekście";
        case "llm-query":
          return "Wysyła zapytanie do modelu AI i strukturyzuje odpowiedź zgodnie ze schematem";
        case "fb-api-integration":
          return "Integruje się z Facebook Marketing API";
        case "fb-campaign-preview":
          return "Wyświetla podgląd kampanii Facebook";
        case "fb-campaign-stats":
          return "Pokazuje statystyki kampanii Facebook";
        case "fb-campaign-summary":
          return "Tworzy podsumowanie kampanii Facebook";
      }
    }
  
    // Sprawdź po etykiecie
    if (step.label) {
      const label = step.label.toLowerCase();
      if (label.includes("analiza") && label.includes("ai")) {
        return "Analizuje dane przy użyciu sztucznej inteligencji według określonego schematu";
      }
      if (label.includes("form") || label.includes("formularz")) {
        return "Zbiera dane od użytkownika";
      }
      if (label.includes("podgląd")) {
        return "Wyświetla podgląd danych";
      }
      if (label.includes("podsumowanie") || label.includes("summary")) {
        return "Generuje podsumowanie danych";
      }
    }
  
    // Fallback to type-based description
    const stepType = step.type || "default";
    switch (stepType) {
      case "form":
        return "Pobiera dane od użytkownika poprzez formularz i zapisuje je w kontekście";
      case "llm":
        return "Wysyła zapytanie do modelu AI i strukturyzuje odpowiedź zgodnie ze schematem";
      case "api":
        return "Integruje się z zewnętrznym API";
      case "preview":
        return "Wyświetla podgląd danych z kontekstu";
      case "summary":
        return "Tworzy podsumowanie danych z kontekstu";
      default:
        return "Przetwarza dane w kontekście";
    }
  }
  
  /**
   * Pobiera metadane kroku, jeśli istnieją
   * @param step Krok do pobrania metadanych
   * @returns Obiekt metadanych lub pusty obiekt
   */
  export function getStepMetadata(step: any): any {
    return step.metadata || {};
  }
  
  /**
   * Zwraca etykietę typu kroku na podstawie typu
   * @param type Typ kroku
   * @returns Etykieta typu
   */
  export function getTypeLabel(type: string): string {
    switch (type) {
      case "form":
        return "Formularz";
      case "llm":
        return "AI Model";
      case "api":
        return "API";
      case "preview":
        return "Podgląd";
      case "summary":
        return "Podsumowanie";
      default:
        return "Element";
    }
  }
  
  /**
   * Zwraca ikonę dla kroku na podstawie typu
   * @param type Typ kroku 
   * @returns Emoji reprezentujące typ
   */
  export function getStepIcon(type: string): string {
    switch (type) {
      case "form":
        return "📝";
      case "llm":
        return "🤖";
      case "api":
        return "🔌";
      case "preview":
        return "👁️";
      case "summary":
        return "📊";
      default:
        return "📄";
    }
  }
  
  /**
   * Funkcja do wykrywania typów danych w kontekście
   * @param value Wartość do sprawdzenia
   * @returns Typ danych jako string
   */
  export function detectDataType(value: any): string {
    if (value === null) return "null";
    if (value === undefined) return "undefined";
    
    if (Array.isArray(value)) {
      return "array";
    }
    
    if (typeof value === "object") {
      // Sprawdź czy jest to obiekt typu Date
      if (value instanceof Date) {
        return "date";
      }
      return "object";
    }
    
    return typeof value;
  }
  
  /**
   * Formatuje wartość do wyświetlenia w debugerze
   * @param value Wartość do sformatowania
   * @returns Sformatowana wartość jako string
   */
  export function formatValue(value: any): string {
    const type = detectDataType(value);
    
    switch (type) {
      case "null":
        return "null";
      case "undefined":
        return "undefined";
      case "string":
        return value.length > 50 ? `"${value.substring(0, 50)}..."` : `"${value}"`;
      case "number":
      case "boolean":
        return String(value);
      case "date":
        return value.toISOString();
      case "array":
        return `Array(${value.length})`;
      case "object":
        return `Object { ${Object.keys(value).length} props }`;
      default:
        return String(value);
    }
  }