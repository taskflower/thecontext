/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/LlmService.ts
import { PluginAuthAdapter } from "./PluginAuthAdapter";

export interface LlmServiceOptions {
  apiUrl?: string;
  apiBaseUrl?: string;
  responseFormat?: ResponseFormatOptions;
  contextJsonKey?: string; // Klucz kontekstu, który zawiera JSON jako string
}

export interface ResponseFormatOptions {
  type: "json" | "text";
  schema?: Record<string, any>;
}

export interface LlmRequestParams {
  message: string;
  userId: string;
  estimatedTokenCost?: number;
  overrideResponseFormat?: ResponseFormatOptions;
}

export interface TokenUsage {
  prompt: number;
  completion: number;
  total: number;
}

export interface LlmResponse {
  success: boolean;
  data?: {
    message?: any;
    tokenUsage?: TokenUsage;
    [key: string]: any;
  };
  error?: string;
}

export class LlmService {
  private defaultApiUrl = "api/v1/services/chat/completion";
  private defaultApiBaseUrl: string;
  private authContextRef: any | null;

  constructor(
    private authAdapter: PluginAuthAdapter, 
    private options: LlmServiceOptions = {}
  ) {
    this.defaultApiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    this.authContextRef = (authAdapter as any).appContext?.authContext || null;
    
    console.log('LlmService initialized with options:', JSON.stringify(options));
  }

  private estimateTokenCost(message: string): number {
    return Math.ceil(message.length / 4);
  }

  private safelyCallAuthMethod(methodName: string, ...args: any[]): any {
    if (this.authContextRef && this.authContextRef[methodName] && typeof this.authContextRef[methodName] === 'function') {
      return this.authContextRef[methodName](...args);
    }
    return null;
  }
  
