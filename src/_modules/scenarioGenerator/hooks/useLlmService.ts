// src/_modules/scenarioGenerator/hooks/useLlmService.ts
import { useState } from 'react';
import { useAuth } from '@/hooks';
import { LlmService } from '../types';

interface UseLlmServiceReturn {
  llmService: LlmService;
  isLoading: boolean;
  error: string | null;
  resetError: () => void;
}

export function useLlmService(): UseLlmServiceReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();
  
  /**
   * Reset error state
   */
  const resetError = () => {
    setError(null);
  };

  /**
   * Generate completion using the LLM API
   */
  const generateCompletion = async (prompt: string): Promise<string> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication token not available. Please log in again.');
      }

      // Prepare messages for the model
      const messages = [
        {
          role: "system",
          content: "You are an assistant helping to create scenario definitions for a flow builder application. Return precisely formatted JSON according to the provided schema. Your code must be valid TypeScript."
        },
        {
          role: "user",
          content: prompt
        }
      ];

      // API endpoint from environment variables
      const apiUrl = `${import.meta.env.VITE_API_URL || ''}/api/v1/services/gemini/chat/completion`;
      
      // Call the API
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ messages })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("LLM API Error:", errorText);
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
        } catch (e) {
          throw new Error(`API request failed: ${response.status} - ${errorText.substring(0, 100)}...`);
        }
      }

      // Process the response
      const result = await response.json();
      
      if (!result.success || !result.data?.message?.content) {
        throw new Error(result.error || "Invalid response from API");
      }

      // Extract JSON from response if wrapped in code block
      const content = result.data.message.content;
      const jsonRegex = /```(?:json)?\s*([\s\S]*?)\s*```/gm;
      const match = jsonRegex.exec(content);
      
      return match && match[1] ? match[1].trim() : content;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(errorMessage);
      console.error("Error calling LLM service:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    llmService: { generateCompletion },
    isLoading,
    error,
    resetError
  };
}