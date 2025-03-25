/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/LlmService.ts
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
    // Get default API URL from environment variables - prioritize VITE_API_URL
    this.defaultApiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    console.log('LlmService initialized with API base URL:', this.defaultApiBaseUrl);
  }

  async sendRequest(params: LlmRequestParams): Promise<LlmResponse> {
    try {
      // Get authorization token
      const token = await this.authAdapter.getCurrentUserToken();
      
      // Determine API URL - ensure proper joining of base URL and endpoint path
      const apiBaseUrl = this.options.apiBaseUrl || this.defaultApiBaseUrl;
      const apiPath = this.options.apiUrl || this.defaultApiUrl;
      
      // Normalize URL components
      const baseUrlNormalized = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
      const apiPathNormalized = apiPath.startsWith('/') ? apiPath.slice(1) : apiPath;
      
      // Join URL parts
      const apiUrl = `${baseUrlNormalized}/${apiPathNormalized}`;
      
      console.log('Making API request to:', apiUrl);
      
      // Create headers with authorization token if available
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        console.warn('No auth token available for API request');
      }
      
      // Send request to API
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
        const errorText = await response.text();
        throw new Error(`Server responded with status: ${response.status}, message: ${errorText}`);
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