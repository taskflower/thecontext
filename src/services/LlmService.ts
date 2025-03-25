/* eslint-disable @typescript-eslint/no-explicit-any */
import { PluginAuthAdapter } from "./PluginAuthAdapter";

export interface LlmServiceOptions {
  apiUrl?: string;
  apiBaseUrl?: string;
}

export interface LlmRequestParams {
  message: string;
  userId: string;
}

export interface LlmResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export class LlmService {
  private defaultApiUrl = "api/v1/services/chat/completion";
  private defaultApiBaseUrl: string;

  constructor(
    private authAdapter: PluginAuthAdapter, 
    private options: LlmServiceOptions = {}
  ) {
    // Pobierz domyślny URL API z zmiennych środowiskowych - priorytetowo użyj VITE_API_URL
    this.defaultApiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    console.log('LlmService initialized with API base URL:', this.defaultApiBaseUrl);
  }

  async sendRequest(params: LlmRequestParams): Promise<LlmResponse> {
    try {
      // Pobierz token autoryzacyjny
      const token = await this.authAdapter.getCurrentUserToken();
      
      // Określ URL API - zapewnij prawidłowe połączenie bazowego URL i ścieżki endpointu
      const apiBaseUrl = this.options.apiBaseUrl || this.defaultApiBaseUrl;
      const apiPath = this.options.apiUrl || this.defaultApiUrl;
      
      // Usuń końcowy slash z baseUrl i początkowy slash z apiPath (jeśli istnieją)
      const baseUrlNormalized = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
      const apiPathNormalized = apiPath.startsWith('/') ? apiPath.slice(1) : apiPath;
      
      // Połącz części URL
      const apiUrl = `${baseUrlNormalized}/${apiPathNormalized}`;
      
      console.log('Making API request to:', apiUrl, '(Base URL from env:', import.meta.env.VITE_API_URL, ')');
      
      // Utwórz nagłówki z tokenem autoryzacyjnym, jeśli dostępny
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Wyślij żądanie do API
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: [
            { role: "user", content: params.message }
          ],
          userId: params.userId
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error("LLM API error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}