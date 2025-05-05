// src/utils/context.ts
// Funkcje utility do obsługi kontekstu aplikacji

/**
 * Rozwiązuje ścieżkę kontekstu - określa czy jest to ścieżka absolutna czy względna
 * 
 * @param path - Ścieżka do rozwiązania
 * @param contextBasePath - Opcjonalna bazowa ścieżka kontekstu dla ścieżek względnych
 * @returns Pełna ścieżka kontekstu
 */
export function resolveContextPath(path: string, contextBasePath?: string): string {
    if (!path) return "";
    
    // Jeśli ścieżka zawiera kropkę, uznajemy ją za absolutną
    if (path.includes(".")) {
      return path;
    }
    
    // W przeciwnym razie jest to ścieżka względna - dodajemy bazową ścieżkę kontekstu
    return contextBasePath ? `${contextBasePath}.${path}` : path;
  }
  
  /**
   * Dodaje schemat JSON do wiadomości, jeśli jest potrzebny
   * 
   * @param content - Treść wiadomości
   * @param schema - Opcjonalny schemat JSON do dodania
   * @returns Wiadomość z dodanym schematem, jeśli był potrzebny
   */
  export function addSchemaIfNeeded(content: string, schema: any): string {
    if (!schema || content.includes("```json")) {
      return content;
    }
    
    return `${content}\n\nUse the following JSON schema:\n\`\`\`json\n${JSON.stringify(schema, null, 2)}\n\`\`\``;
  }
  
  /**
   * Sprawdza, czy wszystkie wymagane pola formularza są wypełnione
   * 
   * @param formFields - Lista pól formularza
   * @param formData - Dane formularza
   * @returns Informacja, czy wszystkie wymagane pola są wypełnione
   */
  export function areRequiredFieldsFilled(
    formFields: Array<{ name: string; required?: boolean }>, 
    formData: Record<string, any>
  ): boolean {
    return formFields.every(field => 
      !field.required || (formData[field.name] !== undefined && formData[field.name] !== "")
    );
  }