import { User } from 'firebase/auth';
import { tokenService } from '@/services/tokenService';

interface Message {
  role: string;
  content: string;
}

interface LLMResponse {
  success: boolean;
  data?: {
    message: {
      role: string;
      content: string;
    };
  };
  error?: {
    code: string;
    message: string;
  };
}

interface APIError {
  code: string;
  message: string;
}

class LLMModule {
  private API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  async generateContent(messages: Message[], user: User): Promise<LLMResponse> {
    try {
      const token = await tokenService.getToken(user);
      
      const response = await fetch(`${this.API_URL}/api/v1/services/chat/completion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ messages })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error) {
          throw {
            code: errorData.error.code,
            message: errorData.error.message
          };
        }
        throw new Error('Failed to generate document');
      }

      return response.json();
    } catch (error: unknown) {
      // Type guard to check if error matches APIError interface
      if (error && typeof error === 'object' && 'code' in error) {
        const apiError = error as APIError;
        if (apiError.code === 'auth/invalid-token') {
          tokenService.clearCache();
        }
      }
      throw error;
    }
  }
}

export const llmModule = new LLMModule();