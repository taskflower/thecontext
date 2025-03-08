/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/stepsPlugins/llmQuery/service/LLMService.ts

import { getStepData } from '@/components/plugins/PreviousStepsSelect';

// Keep the original interfaces to maintain compatibility
export interface LLMRequest {
  prompt: string;
  authToken?: string | null;
  conversationData?: Array<{ role: string; content: string }>;
}

export interface LLMResponse {
  content?: string;
  messages?: Array<{ role: string; content: string }>;
  [key: string]: any;
}

export interface ReferenceData {
  id: string;
  title: string;
  status: string;
  type: string;
  result: any;
}

/**
 * Service responsible for interacting with the LLM API and managing conversation data
 */
class LLMService {
  /**
   * Generate content using the LLM
   */
  public static async generateContent(
    options: LLMRequest
  ): Promise<LLMResponse> {
    const { prompt, authToken = null, conversationData = [] } = options;

    try {
      // Prepare authentication headers
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      // Create messages array starting with conversation history if available
      const messages = [
        ...conversationData,
        { role: "user", content: prompt }
      ];

      // Get authenticated user ID or use a default
      const userId = "anonymous"; // You might want to pass this from the component

      // API call with proper payload structure
      const response = await fetch(
        "http://localhost:3000/api/v1/services/chat/completion",
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            messages,
            userId  
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.data?.message?.content;

      if (!content) {
        throw new Error("Empty response from LLM");
      }

      return { content, messages };
    } catch (err) {
      console.error("LLM Service error:", err);
      throw new Error(`LLM Error: ${(err as Error).message}`);
    }
  }

  /**
   * Fetch reference data from a previous step
   */
  public static getReferenceData(referenceStepId: string): ReferenceData | null {
    if (!referenceStepId) return null;
    
    const stepDataResult = getStepData(referenceStepId, false);

    if (stepDataResult.step) {
      return {
        id: stepDataResult.step.id,
        title: stepDataResult.title,
        status: stepDataResult.step.status,
        type: stepDataResult.step.type,
        result: stepDataResult.data,
      };
    }
    
    return null;
  }

  /**
   * Extract conversation data from reference step if available
   */
  public static getConversationDataFromReference(referenceData: ReferenceData | null): any[] | null {
    if (!referenceData || referenceData.status !== "completed" || !referenceData.result) {
      return null;
    }

    if (referenceData.result.conversationData) {
      return referenceData.result.conversationData;
    } else if (referenceData.result.messages) {
      return referenceData.result.messages;
    }

    return null;
  }

  /**
   * Process LLM query and handle conversation data
   */
  public static async processQuery(
    step: any,
    authToken: string | null,
    referenceData: ReferenceData | null
  ): Promise<{
    result: LLMResponse;
    fullResult: any;
    newConversationItems: any[];
  }> {
    // Get conversation data from reference - required now
    const conversationData = this.getConversationDataFromReference(referenceData);
    
    if (!conversationData || conversationData.length === 0) {
      throw new Error("Brak danych konwersacyjnych z referencji");
    }
    
    // Get the last user message as prompt
    const lastUserMessage = [...conversationData].reverse().find(msg => msg.role === "user");
    
    if (!lastUserMessage) {
      throw new Error("Brak wiadomości użytkownika w referencyjnych danych konwersacji");
    }
    
    const prompt = lastUserMessage.content;

    // Generate content
    const llmResponse = await this.generateContent({
      prompt,
      conversationData,
      authToken,
    });

    // Only add assistant's response to conversation
    const newConversationItems = [
      { role: "assistant", content: llmResponse.content || "Brak odpowiedzi" }
    ];

    // Extend conversation data
    const fullConversationData = [...conversationData, ...newConversationItems];

    // Prepare full result with conversation data
    const fullResult = {
      ...llmResponse,
      conversationData: fullConversationData,
    };

    return {
      result: llmResponse,
      fullResult,
      newConversationItems,
    };
  }
}

export default LLMService;