// llmService.ts
import { LLMMessage, LLMResponse, LLMRequest } from './types';
import { auth } from '@/firebase/config';
import { tokenService } from '@/services/tokenService';
import { authService } from '@/services/authService';

class LLMService {
  private apiUrl: string;
  
  constructor(apiUrl = 'http://localhost:3000/api/v1/services/chat/completion') {
    this.apiUrl = apiUrl;
  }
  
  async init(): Promise<boolean> {
    try {
      return true;
    } catch (error) {
      console.error('Error initializing LLMService:', error);
      return false;
    }
  }
  
  async sendRequest(messages: LLMMessage[]): Promise<LLMResponse> {
    const user = auth.currentUser;
    
    if (!user) {
      throw {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "User not authenticated",
          details: null
        }
      };
    }
    
    try {
      // Get token using tokenService
      const token = await tokenService.getToken(user);
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          messages,
          userId: user.uid,
        } as LLMRequest)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error calling LLM API:', error);
      throw error;
    }
  }
  
  // Helper method to check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const status = await authService.checkAuthStatus();
    return status !== null;
  }
  
  // Get current user ID
  getCurrentUserId(): string | null {
    return auth.currentUser?.uid || null;
  }
}

export default new LLMService();