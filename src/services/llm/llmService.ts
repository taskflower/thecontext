// src/services/llm/llmService.ts
import { tokenService } from '@/services/tokenService';
import { useAuthState } from '@/hooks/useAuthState';


interface LLMMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface LLMResponse {
  content: string;
}

class LLMService {
  private apiUrl: string;
  private headers: Record<string, string> = {};
  
  constructor(apiUrl = 'http://localhost:3000/api/v1/services/chat/completion') {
    this.apiUrl = apiUrl;
  }
  
  setHeaders(headers: Record<string, string>): void {
    this.headers = { ...this.headers, ...headers };
  }
  
  setAuthToken(token: string): void {
    this.headers['Authorization'] = `Bearer ${token}`;
  }
  
  async init(): Promise<boolean> {
    try {
      const { user } = useAuthState();
      if (!user) return false;
      
      const token = await tokenService.getToken(user);
      if (!token) return false;
      
      this.setAuthToken(token);
      return true;
    } catch (error) {
      console.error('Błąd inicjalizacji LLMService:', error);
      return false;
    }
  }
  
  async sendRequest(messages: LLMMessage[]): Promise<LLMResponse> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.headers
        },
        body: JSON.stringify({ messages })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }
      
      return await response.json();
    } catch (error) {
      console.error('Błąd wywołania API LLM:', error);
      throw error;
    }
  }
}

export default new LLMService();