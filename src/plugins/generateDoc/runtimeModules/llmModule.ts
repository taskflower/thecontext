// src/plugins/generateDoc/runtimeModules/llmModule.ts
import { User } from 'firebase/auth';

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

export const llmModule = {
  generateContent: async (messages: Message[], user: User): Promise<LLMResponse> => {
    const idToken = await user.getIdToken();
    
    const response = await fetch('http://localhost:3000/api/v1/services/chat/completion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
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
  }
};
