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
        const contextItem = contextItems.find(item => item.title === this.options.contextJsonKey);
        if (contextItem && contextItem.content) {
          console.log(`Znaleziono element kontekstowy o tytule "${this.options.contextJsonKey}"`);
          
          try {
            // Spróbuj przeanalizować zawartość jako JSON
            const parsedContent = JSON.parse(contextItem.content);
            
            // Sprawdź czy zawartość ma właściwy format (lub dostosuj ją)
            if (parsedContent) {
              if (typeof parsedContent === 'object') {
                const responseFormat: ResponseFormatOptions = {
                  type: 'json',
                  schema: parsedContent
                };
                console.log('Pomyślnie utworzono format JSON z zawartości kontekstu:', responseFormat);
                return responseFormat;
              }
            }
          } catch (parseError) {
            console.error(`Błąd podczas analizy JSON z elementu kontekstowego "${this.options.contextJsonKey}":`, parseError);
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
              return undefined;
            }
          }
          
          if (value && typeof value === 'object' && 'type' in value && value.type === 'json') {
            console.log('Znaleziono format JSON poprzez ścieżkę w węźle:', value);
            return value as ResponseFormatOptions;
          }
        }
      }
      
      console.warn('Nie udało się pobrać formatu JSON z kontekstu');
      return undefined;
    } catch (error) {
      console.error('Błąd podczas pobierania formatu JSON z kontekstu:', error);
      return undefined;
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
            data.data.message.parsedJson = JSON.parse(content);
            console.log('Successfully parsed JSON response');
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