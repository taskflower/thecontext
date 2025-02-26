/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/setupLLMService/llmService.ts
import { PromptBuilder } from "./promptBuilder";
import { DefaultTemplatesFactory } from "./defaultTemplatesFactory";
import { 
  LLMMessage, 
  LLMRequest, 
  LLMResponse, 
  Priority, 
  StepType, 
  IGeneratedSetup 
} from "./types";

export class LLMService {
  private apiUrl: string;
  private userId: string;
  private authToken: string | null = null;

  constructor(
    apiUrl = "http://localhost:3000/api/v1/services/chat/completion", 
    userId = ""
  ) {
    this.apiUrl = apiUrl;
    this.userId = userId;
  }

  setAuthToken(token: string): void {
    this.authToken = token;
  }

  setUserId(userId: string): void {
    this.userId = userId;
  }

  private async sendRequest(messages: LLMMessage[]): Promise<LLMResponse> {
    if (!this.authToken) {
      throw {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Missing authorization token",
          details: null
        }
      };
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.authToken}`
        },
        body: JSON.stringify({
          messages,
          userId: this.userId,
        } as LLMRequest),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      return await response.json();
    } catch (error) {
      console.error("Error calling LLM API:", error);
      throw error;
    }
  }

  async generateProjectSetup(
    projectName: string,
    projectDescription: string,
    intent: string
  ): Promise<IGeneratedSetup> {
    const messages = PromptBuilder.createProjectSetupPrompt(
      projectName,
      projectDescription,
      intent
    );

    const response = await this.sendRequest(messages);

    try {
      const jsonString = this.extractJsonFromResponse(response.content);
      const setupData = JSON.parse(jsonString) as IGeneratedSetup;
      
      return this.validateAndNormalizeSetup(setupData, projectName);
    } catch (error) {
      console.error("Failed to parse LLM response:", error);
      return this.createDefaultSetup(projectName, intent);
    }
  }

  private extractJsonFromResponse(content: string): string {
    // Try to extract JSON if wrapped in markdown code blocks
    const jsonMatch = content.match(/```(?:json)?([\s\S]*?)```/);
    if (jsonMatch && jsonMatch[1]) {
      return jsonMatch[1].trim();
    }

    // If no code blocks, try to find content between curly braces
    const jsonObjectMatch = content.match(/\{[\s\S]*\}/);
    if (jsonObjectMatch) {
      return jsonObjectMatch[0];
    }

    // If all else fails, return the original content
    return content;
  }

  private validateAndNormalizeSetup(setup: any, projectName: string): IGeneratedSetup {
    return {
      projectName: setup.projectName || projectName,
      containers: this.validateContainers(setup.containers || []),
      templates: this.validateTemplates(setup.templates || []),
      initialTask: this.validateInitialTask(setup.initialTask)
    };
  }

  private validateContainers(containers: any[]): IGeneratedSetup['containers'] {
    if (!Array.isArray(containers)) return [];
    
    return containers.map(container => ({
      name: container.name || "Unnamed Container",
      documents: this.validateDocuments(container.documents)
    }));
  }

  private validateDocuments(documents: any): { title: string; content: string }[] | undefined {
    if (!Array.isArray(documents)) return undefined;
    
    return documents.map(doc => ({
      title: doc.title || "Untitled Document",
      content: doc.content || ""
    }));
  }

  private validateTemplates(templates: any[]): IGeneratedSetup['templates'] {
    if (!Array.isArray(templates)) return [];
    
    return templates.map(template => ({
      name: template.name || "Unnamed Template",
      description: template.description || "",
      defaultPriority: this.validatePriority(template.defaultPriority),
      defaultSteps: this.validateDefaultSteps(template.defaultSteps)
    }));
  }

  private validateDefaultSteps(steps: any[]): { order: number; type: StepType; description: string }[] {
    if (!Array.isArray(steps)) return [];
    
    return steps.map((step, index) => ({
      order: step.order || index + 1,
      type: this.validateStepType(step.type),
      description: step.description || `Step ${index + 1}`
    }));
  }

  private validateInitialTask(task: any): IGeneratedSetup['initialTask'] | undefined {
    if (!task) return undefined;
    
    return {
      title: task.title || "Initial Task",
      description: task.description || "",
      priority: this.validatePriority(task.priority),
      containerId: task.containerId
    };
  }

  private validatePriority(priority: any): Priority {
    if (priority === "low" || priority === "medium" || priority === "high") {
      return priority;
    }
    return "medium";
  }

  private validateStepType(type: any): StepType {
    const validTypes: StepType[] = ["retrieval", "processing", "generation", "validation", "custom"];
    
    if (validTypes.includes(type)) {
      return type;
    }
    return "custom";
  }

  private createDefaultSetup(projectName: string, intent: string): IGeneratedSetup {
    return DefaultTemplatesFactory.createDefaultSetup(projectName, intent);
  }
}

export default new LLMService();