  /**
   * Czyści tekst z formatowania markdown i innych elementów, które mogą przeszkadzać w parsowaniu JSON
   * @param text Tekst do wyczyszczenia
   * @returns Wyczyszczony tekst zawierający tylko JSON
   */
  private cleanJsonContent(text: string): string {
    if (!text) return '';
    
    // Usuń bloki kodu markdown ```json i ```
    let cleaned = text.replace(/```json\s*|\s*```/g, '');
    
    // Usuń inne potencjalne oznaczenia markdown, które mogą wystąpić
    cleaned = cleaned.replace(/`/g, '');
    
    // Usuń ewentualne komentarze w stylu JSON
    cleaned = cleaned.replace(/\/\/.*$/gm, '');
    
    // Usuń białe znaki na początku i końcu
    cleaned = cleaned.trim();
    
    // Sprawdź, czy tekst zaczyna się od { lub [ i kończy się na } lub ]
    // Jeśli nie, spróbuj znaleźć JSON w tekście
    if (!(cleaned.startsWith('{') && cleaned.endsWith('}')) && 
        !(cleaned.startsWith('[') && cleaned.endsWith(']'))) {
      
      // Szukaj pierwszego wystąpienia { lub [
      const startBrace = cleaned.indexOf('{');
      const startBracket = cleaned.indexOf('[');
      
      let startPos = -1;
      if (startBrace >= 0 && startBracket >= 0) {
        // Wybierz ten, który występuje wcześniej
        startPos = Math.min(startBrace, startBracket);
      } else if (startBrace >= 0) {
        startPos = startBrace;
      } else if (startBracket >= 0) {
        startPos = startBracket;
      }
      
      if (startPos >= 0) {
        // Znajdź odpowiadający nawias zamykający
        const isObject = cleaned.charAt(startPos) === '{';
        let depth = 1;
        let endPos = -1;
        
        for (let i = startPos + 1; i < cleaned.length; i++) {
          const char = cleaned.charAt(i);
          if ((isObject && char === '{') || (!isObject && char === '[')) {
            depth++;
          } else if ((isObject && char === '}') || (!isObject && char === ']')) {
            depth--;
            if (depth === 0) {
              endPos = i;
              break;
            }
          }
        }
        
        if (endPos > startPos) {
          cleaned = cleaned.substring(startPos, endPos + 1);
        }
      }
    }
    
    return cleaned;
  }
  
  // Poprawiona metoda do pobierania formatu JSON ze stringowego klucza kontekstowego
  private getJsonFormatFromContext(): ResponseFormatOptions | undefined {
    if (!this.options.contextJsonKey) {
      return undefined;
    }
    
    try {
      // Pobranie obiektu kontekstu
      const appContext = (this.authAdapter as any).appContext;
      if (!appContext) {
        console.error('Brak kontekstu aplikacji');
        return undefined;
      }
      
      // Sprawdź, czy klucz kontekstu wskazuje na element w systemie kontekstowym
      // Pobierz elementy kontekstowe z bieżącego workspace
      const getContextItems = appContext.getContextItems;
      if (typeof getContextItems === 'function') {
        const contextItems = getContextItems();
        
        // Szukaj elementu kontekstowego o tytule odpowiadającym kluczowi kontekstu
        const contextItem = contextItems.find((item: { title: string | undefined; }) => item.title === this.options.contextJsonKey);
        if (contextItem && contextItem.content) {
          console.log(`Znaleziono element kontekstowy o tytule "${this.options.contextJsonKey}"`);
          console.log('Zawartość elementu kontekstowego:', contextItem.content.substring(0, 100) + '...');
          
          // Spróbuj naprawić i przeanalizować zawartość jako JSON
          try {
            // Napraw potencjalne problemy z JSON - zamień pojedyncze cudzysłowy na podwójne
            const fixedContent = contextItem.content
              .replace(/(\w+):/g, '"$1":') // Naprawia nazwy kluczy bez cudzysłowów
              .replace(/'/g, '"');         // Zamienia pojedyncze cudzysłowy na podwójne
            
            // Wyświetl naprawioną zawartość do debugowania
            console.log('Naprawiona zawartość JSON:', fixedContent.substring(0, 100) + '...');
            
            // Spróbuj przeanalizować naprawioną zawartość
            let parsedContent;
            try {
              parsedContent = JSON.parse(fixedContent);
            } catch (fixError) {
              console.warn('Próba naprawy JSON nie powiodła się, próbuję alternatywną metodę:', fixError);
              
              // Spróbuj zbudować obiekt formatu "ręcznie" z tekstu
              // Zakładamy, że to obiekt o strukturze schema JSON
              return {
                type: 'json',
                schema: {
                  type: 'object',
                  description: 'Schema extracted from context item: ' + this.options.contextJsonKey,
                  properties: {}
                }
              };
            }
            
            // Sprawdź czy zawartość ma właściwy format (lub dostosuj ją)
            if (parsedContent) {
              if (typeof parsedContent === 'object') {
                const responseFormat: ResponseFormatOptions = {
                  type: 'json',
                  schema: parsedContent
                };
                console.log('Pomyślnie utworzono format JSON z zawartości kontekstu');
                return responseFormat;
              }
            }
          } catch (parseError) {
            console.error(`Błąd podczas analizy JSON z elementu kontekstowego "${this.options.contextJsonKey}":`, parseError);
            
            // Zwróć prosty format JSON jako fallback
            return {
              type: 'json',
              schema: {
                type: 'object',
                description: 'Fallback schema since parsing failed'
              }
            };
          }
        } else {
          console.warn(`Nie znaleziono elementu kontekstowego o tytule "${this.options.contextJsonKey}"`);
        }
      } else {
        // Alternatywna metoda - szukaj w danych węzła, jeśli appContext zawiera informacje o węźle
        const currentNode = appContext.currentNode;
        if (currentNode) {
          console.log('Próba pobrania danych z węzła:', currentNode);
          
          // Sprawdź, czy węzeł zawiera bezpośrednio dane formatu JSON
          if (currentNode.data && currentNode.data.jsonFormat) {
            console.log('Znaleziono format JSON w danych węzła:', currentNode.data.jsonFormat);
            return currentNode.data.jsonFormat as ResponseFormatOptions;
          }
          
          // Sprawdź, czy klucz kontekstu wskazuje na ścieżkę w danych węzła
          const keyPath = this.options.contextJsonKey.split('.');
          let value = currentNode;
          
          for (const key of keyPath) {
            if (value && typeof value === 'object' && key in value) {
              value = value[key];
            } else {
              console.warn(`Ścieżka klucza kontekstu ${this.options.contextJsonKey} nie znaleziona w węźle`);
              break;
            }
          }
          
          if (value && typeof value === 'object' && 'type' in value && value.type === 'json') {
            console.log('Znaleziono format JSON poprzez ścieżkę w węźle:', value);
            return value as ResponseFormatOptions;
          }
        }
      }
      
      // Jako ostatnią deskę ratunku, zwróć prosty format JSON
      console.warn('Nie udało się pobrać formatu JSON z kontekstu, używam domyślnego formatu');
      return {
        type: 'json',
        schema: {
          type: 'object',
          description: 'Default JSON response format'
        }
      };
    } catch (error) {
      console.error('Błąd podczas pobierania formatu JSON z kontekstu:', error);
      
      // Nawet w przypadku błędu, zwróć prosty format JSON
      return {
        type: 'json',
        schema: {
          type: 'object',
          description: 'Error fallback JSON schema'
        }
      };
    }
  }

  async sendRequest(params: LlmRequestParams): Promise<LlmResponse> {
    const estimatedCost = params.estimatedTokenCost || this.estimateTokenCost(params.message);
    
    try {
      this.safelyCallAuthMethod('decreaseTokens', estimatedCost);
      
      const token = await this.authAdapter.getCurrentUserToken();
      
      const apiBaseUrl = this.options.apiBaseUrl || this.defaultApiBaseUrl;
      const apiPath = this.options.apiUrl || this.defaultApiUrl;
      const baseUrlNormalized = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
      const apiPathNormalized = apiPath.startsWith('/') ? apiPath.slice(1) : apiPath;
      const apiUrl = `${baseUrlNormalized}/${apiPathNormalized}`;
      
      console.log('Making API request to:', apiUrl);
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        console.warn('No auth token available for API request');
      }
      
      // Pobierz format JSON z kontekstu (jeśli skonfigurowany)
      const contextFormat = this.getJsonFormatFromContext();
      const responseFormat = params.overrideResponseFormat || contextFormat || this.options.responseFormat;
      
      // Debug: Pokaż wybrane formaty
      console.log('Format kontekstowy:', contextFormat);
      console.log('Format nadpisany:', params.overrideResponseFormat);
      console.log('Format opcji:', this.options.responseFormat);
      console.log('Wybrany format odpowiedzi:', responseFormat);
      
      // Przygotuj podstawowy payload
      const requestPayload: any = {
        messages: [
          { role: "user", content: params.message }
        ],
        userId: params.userId
      };
      
      // Dodaj format odpowiedzi, jeśli określony
      if (responseFormat && responseFormat.type === "json") {
        // OpenAI-compatible format
        requestPayload.response_format = { type: "json_object" };
        
        // Dodaj instrukcję o schemacie w treści wiadomości systemu, jeśli określono schemat
        if (responseFormat.schema) {
          requestPayload.messages.unshift({
            role: "system",
            content: `Your response must be a JSON object that adheres to the following schema: ${JSON.stringify(responseFormat.schema, null, 2)}`
          });
          
          console.log('Added JSON schema instruction to system message');
        }
        
        console.log('Using JSON response format:', JSON.stringify(requestPayload.response_format));
      }
      
      console.log('Final request payload:', JSON.stringify(requestPayload));
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestPayload),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server responded with status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      
      // Próba analizy treści JSON, jeśli format odpowiedzi to JSON
      if (responseFormat?.type === 'json' && data?.data?.message?.content) {
        try {
          const content = data.data.message.content;
          if (typeof content === 'string') {
            // Wyczyść zawartość z formatowania markdown i innych potencjalnych problemów
            const cleanedContent = this.cleanJsonContent(content);
            console.log('Cleaned JSON content:', cleanedContent);
            
            try {
              data.data.message.parsedJson = JSON.parse(cleanedContent);
              console.log('Successfully parsed cleaned JSON response');
            } catch (innerError) {
              console.warn('Failed to parse cleaned JSON, trying additional methods:', innerError);
              
              // Jeśli nadal się nie udało, możemy spróbować wydobyć JSON używając regex
              const jsonRegex = /{[\s\S]*}/; // Prosty regex dla obiektu JSON
              const match = content.match(jsonRegex);
              
              if (match && match[0]) {
                try {
                  data.data.message.parsedJson = JSON.parse(match[0]);
                  console.log('Successfully parsed JSON using regex extraction');
                } catch (regexError) {
                  console.error('All JSON parsing methods failed:', regexError);
                }
              }
            }
          } else if (typeof content === 'object') {
            data.data.message.parsedJson = content;
            console.log('Response content is already an object');
          }
        } catch (error) {
          console.warn('Failed to parse JSON response:', error);
        }
      }
      
      this.safelyCallAuthMethod('refreshUserData');
      
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error("LLM API error:", error);
      
      this.safelyCallAuthMethod('refreshUserData');
      
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}