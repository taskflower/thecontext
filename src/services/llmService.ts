/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/llmService.ts



// Define types for the generated setup
export interface GeneratedSetup {
  projectName: string;
  containers: Array<{
    name: string;
    documents?: Array<{
      title: string;
      content: string;
      customFields?: Record<string, any>;
    }>;
  }>;
  templates: Array<{
    name: string;
    description: string;
    defaultPriority: "low" | "medium" | "high";
    defaultSteps: Array<{
      order: number;
      type: "retrieval" | "processing" | "generation" | "validation" | "custom";
      description: string;
    }>;
  }>;
  initialTask?: {
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
    containerId?: string;
  };
}

// Configuration options for the LLM service
export interface LLMServiceConfig {
  apiKey?: string;
  endpoint?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

class LLMService {
  private config: LLMServiceConfig;

  constructor(config: LLMServiceConfig = {}) {
    this.config = {
      apiKey: config.apiKey || import.meta.env.VITE_LLM_API_KEY,
      endpoint: config.endpoint || import.meta.env.VITE_LLM_ENDPOINT || "https://api.llmservice.example/v1",
      model: config.model || "gpt-4",
      temperature: config.temperature || 0.7,
      maxTokens: config.maxTokens || 4000
    };
  }

  /**
   * Generate a project setup based on user's description
   */
  async generateProjectSetup(
    projectName: string,
    projectDescription: string,
    intent: string
  ): Promise<GeneratedSetup> {
    try {
      // Check if we're in development/demo mode
      if (import.meta.env.DEV || !this.config.apiKey) {
        return this.mockGenerateSetup(projectName, intent);
      }

      // Prepare the prompt for the LLM
      const prompt = this.createSetupPrompt(projectName, projectDescription, intent);

      // Make API request to LLM service
      const response = await fetch(this.config.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: "system",
              content: "You are an AI assistant that helps users set up project management systems. You analyze the user's requirements and generate a structured setup with containers, templates, and initial tasks."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        throw new Error(`LLM API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);

      // Validate and normalize the response
      return this.normalizeSetupResponse(result, projectName);
    } catch (error) {
      console.error("Error generating project setup:", error);
      // Fallback to mock response in case of error
      return this.mockGenerateSetup(projectName, intent);
    }
  }

  /**
   * Create a prompt for the LLM to generate a project setup
   */
  private createSetupPrompt(
    projectName: string,
    projectDescription: string,
    intent: string
  ): string {
    return `
I'm setting up a project management system with the following structure:
- Project name: "${projectName}"
- Project description: "${projectDescription}"
- My requirements: "${intent}"

I need you to generate a complete setup for this project including:
1. Containers - these are categories that hold documents
2. Templates - these are predefined workflows with steps
3. An initial task to get started

Each template should have steps of these types:
- retrieval: For finding and gathering information
- processing: For analyzing or transforming information
- generation: For creating new content or documents
- validation: For checking or approving work

Please respond with a JSON object that has the following structure:
{
  "projectName": string,
  "containers": [
    {
      "name": string,
      "documents": [
        {
          "title": string,
          "content": string
        }
      ]
    }
  ],
  "templates": [
    {
      "name": string,
      "description": string,
      "defaultPriority": "low" | "medium" | "high",
      "defaultSteps": [
        {
          "order": number,
          "type": "retrieval" | "processing" | "generation" | "validation" | "custom",
          "description": string
        }
      ]
    }
  ],
  "initialTask": {
    "title": string,
    "description": string,
    "priority": "low" | "medium" | "high"
  }
}

Make sure all the steps in each template are practical and relevant to the project requirements.
`;
  }

  /**
   * Normalize and validate the LLM response
   */
  private normalizeSetupResponse(
    response: any,
    projectName: string
  ): GeneratedSetup {
    // Default structure if response is malformed
    const defaultSetup: GeneratedSetup = {
      projectName: projectName,
      containers: [
        {
          name: "General Documents",
          documents: [
            {
              title: "Getting Started",
              content: "Welcome to your new project! This document will help you get started."
            }
          ]
        }
      ],
      templates: [
        {
          name: "Standard Workflow",
          description: "A general workflow for most tasks",
          defaultPriority: "medium",
          defaultSteps: [
            { order: 1, type: "retrieval", description: "Gather information" },
            { order: 2, type: "processing", description: "Process information" },
            { order: 3, type: "generation", description: "Generate output" }
          ]
        }
      ],
      initialTask: {
        title: "Set up project",
        description: "Configure initial project settings and structure",
        priority: "high"
      }
    };

    try {
      // Validate and normalize containers
      const containers = Array.isArray(response.containers)
        ? response.containers.map((container: any, index: number) => ({
            name: typeof container.name === "string" ? container.name : `Container ${index + 1}`,
            documents: Array.isArray(container.documents)
              ? container.documents.map((doc: any, docIndex: number) => ({
                  title: typeof doc.title === "string" ? doc.title : `Document ${docIndex + 1}`,
                  content: typeof doc.content === "string" ? doc.content : "Document content"
                }))
              : undefined
          }))
        : defaultSetup.containers;

      // Validate and normalize templates
      const templates = Array.isArray(response.templates)
        ? response.templates.map((template: any, index: number) => {
            const priority = ["low", "medium", "high"].includes(template.defaultPriority)
              ? template.defaultPriority
              : "medium";

            return {
              name: typeof template.name === "string" ? template.name : `Template ${index + 1}`,
              description: typeof template.description === "string" 
                ? template.description 
                : "Template description",
              defaultPriority: priority as "low" | "medium" | "high",
              defaultSteps: Array.isArray(template.defaultSteps)
                ? template.defaultSteps.map((step: any, stepIndex: number) => {
                    const type = ["retrieval", "processing", "generation", "validation", "custom"].includes(step.type)
                      ? step.type
                      : "custom";

                    return {
                      order: typeof step.order === "number" ? step.order : stepIndex + 1,
                      type: type as "retrieval" | "processing" | "generation" | "validation" | "custom",
                      description: typeof step.description === "string" 
                        ? step.description 
                        : `Step ${stepIndex + 1}`
                    };
                  })
                : defaultSetup.templates[0].defaultSteps
            };
          })
        : defaultSetup.templates;

      // Validate and normalize initial task
      const initialTask = response.initialTask
        ? {
            title: typeof response.initialTask.title === "string" 
              ? response.initialTask.title 
              : "Initial Task",
            description: typeof response.initialTask.description === "string" 
              ? response.initialTask.description 
              : "Get started with the project",
            priority: ["low", "medium", "high"].includes(response.initialTask.priority)
              ? response.initialTask.priority
              : "medium"
          }
        : defaultSetup.initialTask;

      return {
        projectName: typeof response.projectName === "string" ? response.projectName : projectName,
        containers,
        templates,
        initialTask
      };
    } catch (error) {
      console.error("Error normalizing LLM response:", error);
      return defaultSetup;
    }
  }

  /**
   * Generate a mock setup for development and demo purposes
   */
  private mockGenerateSetup(projectName: string, intent: string): GeneratedSetup {
    // Extract keywords from intent to customize the response
    const lowercaseIntent = intent.toLowerCase();
    const containsMarketing = lowercaseIntent.includes('marketing');
    const containsResearch = lowercaseIntent.includes('research') || lowercaseIntent.includes('badanie');
    const containsContent = lowercaseIntent.includes('content') || lowercaseIntent.includes('treści');
    const containsAnalysis = lowercaseIntent.includes('analysis') || lowercaseIntent.includes('analiza');
    
    // Choose appropriate container names based on intent
    const containerName1 = containsMarketing ? "Marketing Materials" : 
                          containsResearch ? "Research Documents" : 
                          containsContent ? "Content Library" :
                          "Project Documents";
                          
    const containerName2 = containsMarketing ? "Campaign Assets" : 
                          containsResearch ? "Data Analysis" : 
                          containsContent ? "Media Resources" :
                          "Resources";
    
    // Choose appropriate template name based on intent
    const templateName = containsMarketing ? "Marketing Campaign" : 
                        containsResearch ? "Research Analysis" : 
                        containsContent ? "Content Production" :
                        containsAnalysis ? "Data Analysis Workflow" :
                        "Standard Workflow";
    
    const templateDescription = `Template for ${
      containsMarketing ? "creating and managing marketing campaigns" : 
      containsResearch ? "conducting research and analyzing findings" : 
      containsContent ? "producing and managing content" :
      containsAnalysis ? "analyzing data and generating insights" :
      "managing project workflows"
    }`;
    
    // Generate template steps based on intent
    const templateSteps = [];
    
    if (containsResearch || containsAnalysis) {
      templateSteps.push(
        { order: 1, type: "retrieval", description: "Collect data from sources" },
        { order: 2, type: "processing", description: "Clean and prepare data for analysis" },
        { order: 3, type: "processing", description: "Analyze data for patterns and insights" },
        { order: 4, type: "generation", description: "Create analysis report" },
        { order: 5, type: "validation", description: "Verify findings and conclusions" }
      );
    } else if (containsMarketing) {
      templateSteps.push(
        { order: 1, type: "retrieval", description: "Gather market research and competitor data" },
        { order: 2, type: "processing", description: "Analyze target audience and market position" },
        { order: 3, type: "generation", description: "Create campaign strategy" },
        { order: 4, type: "generation", description: "Develop creative materials" },
        { order: 5, type: "validation", description: "Review and approve campaign elements" }
      );
    } else if (containsContent) {
      templateSteps.push(
        { order: 1, type: "retrieval", description: "Research topic and gather references" },
        { order: 2, type: "processing", description: "Outline content structure" },
        { order: 3, type: "generation", description: "Create draft content" },
        { order: 4, type: "validation", description: "Review and edit content" },
        { order: 5, type: "generation", description: "Finalize and publish content" }
      );
    } else {
      templateSteps.push(
        { order: 1, type: "retrieval", description: "Gather relevant information" },
        { order: 2, type: "processing", description: "Analyze gathered information" },
        { order: 3, type: "generation", description: "Create output document" },
        { order: 4, type: "validation", description: "Validate results" }
      );
    }
    
    // Choose appropriate initial task based on intent
    const taskTitle = containsMarketing ? "Plan Marketing Strategy" : 
                     containsResearch ? "Define Research Objectives" : 
                     containsContent ? "Content Calendar Setup" :
                     containsAnalysis ? "Initial Data Assessment" :
                     "Project Initialization";
    
    const taskDescription = `Get started with your ${projectName} project by ${
      containsMarketing ? "defining your marketing goals and target audience" : 
      containsResearch ? "establishing research questions and methodology" : 
      containsContent ? "planning your content themes and publication schedule" :
      containsAnalysis ? "identifying data sources and analysis requirements" :
      "setting up the initial project structure and goals"
    }.`;
    
    return {
      projectName: projectName,
      containers: [
        {
          name: containerName1,
          documents: [
            {
              title: "Getting Started Guide",
              content: `# Welcome to your ${projectName} project\n\nThis guide will help you get started with using this system effectively.\n\n## Key Features\n\n- Document management\n- Task templates\n- Workflow automation\n\n## Next Steps\n\n1. Review the project structure\n2. Add your first documents\n3. Create tasks using templates`
            }
          ]
        },
        {
          name: containerName2
        }
      ],
      templates: [
        {
          name: templateName,
          description: templateDescription,
          defaultPriority: "medium",
          defaultSteps: templateSteps
        },
        {
          name: "Quick Task",
          description: "Simple template for quick, one-off tasks",
          defaultPriority: "low",
          defaultSteps: [
            { order: 1, type: "retrieval", description: "Gather necessary information" },
            { order: 2, type: "generation", description: "Complete the task" },
            { order: 3, type: "validation", description: "Review results" }
          ]
        }
      ],
      initialTask: {
        title: taskTitle,
        description: taskDescription,
        priority: "high"
      }
    };
  }
}

// Export singleton instance
export const llmService = new LLMService();

export default llmService;