/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/LLMService.ts
import { MOCK_LLM_RESPONSE } from '../mockData';

// Interfaces
export interface LLMRequest {
  prompt: string;
  systemMessage?: string;
  userId?: string;
  useMock?: boolean;
}

export interface LLMResponse {
  scenarios: any[];
  tasks: any[];
  steps: any[];
}

/**
 * Service responsible for interacting with the LLM API
 */
class LLMService {
  /**
   * Generate content using the LLM
   * 
   * @param options Request options
   * @returns LLM response data
   */
  public static async generateContent(options: LLMRequest): Promise<LLMResponse> {
    const { prompt, systemMessage, userId = 'user123', useMock = false } = options;
    
    console.log("[LLMService] Generating content, useMock:", useMock);
    
    try {
      if (useMock) {
        console.log("[LLMService] Using mock data response");
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        return MOCK_LLM_RESPONSE;
      } else {
        console.log("[LLMService] Making real API call");
        
        // Prepare the system message to instruct the LLM
        const defaultSystemMessage = `You are an AI assistant specialized in creating detailed marketing scenarios, tasks, and steps. 
        Format your response as a JSON object with these keys:
        - scenarios: an array of scenario objects with fields: id, title, description, objective, connections (array of other scenario ids)
        - tasks: an array of task objects with fields: scenarioRef (matching a scenario id), title, description, priority
        - steps: an array of step objects with fields: taskRef (matching a task title), title, description, type (text-input, simple-plugin, or step-reference)
        
        Create 3-5 connected scenarios with 2-3 tasks per scenario and 2-3 steps per task.`;

        // Prepare the prompt
        const enhancedPrompt = `Create a detailed marketing campaign structure for: ${prompt}`;

        // Call the API
        const response = await fetch('http://localhost:3000/api/v1/services/chat/completion', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              { role: "system", content: systemMessage || defaultSystemMessage },
              { role: "user", content: enhancedPrompt }
            ],
            userId
          }),
        });
        
        console.log("[LLMService] API response status:", response.status);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        console.log("[LLMService] API response data:", data);
        
        // Extract and parse the LLM response
        try {
          const content = data.choices[0]?.message?.content;
          
          if (!content) {
            throw new Error("Empty response from LLM");
          }
          
          console.log("[LLMService] LLM response content:", content);
          
          // Try to find and parse JSON in the response
          const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                           content.match(/{[\s\S]*}/);
                           
          let parsedData;
          
          if (jsonMatch) {
            parsedData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          } else {
            // If no JSON block is found, try to parse the entire content
            parsedData = JSON.parse(content);
          }
          
          console.log("[LLMService] Parsed LLM data:", parsedData);
          
          // Validate the structure
          if (!parsedData.scenarios || !Array.isArray(parsedData.scenarios)) {
            throw new Error("Invalid response format: missing scenarios array");
          }
          
          return parsedData;
        } catch (parseError) {
          console.error("[LLMService] Error parsing LLM response:", parseError);
          throw new Error(`Failed to parse LLM response: ${(parseError as Error).message}`);
        }
      }
    } catch (err) {
      console.error("[LLMService] Error in generateContent:", err);
      throw new Error(`Error in LLM service: ${(err as Error).message}`);
    }
  }
}

export default LLMService;