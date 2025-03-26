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
  estimatedTokenCost?: number;
}

export interface TokenUsage {
  prompt: number;
  completion: number;
  total: number;
}

export interface LlmResponse {
  success: boolean;
  data?: {
    message?: string;
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
    // Get default API URL from environment variables
    this.defaultApiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    
    // Get reference to auth context if available
    this.authContextRef = (authAdapter as any).appContext?.authContext || null;
    
    console.log('LlmService initialized with API base URL:', this.defaultApiBaseUrl);
  }

  // Simple estimation of token cost (1 token ≈ 4 characters)
  private estimateTokenCost(message: string): number {
    return Math.ceil(message.length / 4);
  }

  // Helper to safely call auth context methods
  private safelyCallAuthMethod(methodName: string, ...args: any[]): any {
    if (this.authContextRef && this.authContextRef[methodName] && typeof this.authContextRef[methodName] === 'function') {
      return this.authContextRef[methodName](...args);
    }
    return null;
  }

  async sendRequest(params: LlmRequestParams): Promise<LlmResponse> {
    const estimatedCost = params.estimatedTokenCost || this.estimateTokenCost(params.message);
    
    try {
      // Decrease tokens optimistically (if auth context is available)
      this.safelyCallAuthMethod('decreaseTokens', estimatedCost);
      
      // Get authorization token
      const token = await this.authAdapter.getCurrentUserToken();
      
      // Build API URL
      const apiBaseUrl = this.options.apiBaseUrl || this.defaultApiBaseUrl;
      const apiPath = this.options.apiUrl || this.defaultApiUrl;
      const baseUrlNormalized = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
      const apiPathNormalized = apiPath.startsWith('/') ? apiPath.slice(1) : apiPath;
      const apiUrl = `${baseUrlNormalized}/${apiPathNormalized}`;
      
      console.log('Making API request to:', apiUrl);
      
      // Set headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        console.warn('No auth token available for API request');
      }
      
      // Send request
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
      
      // Refresh user data after successful request
      this.safelyCallAuthMethod('refreshUserData');
      
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error("LLM API error:", error);
      
      // Refresh user data to sync token state after error
      this.safelyCallAuthMethod('refreshUserData');
      
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}